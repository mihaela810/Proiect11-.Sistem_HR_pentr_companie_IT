import { useState, useEffect } from 'react';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function DepartamentePage() {
  const [departamente, setDepartamente] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [erori, setErori]               = useState([]);
  const [succes, setSucces]             = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm] = useState({ nume: '', descriere: '', locatie: '' });

  useEffect(() => { fetchDepartamente(); }, []);

  const fetchDepartamente = () => {
    setLoading(true);
    api.get(API.DEPARTAMENTE)
      .then(res => setDepartamente(res.data))
      .catch(() => setErori(['Nu s-au putut incarca departamentele.']))
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErori([]);
  setSucces('');
  
  if (!form.nume.trim()) {
    setErori(['Numele departamentului este obligatoriu!']);
    return;
  }

  try {
    await api.post(API.DEPARTAMENTE, form);
    setSucces('Departamentul a fost adăugat cu succes!');
    setForm({ nume: '', descriere: '', locatie: '' });
    fetchDepartamente();
  } catch (err) {
    // Verificăm dacă backend-ul a trimis detalii specifice despre eroarea de bază de date
      const mesajEroare = err.response?.data?.detalii || 'Nu s-a putut salva departamentul.';
      setErori([mesajEroare]);
    }
  };

  return (
    <div style={{ fontFamily: 'Consolas, monospace', maxWidth: '800px' }}>

      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
            <span style={{ color: cyan }}>{'>'}</span> DEPARTAMENTE
          </h2>
          <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
            {departamente.length} departamente inregistrate
          </p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setErori([]); }} style={btnStyle(showForm ? '#808080' : roz)}>
          {showForm ? 'ANULEAZA' : '+ DEPARTAMENT NOU'}
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
          <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 20px' }}>DEPARTAMENT NOU</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Camp label="NUME DEPARTAMENT" name="nume" value={form.nume} onChange={handleChange} required />
            <Camp label="LOCATIE"          name="locatie" value={form.locatie} onChange={handleChange} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: cyan, fontSize: '11px' }}>DESCRIERE:</label>
              <textarea name="descriere" value={form.descriere} onChange={handleChange}
                rows={3} placeholder="descriere departament..."
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <button type="submit" style={{ ...btnStyle(roz), alignSelf: 'flex-start', padding: '10px 24px', border: `2px solid ${roz}` }}>
              CREEAZA DEPARTAMENT
            </button>
          </form>
        </div>
      )}

      {/* lista */}
      {loading && <p style={{ color: '#808080' }}>Se incarca...</p>}
      {!loading && departamente.length === 0 && (
        <p style={{ color: '#808080' }}>Nu exista departamente.</p>
      )}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
          {departamente.map(d => (
            <div key={d.id_departament} style={{
              backgroundColor: '#252526',
              border: '1px solid #333',
              borderLeft: `3px solid ${cyan}`,
              padding: '16px 20px',
              borderRadius: '2px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#d4d4d4', fontWeight: 'bold', fontSize: '14px' }}>{d.nume}</span>
                <span style={{ color: '#555', fontSize: '10px' }}>ID: {d.id_departament}</span>
              </div>
              {d.locatie && (
                <div style={{ color: roz, fontSize: '11px', marginBottom: '6px' }}>
                  📍 {d.locatie}
                </div>
              )}
              {d.descriere && (
                <p style={{ color: '#808080', fontSize: '12px', margin: 0 }}>{d.descriere}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Camp({ label, name, value, onChange, required }) {
  const cyan = '#4ec9b0';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ color: cyan, fontSize: '11px' }}>
        {label}{required && <span style={{ color: '#ff22a1' }}> *</span>}
      </label>
      <input name={name} value={value} onChange={onChange}
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

const inputStyle = {
  backgroundColor: '#3c3c3c', color: 'white',
  border: '1px solid #555', padding: '8px 12px',
  fontFamily: 'Consolas, monospace', fontSize: '13px',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};