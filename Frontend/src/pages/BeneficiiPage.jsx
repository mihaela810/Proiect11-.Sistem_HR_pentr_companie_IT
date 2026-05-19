import { useState, useEffect } from 'react';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function BeneficiiPage() {
  const [beneficii, setBeneficii] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erori, setErori]         = useState([]);
  const [succes, setSucces]       = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm] = useState({ nume: '', descriere: '', valoare: '' });

  useEffect(() => { fetchBeneficii(); }, []);

  const fetchBeneficii = () => {
    setLoading(true);
    api.get(API.BENEFICII)
      .then(res => setBeneficii(res.data))
      .catch(() => setErori(['Nu s-au putut incarca beneficiile.']))
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErori([]);
    setSucces('');
  
  // Forțăm valoarea să devină un număr de tip Float înainte de trimitere
    const dateBeneficiu = {
      ...form,
      valoare: parseFloat(form.valoare)
    };

    try {
      await api.post(API.BENEFICII, dateBeneficiu);
      setSucces('Beneficiul a fost salvat cu succes!');
      setForm({ nume: '', descriere: '', valoare: '' }); // Resetare formular
      fetchBeneficii(); // Reîncărcare listă din backend
    } catch (err) {
      setErori([err.response?.data?.detalii || 'Nu s-a putut salva beneficiul.']);
    }
  };

  const formatRON = (v) => v ? `${Number(v).toLocaleString('ro-RO')} RON` : '—';

  const totalValoare = beneficii.reduce((sum, b) => sum + Number(b.valoare || 0), 0);

  return (
    <div style={{ fontFamily: 'Consolas, monospace', maxWidth: '800px' }}>

      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
            <span style={{ color: cyan }}>{'>'}</span> BENEFICII
          </h2>
          <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
            {beneficii.length} beneficii disponibile — valoare totala: {formatRON(totalValoare)}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setErori([]); }}
          style={btnStyle(showForm ? '#808080' : roz)}
        >
          {showForm ? 'ANULEAZA' : '+ BENEFICIU NOU'}
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
          <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 20px' }}>BENEFICIU NOU</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Camp label="NUME BENEFICIU" name="nume" value={form.nume} onChange={handleChange} required />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: cyan, fontSize: '11px' }}>DESCRIERE:</label>
              <textarea name="descriere" value={form.descriere} onChange={handleChange}
                rows={3} placeholder="descriere beneficiu..."
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <Camp label="VALOARE (RON)" name="valoare" type="number"
              value={form.valoare} onChange={handleChange}
              placeholder="ex: 500" required />
            <button type="submit" style={{
              ...btnStyle(roz), alignSelf: 'flex-start',
              padding: '10px 24px', border: `2px solid ${roz}`,
            }}>
              ADAUGA BENEFICIU
            </button>
          </form>
        </div>
      )}

      {/* lista */}
      {loading && <p style={{ color: '#808080' }}>Se incarca...</p>}
      {!loading && beneficii.length === 0 && (
        <p style={{ color: '#808080' }}>Nu exista beneficii inregistrate.</p>
      )}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
          {beneficii.map(b => (
            <div key={b.id_beneficiu} style={{
              backgroundColor: '#252526',
              border: '1px solid #333',
              borderLeft: `3px solid ${cyan}`,
              padding: '16px 20px',
              borderRadius: '2px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ color: '#d4d4d4', fontWeight: 'bold', fontSize: '14px' }}>
                  {b.nume}
                </span>
                <span style={{ color: cyan, fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>
                  {formatRON(b.valoare)}
                </span>
              </div>
              {b.descriere && (
                <p style={{ color: '#808080', fontSize: '12px', margin: '0 0 8px' }}>{b.descriere}</p>
              )}
              <div style={{ color: '#555', fontSize: '10px' }}>ID: {b.id_beneficiu}</div>
            </div>
          ))}
        </div>
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

const inputStyle = {
  backgroundColor: '#3c3c3c', color: 'white',
  border: '1px solid #555', padding: '8px 12px',
  fontFamily: 'Consolas, monospace', fontSize: '13px',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};