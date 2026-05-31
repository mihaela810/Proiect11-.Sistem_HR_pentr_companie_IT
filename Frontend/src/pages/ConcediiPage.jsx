import { useState, useEffect } from 'react';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

const tipuriConcediu = ['odihna', 'boala', 'concediu fara plata'];

const statusCuloare = {
  'in asteptare': '#f39c12',
  'aprobat':      '#6a9955',
  'respins':      '#ff22a1',
};

// Declaram stilurile chiar la inceput pentru a fi accesibile peste tot in fisier fara erori de tip ReferenceError
const selectStyle = {
  backgroundColor: '#3c3c3c',
  color: 'white',
  border: '1px solid #555',
  padding: '8px 12px',
  fontFamily: 'Consolas, monospace',
  fontSize: '13px',
  outline: 'none',
};

const inputStyle = {
  backgroundColor: '#3c3c3c',
  color: 'white',
  border: '1px solid #555',
  padding: '8px 12px',
  fontFamily: 'Consolas, monospace',
  fontSize: '13px',
  outline: 'none',
};

const thStyle = {
  padding: '12px',
  color: '#d4d4d4',
  fontWeight: 'bold',
  borderBottom: '2px solid #333',
  textAlign: 'left'
};

const tdStyle = {
  padding: '12px',
  color: '#9cdcfe',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

const btnStyle = (culoare) => ({
  backgroundColor: 'transparent',
  color: culoare,
  border: `1px solid ${culoare}`,
  padding: '8px 16px',
  fontFamily: 'Consolas, monospace',
  fontSize: '12px',
  cursor: 'pointer',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
});

export default function ConcediiPage() {
  const [concedii, setConcedii]         = useState([]);
  const [angajati, setAngajati]         = useState([]);
  const [departamente, setDepartamente] = useState([]);
  const [istoric, setIstoric]           = useState([]);
  
  const [loading, setLoading]                 = useState(true);
  const [loadingIstoric, setLoadingIstoric]   = useState(false);
  const [erori, setErori]                     = useState([]);
  const [succes, setSucces]                   = useState('');
  const [showForm, setShowForm]               = useState(false);
  const [tabActiv, setTabActiv]               = useState('cereri');

  // Filtre pentru istoric
  const [filtruAngajat, setFiltruAngajat] = useState('');
  const [filtruDept, setFiltruDept]       = useState('');
  const [filtruManager, setFiltruManager] = useState('');

  const [form, setForm] = useState({
    id_angajat:   '',
    tip:          'odihna',
    data_start:   '',
    data_sfarsit: '',
    id_aprobator: 1,
  });

  const fetchConcedii = () => {
    setLoading(true);
    api.get(API.CONCEDII)
      .then(res => setConcedii(res.data.date_concedii || res.data || []))
      .catch(() => setErori(['Nu s-au putut incarca cererile active.']))
      .finally(() => setLoading(false));
  };

  const fetchIstoric = () => {
  setLoadingIstoric(true);
  const params = {};
  if (filtruAngajat) params.id_angajat = filtruAngajat;
  if (filtruDept)    params.id_departament = filtruDept;

  api.get('/concedii/istoric-grupare', { params })   // ← numele corect al rutei
    .then(res => setIstoric(res.data.date_concedii || []))  // ← cheia corectă
    .catch(() => setErori(['Eroare la incarcarea istoricului.']))
    .finally(() => setLoadingIstoric(false));
};

  useEffect(() => {
    fetchConcedii();
    api.get(API.ANGAJATI).then(res => setAngajati(res.data)).catch(() => {});
    api.get('/api/departamente').then(res => setDepartamente(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErori([]);
    setSucces('');
    
    api.post(API.CONCEDII, form)
      .then(() => {
        setSucces('Cererea de concediu a fost trimisa cu succes!');
        setForm({ id_angajat: '', tip: 'odihna', data_start: '', data_sfarsit: '', id_aprobator: 1 });
        setShowForm(false);
        fetchConcedii();
      })
      .catch(err => {
        const msg = err.response?.data?.mesaj || 'Eroare la salvarea cererii.';
        setErori([msg]);
      });
  };

  const handleDecizie = (idConcediu, statusNou, idManager) => {
    setErori([]);
    setSucces('');
    
    api.put(`/api/concedii/decizie/${idConcediu}`, { status: statusNou, id_manager: idManager })
      .then(() => {
        setSucces(`Cererea a fost ${statusNou}a cu succes!`);
        fetchConcedii();
        if (tabActiv === 'istoric') fetchIstoric();
      })
      .catch(err => {
        setErori([err.response?.data?.mesaj || 'Nu s-a putut procesa decizia.']);
      });
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Consolas, monospace', color: '#d4d4d4', backgroundColor: '#1e1e1e', minHeight: '100vh' }}>
      
      {/* HEADER PAGINA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ color: 'white', margin: 0, fontSize: '20px' }}>Gestiune Concedii</h2>
          <p style={{ margin: '4px 0 0', color: '#808080', fontSize: '12px' }}>Vizualizare, adaugare si aprobare cereri</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle(cyan)}>
          {showForm ? 'INCHIDE FORMULAR' : 'CERERE NOUA'}
        </button>
      </div>

      {/* TAB-URI NAVIGARE */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'cereri',  label: 'CERERI ACTIVE' },
          { id: 'istoric', label: 'ARHIVA CONCEDII' },
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setTabActiv(tab.id)} 
            style={{
              ...btnStyle(tabActiv === tab.id ? roz : '#808080'),
              backgroundColor: tabActiv === tab.id ? '#2a2d2e' : 'transparent',
              borderBottom: tabActiv === tab.id ? `2px solid ${roz}` : '1px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* AFISARE ERORI / SUCCES */}
      {erori.map((err, i) => <div key={i} style={{ color: roz, marginBottom: '10px', fontSize: '13px' }}>⚠️ {err}</div>)}
      {succes && <div style={{ color: '#6a9955', marginBottom: '10px', fontSize: '13px' }}>✅ {succes}</div>}

      {/* FORMULAR CERERE NOUA */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#252526', border: '1px solid #333', padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: '0 0 8px', color: cyan, fontSize: '14px' }}>Formulați cerere nouă</h3>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' }}>
              <label style={{ color: cyan, fontSize: '11px' }}>ANGAJAT *</label>
              <select name="id_angajat" value={form.id_angajat} onChange={handleChange} style={selectStyle} required>
                <option value="">-- Selecteaza Angajat --</option>
                {Array.isArray(angajati) && angajati.map(a => (
                  <option key={a.id_angajat} value={a.id_angajat}>
                    {a.nume} {a.prenume} (ID: {a.id_angajat})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '150px' }}>
              <label style={{ color: cyan, fontSize: '11px' }}>TIP CONCEDIU</label>
              <select name="tip" value={form.tip} onChange={handleChange} style={selectStyle}>
                {tipuriConcediu.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Camp label="DATA INCEPUT *" name="data_start" type="date" value={form.data_start} onChange={handleChange} required />
            <Camp label="DATA SFARSIT *" name="data_sfarsit" type="date" value={form.data_sfarsit} onChange={handleChange} required />
            <Camp label="ID MANAGER APROBATOR *" name="id_aprobator" type="number" value={form.id_aprobator} onChange={handleChange} required />
          </div>

          <button type="submit" style={{ ...btnStyle(roz), alignSelf: 'flex-start', marginTop: '8px' }}>
            TRIMITE CEREREA
          </button>
        </form>
      )}

      {/* ------------------ TAB 1: CERERI ACTIVE ------------------ */}
      {!loading && tabActiv === 'cereri' && (
        <div style={{ overflowX: 'auto', border: '1px solid #333', backgroundColor: '#252526' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#2d2d2d', borderBottom: '1px solid #333' }}>
                <th style={thStyle}>Angajat</th>
                <th style={thStyle}>Tip</th>
                <th style={thStyle}>Inceput</th>
                <th style={thStyle}>Sfarsit</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actiuni Decizionale (Manager)</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(concedii) && concedii.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '16px', textAlign: 'center', color: '#808080' }}>
                    Nu exista cereri de concediu inregistrate active.
                  </td>
                </tr>
              ) : (
                concedii?.map((c) => (
                  <tr key={c.id_concediu} style={{ borderBottom: '1px solid #2d2d2d' }}>
                    <td style={tdStyle}>{c.nume_angajat || `ID Angajat: ${c.id_angajat}`}</td>
                    <td style={tdStyle}><span style={{ color: '#b5cea8' }}>{c.tip}</span></td>
                    <td style={tdStyle}>{c.data_start}</td>
                    <td style={tdStyle}>{c.data_sfarsit}</td>
                    <td style={tdStyle}>
                      <span style={{ color: statusCuloare[c.status] || '#d4d4d4', fontWeight: 'bold' }}>
                        {c.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {c.status === 'in asteptare' ? (
                        <ZonaDecizie idConcediu={c.id_concediu} onDecizie={handleDecizie} />
                      ) : (
                        <span style={{ color: '#555', fontSize: '11px' }}>
                          Procesat de Manager ID: {c.id_aprobator}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------ TAB 2: ARHIVA / ISTORIC CONCEDII ------------------ */}
      {!loading && tabActiv === 'istoric' && (
        <div>
          {/* Filtre */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <select value={filtruAngajat} onChange={e => setFiltruAngajat(e.target.value)} style={selectStyle}>
              <option value="">TOTI ANGAJATII</option>
              {Array.isArray(angajati) && angajati.map(a => (
                <option key={a.id_angajat} value={a.id_angajat}>
                  {a.nume} {a.prenume}
                </option>
              ))}
            </select>

            <select value={filtruDept} onChange={e => setFiltruDept(e.target.value)} style={selectStyle}>
              <option value="">TOATE DEPARTAMENTELE</option>
              {Array.isArray(departamente) && departamente.map(d => (
                <option key={d.id_departament} value={d.id_departament}>{d.nume}</option>
              ))}
            </select>

            <button onClick={fetchIstoric} style={btnStyle(cyan)}>CAUTA</button>
            <button onClick={() => {
              setFiltruAngajat(''); setFiltruDept(''); setFiltruManager('');
              setIstoric([]);
            }} style={btnStyle('#808080')}>RESET</button>
          </div>

          {/* Tabel istoric */}
          {loadingIstoric ? (
            <p style={{ color: '#808080' }}>Se incarca...</p>
          ) : istoric.length === 0 ? (
            <p style={{ color: '#808080' }}>Selecteaza filtre si apasa CAUTA.</p>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid #333', backgroundColor: '#252526' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#2d2d2d', borderBottom: '1px solid #333' }}>
                    {['ANGAJAT', 'DEPARTAMENT', 'TIP', 'INCEPUT', 'SFARSIT', 'ZILE', 'STATUS'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {istoric.map((c, idx) => (
                    <tr key={c.id_concediu} style={{
                      backgroundColor: idx % 2 === 0 ? '#1e1e1e' : '#252526',
                      borderBottom: '1px solid #2d2d2d',
                    }}>
                      <td style={tdStyle}>{c.prenume_angajat} {c.nume_angajat}</td>
                      <td style={tdStyle}>{c.departament}</td>
                      <td style={{ ...tdStyle, color: '#b5cea8' }}>{c.tip}</td>
                      <td style={tdStyle}>{c.data_start}</td>
                      <td style={tdStyle}>{c.data_sfarsit}</td>
                      <td style={{ ...tdStyle, color: cyan }}>{c.zile_solicitate}</td>
                      <td style={tdStyle}>
                        <span style={{ color: statusCuloare[c.status] || '#d4d4d4', fontWeight: 'bold' }}>
                          {c.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Indicator incarcare global */}
      {loading && <div style={{ color: cyan, fontSize: '13px' }}>Se incarca datele din sistem...</div>}

    </div>
  );
}

{/* ------------------ COMPONENTE SECUNDARE REUTILIZABILE ------------------ */}
function ZonaDecizie({ idConcediu, onDecizie }) {
  const [idManager, setIdManager] = useState('1');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{ color: cyan, fontSize: '11px' }}>ID MANAGER:</label>
        <input 
          type="number" 
          value={idManager}
          onChange={e => setIdManager(e.target.value)}
          style={{ ...inputStyle, width: '120px' }}
          placeholder="ex: 1" 
        />
      </div>
      <button onClick={() => onDecizie(idConcediu, 'aprobat', Number(idManager))} disabled={!idConcediu || !idManager} style={btnStyle('#6a9955')}>
        APROBA
      </button>
      <button onClick={() => onDecizie(idConcediu, 'respins', Number(idManager))} disabled={!idConcediu || !idManager} style={btnStyle(roz)}>
        RESPINGE
      </button>
    </div>
  );
}

function Camp({ label, name, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '140px' }}>
      <label style={{ color: cyan, fontSize: '11px' }}>
        {label}{required && <span style={{ color: '#ff22a1' }}> *</span>}
      </label>
      <input type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required} style={inputStyle} />
    </div>
  );
}