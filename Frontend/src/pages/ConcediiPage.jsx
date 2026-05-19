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

export default function ConcediiPage() {
  const [concedii, setConcedii]   = useState([]);
  const [angajati, setAngajati]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erori, setErori]         = useState([]);
  const [succes, setSucces]       = useState('');
  const [showForm, setShowForm]   = useState(false);

  const [form, setForm] = useState({
    id_angajat:   '',
    tip:          'odihna',
    data_start:   '',
    data_sfarsit: '',
    id_aprobator: 1,
  });

  useEffect(() => {
    fetchConcedii();
    // Securizăm preluarea angajaților în caz că backend-ul returnează alt format
    api.get(API.ANGAJATI)
      .then(res => {
        if (Array.isArray(res.data)) {
          setAngajati(res.data);
        } else if (res.data && Array.isArray(res.data.date)) {
          setAngajati(res.data.date);
        }
      })
      .catch(() => console.error("Nu s-au putut incarca angajatii pentru dropdown."));
  }, []);

  const fetchConcedii = () => {
    setLoading(true);
    api.get(API.CONCEDII)
      .then(res => {
        // Ne asigurăm că setăm un array valid
        if (Array.isArray(res.data)) {
          setConcedii(res.data);
        } else {
          setConcedii([]);
        }
      })
      .catch(() => setErori(['Nu s-au putut incarca concediile.']))
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErori([]);
    setSucces('');

    if (!form.id_angajat) {
      setErori(['Te rugam sa selectezi un angajat!']);
      return;
    }

    if (new Date(form.data_start) > new Date(form.data_sfarsit)) {
      setErori(['Data de inceput nu poate fi dupa data de sfarsit!']);
      return;
    }

    // Convertim ID-urile în numere int pentru a corespunde cu app.py/MySQL
    const dateTrimise = {
      id_angajat: parseInt(form.id_angajat, 10),
      tip: form.tip,
      data_start: form.data_start,
      data_sfarsit: form.data_sfarsit,
      id_aprobator: parseInt(form.id_aprobator, 10)
    };

    try {
      await api.post(API.CONCEDII, dateTrimise);
      setSucces('Cererea de concediu a fost trimisa!');
      setForm({ id_angajat: '', tip: 'odihna', data_start: '', data_sfarsit: '', id_aprobator: 1 });
      setShowForm(false);
      fetchConcedii();
    } catch (err) {
      setErori([err.response?.data?.detalii || 'Eroare la salvarea cererii de concediu.']);
    }
  };

  const handleDecizie = async (idConcediu, statusNou, idManager) => {
    setErori([]);
    setSucces('');
    try {
      await api.put(`${API.CONCEDII}/${idConcediu}/decizie`, {
        status: statusNou,
        id_manager: parseInt(idManager, 10),
      });
      setSucces(`Cererea a fost ${statusNou}a cu succes!`);
      fetchConcedii();
    } catch (err) {
      setErori([err.response?.data?.detalii || 'Nu s-a putut procesa decizia.']);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Consolas, monospace', color: '#d4d4d4', backgroundColor: '#1e1e1e', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ color: 'white', margin: 0, fontSize: '20px' }}>Gestiune Concedii</h2>
          <p style={{ margin: '4px 0 0', color: '#808080', fontSize: '12px' }}>Vizualizare, adaugare si aprobare cereri</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle(cyan)}>
          {showForm ? 'INCHIDE FORMULAR' : 'CERERE NOUA'}
        </button>
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

      {/* LISTA CERERI (TABEL REZOLVAT CU OPTIONAL CHAINING) */}
      {loading ? (
        <div style={{ color: cyan, fontSize: '13px' }}>Se incarca datele din sistem...</div>
      ) : (
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
                    Nu exista cereri de concediu inregistrate.
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
    </div>
  );
}

// Componente secundare interne protejate
function ZonaDecizie({ idConcediu, onDecizie }) {
  const [idManager, setIdManager] = useState('1');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{ color: cyan, fontSize: '11px' }}>ID MANAGER:</label>
        <input type="number" value={idManager}
          onChange={e => setIdManager(e.target.value)}
          style={{ ...inputStyle, width: '120px' }}
          placeholder="ex: 1" />
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

// Stiluri CSS-in-JS
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
};

const tdStyle = {
  padding: '12px',
  color: '#9cdcfe',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};