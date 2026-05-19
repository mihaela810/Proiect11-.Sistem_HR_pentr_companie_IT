import { useState, useEffect } from 'react';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function PozitiiPage() {
  const [pozitii, setPozitii]           = useState([]);
  const [departamente, setDepartamente] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [erori, setErori]               = useState([]);
  const [succes, setSucces]             = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm] = useState({
    titlu: '', id_departament: '', salariu_min: '', salariu_max: '', nivel: '',
  });

  useEffect(() => {
    fetchPozitii();
    api.get(API.DEPARTAMENTE).then(res => setDepartamente(res.data));
  }, []);

  const fetchPozitii = () => {
    setLoading(true);
    api.get(API.POZITII)
      .then(res => setPozitii(res.data))
      .catch(() => setErori(['Nu s-au putut incarca pozitiile.']))
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErori([]);
  setSucces('');

  // Validare de bază în frontend: salariul minim nu poate fi mai mare decât cel maxim
  if (parseFloat(form.salariu_min) > parseFloat(form.salariu_max)) {
    setErori(['Salariul minim nu poate fi mai mare decat salariul maxim!']);
    return;
  }

  // CORECTIE CRITICA: Convertim id-ul în Int și salariile în Float pentru a se potrivi cu app.py
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
    fetchPozitii(); // Reîncărcăm lista din baza de date
    } catch (err) {
      setErori([err.response?.data?.detalii || 'Eroare la salvarea pozitiei. Verificati datele.']);
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

  return (
    <div style={{ fontFamily: 'Consolas, monospace', maxWidth: '900px' }}>

      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
            <span style={{ color: cyan }}>{'>'}</span> POZITII
          </h2>
          <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
            {pozitii.length} pozitii in grila salariala
          </p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setErori([]); }} style={btnStyle(showForm ? '#808080' : roz)}>
          {showForm ? 'ANULEAZA' : '+ POZITIE NOUA'}
        </button>
      </div>

      {/* mesaje */}
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

      {/* formular */}
      {showForm && (
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
              <Camp label="SALARIU MIN (RON)" name="salariu_min" type="number"
                value={form.salariu_min} onChange={handleChange} required />
              <Camp label="SALARIU MAX (RON)" name="salariu_max" type="number"
                value={form.salariu_max} onChange={handleChange} required />
            </div>

            {/* preview grila */}
            {form.salariu_min && form.salariu_max && Number(form.salariu_min) < Number(form.salariu_max) && (
              <div style={{ backgroundColor: '#1e1e1e', border: '1px solid #333', padding: '10px 14px', fontSize: '12px' }}>
                <span style={{ color: '#808080' }}>Grila: </span>
                <span style={{ color: cyan }}>{formatRON(form.salariu_min)}</span>
                <span style={{ color: '#555' }}> — </span>
                <span style={{ color: cyan }}>{formatRON(form.salariu_max)}</span>
                <span style={{ color: '#6a9955', marginLeft: '12px' }}>
                  medie: {formatRON((Number(form.salariu_min) + Number(form.salariu_max)) / 2)}
                </span>
              </div>
            )}

            <button type="submit" style={{ ...btnStyle(roz), alignSelf: 'flex-start', padding: '10px 24px', border: `2px solid ${roz}` }}>
              ADAUGA POZITIE
            </button>
          </form>
        </div>
      )}

      {/* lista */}
      {loading && <p style={{ color: '#808080' }}>Se incarca...</p>}
      {!loading && pozitii.length === 0 && (
        <p style={{ color: '#808080' }}>Nu exista pozitii in grila salariala.</p>
      )}
      {!loading && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${roz}` }}>
                {['ID', 'TITLU', 'NIVEL', 'SALARIU MIN', 'SALARIU MAX', 'MEDIE'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: cyan, fontWeight: 'normal', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pozitii.map((p, idx) => (
                <tr key={p.id_pozitie} style={{
                  backgroundColor: idx % 2 === 0 ? '#1e1e1e' : '#252526',
                  borderBottom: '1px solid #2d2d2d',
                }}>
                  <td style={tdStyle}>{p.id_pozitie}</td>
                  <td style={{ ...tdStyle, color: '#d4d4d4', fontWeight: 'bold' }}>{p.titlu}</td>
                  <td style={{ ...tdStyle }}>
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
                  <td style={{ ...tdStyle, color: '#6a9955' }}>{formatRON(p.salariu_min)}</td>
                  <td style={{ ...tdStyle, color: '#6a9955' }}>{formatRON(p.salariu_max)}</td>
                  <td style={{ ...tdStyle, color: cyan }}>
                    {formatRON((Number(p.salariu_min) + Number(p.salariu_max)) / 2)}
                  </td>
                </tr>
              ))}
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
      <input type={type} name={name} value={value} onChange={onChange}
        required={required} style={inputStyle} />
    </div>
  );
}

const btnStyle = (culoare) => ({
  backgroundColor: 'transparent', color: culoare,
  border: `1px solid ${culoare}`, padding: '8px 16px',
  fontFamily: 'Consolas, monospace', fontSize: '12px',
  cursor: 'pointer', letterSpacing: '0.5px', whiteSpace: 'nowrap',
});

const tdStyle = {
  padding: '9px 12px', color: '#9cdcfe',
  verticalAlign: 'middle', whiteSpace: 'nowrap',
};

const inputStyle = {
  backgroundColor: '#3c3c3c', color: 'white',
  border: '1px solid #555', padding: '8px 12px',
  fontFamily: 'Consolas, monospace', fontSize: '13px',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};

const selectStyle = {
  backgroundColor: '#3c3c3c', color: 'white',
  border: '1px solid #555', padding: '8px 12px',
  fontFamily: 'Consolas, monospace', fontSize: '13px',
  outline: 'none', width: '100%',
};