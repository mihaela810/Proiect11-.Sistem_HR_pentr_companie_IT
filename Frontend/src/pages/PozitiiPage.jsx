import { useState, useEffect } from 'react';
import api from '../api/axios';
import API from '../constants/apiRoutes';
import { useAuth } from '../hooks/useAuth';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function PozitiiPage() {
  const [pozitii, setPozitii]           = useState([]);
  const [departamente, setDepartamente] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [erori, setErori]               = useState([]);
  const [succes, setSucces]             = useState('');
  const { user }                        = useAuth();
  const rol                             = user?.rol || '';
  const [showForm, setShowForm]         = useState(false);
  const [idPozitieMea, setIdPozitieMea] = useState(null);
  
  const [form, setForm] = useState({
    titlu: '', id_departament: '', salariu_min: '', salariu_max: '', nivel: '',
  });

  // Doar administratorii sau HR Manager pot crea poziții noi
  const poateCreea = ['hr_manager', 'ceo'].includes(rol);
  // Project Manager nu are voie să vadă salariile celorlalți
  const ascundeSalarii = rol === 'project_manager';

  useEffect(() => {
    incarcaDatePozitii();
    api.get(API.DEPARTAMENTE).then(res => setDepartamente(res.data)).catch(() => {});
  }, [rol]);

  const incarcaDatePozitii = async () => {
    setLoading(true);
    setErori([]);

    try {
      // 1. Preluăm profilul PM-ului pentru a afla poziția lui directă
      const profilRes = await api.get('/utilizatori/profil-meu').catch(() => null);
      const pozitieMeaId = profilRes?.data?.id_pozitie;
      if (pozitieMeaId) {
        setIdPozitieMea(Number(pozitieMeaId));
      }

      // 2. Preluăm lista globală de poziții
      const pozitiiRes = await api.get(API.POZITII);
      const toatePozitiile = pozitiiRes.data || [];

      if (rol === 'project_manager') {
        // 3. Preluăm membrii din proiectele alocate lui
        const echipaRes = await api.get(API.VIEW_TEAM_LEADER).catch(() => ({ data: [] }));
        const dateEchipa = echipaRes.data.date_echipa || echipaRes.data || [];

        // 4. Colectăm ID-urile unice de poziții (a lui + ale echipei lui)
        const idUriPozitiiRelevante = new Set();
        if (pozitieMeaId) idUriPozitiiRelevante.add(Number(pozitieMeaId));

        dateEchipa.forEach(membru => {
          if (membru.id_pozitie) {
            idUriPozitiiRelevante.add(Number(membru.id_pozitie));
          }
        });

        // 5. Filtrăm grila globală păstrând doar ce este legat de el și proiectele lui
        const pozitiiFiltrate = toatePozitiile.filter(p => 
          idUriPozitiiRelevante.has(Number(p.id_pozitie))
        );
        setPozitii(pozitiiFiltrate);
      } else {
        // Pentru CEO, HR Manager, etc. - încarcă toată lista normal
        setPozitii(toatePozitiile);
      }
    } catch (err) {
      console.error(err);
      setErori(['Nu s-au putut incarca pozitiile organizatorice.']);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErori([]);
    setSucces('');

    if (parseFloat(form.salariu_min) > parseFloat(form.salariu_max)) {
      setErori(['Salariul minim nu poate fi mai mare decat salariul maxim!']);
      return;
    }

    const datePozitie = {
      titlu: form.titlu,
      id_departament: parseInt(form.id_departament, 10),
      salariu_min: parseFloat(form.salariu_min),
      salariu_max: parseFloat(form.salariu_max),
      nivel: form.nivel
    };

    try {
      await api.post(API.POZITII, datePozitie);
      setSucces('Pozitia a fost adaugata cu succes!');
      setForm({ titlu: '', id_departament: '', salariu_min: '', salariu_max: '', nivel: '' });
      setShowForm(false);
      incarcaDatePozitii();
    } catch (err) {
      setErori([err.response?.data?.detalii || 'Eroare la salvarea pozitiei.']);
    }
  };

  const formatRON = (v) => v ? `${Number(v).toLocaleString('ro-RO')} RON` : '—';

  const nivelCuloare = {
    'Junior':    '#6a9955',
    'Mid':       '#4ec9b0',
    'Senior':    '#f39c12',
    'Principal': '#ff22a1',
    'Lead':      '#9b59b6',
  };

  // Dacă utilizatorul nu are drepturi de vizualizare parțiale (ex: alt rol restricționat total)
  if (rol === 'app_readonly') {
    return (
      <div style={{ fontFamily: 'Consolas, monospace', color: '#808080', padding: '20px' }}>
        <h2 style={{ color: roz, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> POZITII
        </h2>
        <p style={{ marginTop: '16px', fontSize: '13px' }}>
          // Nu aveti permisiunea de a vizualiza grila de salarizare a companiei.
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Consolas, monospace', maxWidth: '950px' }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
            <span style={{ color: cyan }}>{'>'}</span> POZITII
          </h2>
          <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
            {ascundeSalarii 
              ? `Afișate: ${pozitii.length} poziții (asociate proiectelor tale și cea proprie). Datele financiare sunt mascate.`
              : `${pozitii.length} pozitii active in grila organizationala`
            }
          </p>
        </div>
        {poateCreea && (
          <button onClick={() => { setShowForm(!showForm); setErori([]); }} style={btnStyle(showForm ? '#808080' : roz)}>
            {showForm ? 'ANULEAZA' : '+ POZITIE NOUA'}
          </button>
        )}
      </div>

      {/* mesaje eroare/succes */}
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

      {/* formular adaugare (randat doar daca are permisiune) */}
      {showForm && poateCreea && (
        <div style={{
          backgroundColor: '#252526', border: '1px solid #333',
          borderLeft: `3px solid ${roz}`, padding: '24px',
          marginBottom: '28px', borderRadius: '2px',
        }}>
          <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 20px' }}>POZITIE NOUA</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Camp label="TITLU POZITIE" name="titlu" value={form.titlu} onChange={handleChange} required />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: cyan, fontSize: '11px' }}>NIVEL:</label>
              <select name="nivel" value={form.nivel} onChange={handleChange} style={selectStyle}>
                <option value="">-- selecteaza nivel --</option>
                {['Junior', 'Mid', 'Senior', 'Principal', 'Lead'].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Camp label="SALARIU MIN (RON)" name="salariu_min" type="number" value={form.salariu_min} onChange={handleChange} required />
              <Camp label="SALARIU MAX (RON)" name="salariu_max" type="number" value={form.salariu_max} onChange={handleChange} required />
            </div>

            <button type="submit" style={{ ...btnStyle(roz), alignSelf: 'flex-start', padding: '10px 24px', border: `2px solid ${roz}` }}>
              ADAUGA POZITIE
            </button>
          </form>
        </div>
      )}

      {/* lista de pozitii */}
      {loading && <p style={{ color: '#808080' }}>Se incarca pozitiile...</p>}
      
      {!loading && pozitii.length === 0 && (
        <p style={{ color: '#808080' }}>Nu exista pozitii accesibile contului dvs.</p>
      )}

      {!loading && pozitii.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${roz}` }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>TITLU</th>
                <th style={thStyle}>NIVEL</th>
                <th style={thStyle}>SALARIU MIN</th>
                <th style={thStyle}>SALARIU MAX</th>
                <th style={thStyle}>MEDIE</th>
              </tr>
            </thead>
            <tbody>
              {pozitii.map((p, idx) => {
                // Securitate suplimentară: PM își vede salariul de la poziția proprie, dar NU și pe cel al angajaților de pe alte poziții
                const estePozitiaMeaProprie = Number(p.id_pozitie) === idPozitieMea;
                const mascheazaFinanciar = ascundeSalarii && !estePozitiaMeaProprie;

                return (
                  <tr key={p.id_pozitie} style={{
                    backgroundColor: idx % 2 === 0 ? '#1e1e1e' : '#252526',
                    borderBottom: '1px solid #2d2d2d',
                    borderLeft: estePozitiaMeaProprie ? `2px solid ${cyan}` : 'none'
                  }}>
                    <td style={tdStyle}>{p.id_pozitie}</td>
                    <td style={{ ...tdStyle, color: '#d4d4d4', fontWeight: 'bold' }}>
                      {p.titlu} {estePozitiaMeaProprie && <span style={{ color: cyan, fontSize: '10px', fontWeight: 'normal' }}>(Poziția Ta)</span>}
                    </td>
                    <td style={tdStyle}>
                      {p.nivel ? (
                        <span style={{
                          color: nivelCuloare[p.nivel] || '#9cdcfe',
                          border: `1px solid ${nivelCuloare[p.nivel] || '#9cdcfe'}`,
                          padding: '2px 8px', fontSize: '10px',
                        }}>
                          {p.nivel}
                        </span>
                      ) : '—'}
                    </td>
                    
                    {/* Salariu Minim */}
                    <td style={{ ...tdStyle, color: mascheazaFinanciar ? '#555' : '#6a9955', fontStyle: mascheazaFinanciar ? 'italic' : 'normal' }}>
                      {mascheazaFinanciar ? '[CONFIDENȚIAL]' : formatRON(p.salariu_min)}
                    </td>
                    
                    {/* Salariu Maxim */}
                    <td style={{ ...tdStyle, color: mascheazaFinanciar ? '#555' : '#6a9955', fontStyle: mascheazaFinanciar ? 'italic' : 'normal' }}>
                      {mascheazaFinanciar ? '[CONFIDENȚIAL]' : formatRON(p.salariu_max)}
                    </td>
                    
                    {/* Medie */}
                    <td style={{ ...tdStyle, color: mascheazaFinanciar ? '#555' : cyan, fontStyle: mascheazaFinanciar ? 'italic' : 'normal' }}>
                      {mascheazaFinanciar ? '[CONFIDENȚIAL]' : formatRON((Number(p.salariu_min) + Number(p.salariu_max)) / 2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Camp({ label, name, value, onChange, type = 'text', required }) {
  const cyan = '#4ec9b0';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
      <label style={{ color: cyan, fontSize: '11px' }}>
        {label}{required && <span style={{ color: '#ff22a1' }}> *</span>}
      </label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} style={inputStyle} />
    </div>
  );
}

const thStyle = {
  textAlign: 'left', padding: '8px 12px', color: cyan, fontWeight: 'normal', whiteSpace: 'nowrap'
};

const btnStyle = (culoare) => ({
  backgroundColor: 'transparent', color: culoare, border: `1px solid ${culoare}`,
  padding: '8px 16px', fontFamily: 'Consolas, monospace', fontSize: '12px',
  cursor: 'pointer', letterSpacing: '0.5px', whiteSpace: 'nowrap',
});

const tdStyle = {
  padding: '9px 12px', color: '#9cdcfe', verticalAlign: 'middle', whiteSpace: 'nowrap',
};

const inputStyle = {
  backgroundColor: '#3c3c3c', color: 'white', border: '1px solid #555',
  padding: '8px 12px', fontFamily: 'Consolas, monospace', fontSize: '13px',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};

const selectStyle = {
  backgroundColor: '#3c3c3c', color: 'white', border: '1px solid #555',
  padding: '8px 12px', fontFamily: 'Consolas, monospace', fontSize: '13px',
  outline: 'none', width: '100%',
};