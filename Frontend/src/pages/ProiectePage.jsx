import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import API from '../constants/apiRoutes';
import { useNavigate } from 'react-router-dom';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

const statusCuloare = {
  'in desfasurare': '#6a9955',
  'finalizat':      '#4ec9b0',
  'anulat':         '#ff22a1',
  'planificat':     '#f39c12',
};

export default function ProiectePage() {
  const { user }        = useAuth();
  const rol             = user?.rol || '';

  const [proiecte, setProiecte]         = useState([]);
  const [alocari, setAlocari]           = useState([]);
  const [orasDirector, setOras]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [erori, setErori]               = useState([]);
  const [succes, setSucces]             = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [tabActiv, setTabActiv]         = useState('proiecte');

  const navigate = useNavigate();

  const accesInterzis = rol === 'hr_specialist';
  const poateCreea    = ['hr_manager', 'ceo'].includes(rol);

  const [form, setForm] = useState({
    nume: '', descriere: '', data_start: '',
    data_sfarsit: '', status: 'planificat', buget: '',
  });

  useEffect(() => {
    if (rol && !accesInterzis) {
      incarcaDateProiecte();
    } else {
      setLoading(false);
    }
  }, [rol]);

  const incarcaDateProiecte = async () => {
    setLoading(true);
    setErori([]);

    try {
      if (rol === 'director') {
        const [projRes, profRes] = await Promise.all([
          api.get(API.DIRECTOR_PROIECTE),
          api.get('/utilizatori/profil-meu').catch(() => null)
        ]);
        setProiecte(projRes.data.date || projRes.data || []);
        if (profRes?.data?.oras) setOras(profRes.data.oras);
        
        const alocRes = await api.get(API.ALOCARI).catch(() => ({ data: [] }));
        setAlocari(alocRes.data || []);
      } 
      else if (rol === 'project_manager') {
        // 1. Aflăm id_angajat-ul utilizatorului curent (PM)
        const profilRes = await api.get('/utilizatori/profil-meu').catch(() => null);
        const myAngajatId = profilRes?.data?.id_angajat ? Number(profilRes.data.id_angajat) : null;

        // 2. Preluăm echipa lui (subordonații săi)
        const echipaRes = await api.get(API.VIEW_TEAM_LEADER).catch(() => ({ data: [] }));
        const dateEchipa = echipaRes.data.date_echipa || echipaRes.data || [];

        // Creăm un Set cu ID-urile tuturor membrilor din echipa lui + ID-ul lui propriu
        const idUriOameniRelevanti = new Set();
        if (myAngajatId) idUriOameniRelevanti.add(myAngajatId);
        dateEchipa.forEach(m => {
          if (m.id_angajat) idUriOameniRelevanti.add(Number(m.id_angajat));
        });

        // 3. Preluăm toate proiectele globale și toate alocările globale
        const [toateProjRes, toateAlocRes] = await Promise.all([
          api.get(API.PROIECTE),
          api.get(API.ALOCARI).catch(() => ({ data: [] }))
        ]);

        const toateProiectele = toateProjRes.data || [];
        const toateAlocarile  = toateAlocRes.data || [];

        // 4. Identificăm ID-urile proiectelor în care este implicat PM-ul sau echipa sa prin tabela de alocări
        const idUriProiecteAlocate = new Set();
        toateAlocarile.forEach(aloc => {
          if (idUriOameniRelevanti.has(Number(aloc.id_angajat))) {
            idUriProiecteAlocate.add(Number(aloc.id_proiect));
          }
        });

        // 5. Filtrăm proiectele (păstrăm proiectul dacă PM-ul sau echipa are alocare pe el, SAU dacă PM-ul este trecut explicit ca manager pe el)
        const proiecteFiltrate = toateProiectele.filter(p => {
          const sePotrivesteID = idUriProiecteAlocate.has(Number(p.id_proiect));
          const esteManagerExplicit = p.id_manager && Number(p.id_manager) === myAngajatId;
          const esteLiderExplicit = p.id_lider && Number(p.id_lider) === myAngajatId;
          
          return sePotrivesteID || esteManagerExplicit || esteLiderExplicit;
        });

        // Reconstruim lista de ID-uri finale de proiecte vizibile pentru alocări
        const idUriProiecteFinale = new Set(proiecteFiltrate.map(p => Number(p.id_proiect)));

        // 6. Filtrăm alocările pentru a le afișa doar pe cele legate de proiectele vizibile lui
        const alocariFiltrate = toateAlocarile.filter(aloc => 
          idUriProiecteFinale.has(Number(aloc.id_proiect))
        );

        // Îmbunătățim datele din alocări cu nume din echipa dacă lipsesc din server
        const alocariImbunatatite = alocariFiltrate.map(aloc => {
          const membruEchipa = dateEchipa.find(m => Number(m.id_angajat) === Number(aloc.id_angajat));
          const proi = proiecteFiltrate.find(p => Number(p.id_proiect) === Number(aloc.id_proiect));
          
          return {
            ...aloc,
            nume_angajat: aloc.nume_angajat || (membruEchipa ? `${membruEchipa.prenume} ${membruEchipa.nume}` : (Number(aloc.id_angajat) === myAngajatId ? 'Eu (Manager)' : `Angajat ID ${aloc.id_angajat}`)),
            nume_proiect: aloc.nume_proiect || (proi ? proi.nume : `Proiect ID ${aloc.id_proiect}`)
          };
        });

        setProiecte(proiecteFiltrate);
        setAlocari(alocariImbunatatite);
      } 
      else {
        // Pentru CEO, HR Manager, etc.
        const [projRes, alocRes] = await Promise.all([
          api.get(API.PROIECTE),
          api.get(API.ALOCARI).catch(() => ({ data: [] }))
        ]);
        setProiecte(projRes.data || []);
        setAlocari(alocRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setErori(['Nu s-au putut incarca datele despre proiecte si alocari.']);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErori([]);
    setSucces('');

    const payload = {
      ...form,
      buget: form.buget ? parseFloat(form.buget) : null
    };

    api.post(API.PROIECTE, payload)
      .then(() => {
        setSucces('Proiectul a fost creat cu succes!');
        setForm({ nume: '', descriere: '', data_start: '', data_sfarsit: '', status: 'planificat', buget: '' });
        setShowForm(false);
        incarcaDateProiecte();
      })
      .catch(err => {
        setErori([err.response?.data?.detalii || 'Eroare la salvare proiect.']);
      });
  };

  const formatData = (d) => d ? new Date(d).toLocaleDateString('ro-RO') : '—';
  const formatRON  = (v) => v ? `${Number(v).toLocaleString('ro-RO')} RON` : '—';

  if (accesInterzis) {
    return (
      <div style={{ fontFamily: 'Consolas, monospace', color: '#808080', padding: '20px' }}>
        <h2 style={{ color: roz, fontSize: '18px' }}><span style={{ color: cyan }}>{'>'}</span> PROIECTE</h2>
        <p style={{ marginTop: '16px', fontSize: '13px' }}>// Rolul dvs. nu are permisiunea de a vizualiza proiectele.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Consolas, monospace' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
            <span style={{ color: cyan }}>{'>'}</span> MANAGEMENT PROIECTE
          </h2>
          <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
            {rol === 'project_manager'
              ? `Afișate: ${proiecte.length} proiecte în care ești implicat tu sau echipa ta.`
              : orasDirector 
                ? `Filtrare automata pentru locatia: ${orasDirector.toUpperCase()}`
                : 'Planificarea si urmarirea proiectelor companiei'
            }
          </p>
        </div>

        {poateCreea && (
          <button onClick={() => { setShowForm(!showForm); setErori([]); }} style={btnStyle(showForm ? '#808080' : roz)}>
            {showForm ? 'ANULEAZA' : '+ PROIECT NOU'}
          </button>
        )}
      </div>

      {/* Navigare Tab-uri */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '1px' }}>
        <button 
          onClick={() => setTabActiv('proiecte')}
          style={tabStyle(tabActiv === 'proiecte')}
        >
          PROIECTE ({proiecte.length})
        </button>
        <button 
          onClick={() => setTabActiv('alocari')}
          style={tabStyle(tabActiv === 'alocari')}
        >
          ALOCARI ANGAJATI ({alocari.length})
        </button>
      </div>

      {/* Erori si Succes */}
      {erori.length > 0 && (
        <div style={{ backgroundColor: '#2d1a1a', border: `1px solid ${roz}`, padding: '12px 16px', marginBottom: '20px' }}>
          {erori.map((e, i) => <p key={i} style={{ color: roz, margin: '2px 0', fontSize: '12px' }}>ERROR: {e}</p>)}
        </div>
      )}
      {succes && (
        <div style={{ backgroundColor: '#1a2d1a', border: '1px solid #6a9955', padding: '12px 16px', marginBottom: '20px' }}>
          <p style={{ color: '#6a9955', margin: 0, fontSize: '12px' }}>✓ {succes}</p>
        </div>
      )}

      {/* Formular Adaugare */}
      {showForm && poateCreea && (
        <div style={{
          backgroundColor: '#252526', border: '1px solid #333',
          borderLeft: `3px solid ${roz}`, padding: '24px', marginBottom: '28px'
        }}>
          <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 20px' }}>DESCHIDE PROIECT NOU</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Camp label="NUME PROIECT" name="nume" value={form.nume} onChange={handleChange} required />
              <Camp label="BUGET (RON)" name="buget" type="number" value={form.buget} onChange={handleChange} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '180px' }}>
                <label style={{ color: cyan, fontSize: '11px' }}>STATUS INITIAL:</label>
                <select name="status" value={form.status} onChange={handleChange} style={selectStyle}>
                  <option value="planificat">Planificat</option>
                  <option value="in desfasurare">In Desfasurare</option>
                  <option value="finalizat">Finalizat</option>
                  <option value="anulat">Anulat</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Camp label="DATA INCEPUT" name="data_start" type="date" value={form.data_start} onChange={handleChange} required />
              <Camp label="DATA FINAL ESTIMATA" name="data_sfarsit" type="date" value={form.data_sfarsit} onChange={handleChange} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: cyan, fontSize: '11px' }}>DESCRIERE PROIECT:</label>
              <textarea name="descriere" value={form.descriere} onChange={handleChange} rows="3" style={textareaStyle}></textarea>
            </div>

            <button type="submit" style={{ ...btnStyle(roz), alignSelf: 'flex-start', padding: '10px 24px', border: `2px solid ${roz}` }}>
              SALVEAZA PROIECT
            </button>
          </form>
        </div>
      )}

      {loading && <p style={{ color: '#808080' }}>Se incarca datele...</p>}

      {/* RENDER TAB 1: PROIECTE */}
      {!loading && tabActiv === 'proiecte' && (
        <>
          {proiecte.length === 0 ? (
            <p style={{ color: '#808080' }}>Nu au fost gasite proiecte alocate contului dvs.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {proiecte.map(p => (
                <div key={p.id_proiect} style={{
                  backgroundColor: '#252526', border: '1px solid #333',
                  borderTop: `2px solid ${statusCuloare[p.status] || '#555'}`, padding: '18px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{
                        fontSize: '10px', padding: '2px 6px',
                        backgroundColor: '#1e1e1e', color: statusCuloare[p.status],
                        border: `1px solid ${statusCuloare[p.status]}`
                      }}>
                        {p.status.toUpperCase()}
                      </span>
                      <span style={{ color: '#6a9955', fontSize: '12px', fontWeight: 'bold' }}>
                        {formatRON(p.buget)}
                      </span>
                    </div>

                    <h4 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '15px' }}>{p.nume}</h4>
                    <p style={{ color: '#808080', fontSize: '12px', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                      {p.descriere || 'Fara descriere furnizata.'}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#d4d4d4' }}>
                      📅 {formatData(p.data_start)} - {formatData(p.data_sfarsit)}
                    </div>
                    <div style={{ color: '#555', fontSize: '10px' }}>
                      ID: {p.id_proiect}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* RENDER TAB 2: ALOCARI */}
      {!loading && tabActiv === 'alocari' && (
        <>
          {alocari.length === 0 ? (
            <p style={{ color: '#808080' }}>Nu exista alocari active de angajati pe proiectele dvs.</p>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid #333', backgroundColor: '#252526' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${roz}`, backgroundColor: '#2d2d2d' }}>
                    <th style={thStyle}>ID ALOCARE</th>
                    <th style={thStyle}>ANGAJAT</th>
                    <th style={thStyle}>PROIECT ASOCIAT</th>
                    <th style={thStyle}>DATA ALOCARII</th>
                    <th style={thStyle}>NORMA (ORE/ZI)</th>
                  </tr>
                </thead>
                <tbody>
                  {alocari.map((a, idx) => (
                    <tr key={a.id_alocare || idx} style={{ backgroundColor: idx % 2 === 0 ? '#1e1e1e' : '#252526', borderBottom: '1px solid #2d2d2d' }}>
                      <td style={tdStyle}>{a.id_alocare || '—'}</td>
                      <td style={{ ...tdStyle, color: 'white', fontWeight: 'bold' }}>{a.nume_angajat}</td>
                      <td style={{ ...tdStyle, color: cyan }}>{a.nume_proiect}</td>
                      <td style={tdStyle}>{formatData(a.data_alocare)}</td>
                      <td style={{ ...tdStyle, color: '#6a9955' }}>{a.ore_pe_zi || 8} ore/zi</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Camp({ label, name, value, onChange, type = 'text', placeholder, required }) {
  const cyan = '#4ec9b0';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
      <label style={{ color: cyan, fontSize: '11px' }}>
        {label}{required && <span style={{ color: '#ff22a1' }}> *</span>}
      </label>
      <input type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required} style={inputStyle} />
    </div>
  );
}

const btnStyle = (culoare) => ({
  backgroundColor: 'transparent', color: culoare,
  border: `1px solid ${culoare}`, padding: '8px 16px',
  fontFamily: 'Consolas, monospace', fontSize: '12px',
  cursor: 'pointer', letterSpacing: '0.5px', whiteSpace: 'nowrap',
});

const tabStyle = (activ) => ({
  backgroundColor: activ ? '#252526' : 'transparent',
  color: activ ? roz : '#808080',
  border: '1px solid #333',
  borderBottom: activ ? '1px solid #252526' : '1px solid #333',
  padding: '10px 20px',
  fontFamily: 'Consolas, monospace',
  fontSize: '12px',
  cursor: 'pointer',
  zIndex: 1,
});

const thStyle = { padding: '10px 12px', color: cyan, fontWeight: 'normal' };
const tdStyle = { padding: '10px 12px', color: '#9cdcfe' };

const inputStyle = {
  backgroundColor: '#3c3c3c', color: 'white',
  border: '1px solid #555', padding: '8px 12px',
  fontFamily: 'Consolas, monospace', fontSize: '13px',
  outline: 'none', width: '100%', boxSizing: 'border-box'
};

const selectStyle = {
  backgroundColor: '#3c3c3c', color: 'white',
  border: '1px solid #555', padding: '8px 12px',
  fontFamily: 'Consolas, monospace', fontSize: '13px',
  outline: 'none', width: '100%'
};

const textareaStyle = {
  backgroundColor: '#3c3c3c', color: 'white',
  border: '1px solid #555', padding: '8px 12px',
  fontFamily: 'Consolas, monospace', fontSize: '13px',
  outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical'
};