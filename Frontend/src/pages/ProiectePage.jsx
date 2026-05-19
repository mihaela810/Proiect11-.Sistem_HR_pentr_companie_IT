import { useState, useEffect } from 'react';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

const statusCuloare = {
  'in desfasurare': '#6a9955',
  'finalizat':      '#4ec9b0',
  'anulat':         '#ff22a1',
  'planificat':     '#f39c12',
};

export default function ProiectePage() {
  const [proiecte, setProiecte] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [erori, setErori]       = useState([]);
  const [succes, setSucces]     = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    nume:         '',
    descriere:    '',
    data_start:   '',
    data_sfarsit: '',
    status:       'planificat',
    buget:        '',
  });

  useEffect(() => { fetchProiecte(); }, []);

  const fetchProiecte = () => {
    setLoading(true);
    api.get(API.PROIECTE)
      .then(res => setProiecte(res.data))
      .catch(() => setErori(['Nu s-au putut incarca proiectele.']))
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErori([]); // CORECT: Curăță array-ul de erori existent fără să-l redeclare!
  setSucces('');

  // 1. Validare și conversie Buget
  const bugetNumeric = parseFloat(form.buget);
  if (isNaN(bugetNumeric) || bugetNumeric <= 0) {
    setErori(['Bugetul trebuie să fie un număr pozitiv valid!']);
    return;
  }

  // 2. Validare logică pentru date
  if (form.data_sfarsit && new Date(form.data_start) > new Date(form.data_sfarsit)) {
    setErori(['Data de sfârșit nu poate fi anterioară datei de start!']);
    return;
  }

  // 3. Construire obiect curat (Trimitere NULL în loc de string gol pentru MySQL)
  const dateProiect = {
    nume: form.nume.trim(),
    descriere: form.descriere ? form.descriere.trim() : null,
    data_start: form.data_start,
    data_sfarsit: form.data_sfarsit && form.data_sfarsit.trim() !== '' ? form.data_sfarsit : null,
    status: form.status,
    buget: bugetNumeric
  };

  try {
    await api.post(API.PROIECTE, dateProiect);
    setSucces('Proiectul a fost creat cu succes!');
    
    setForm({
      nume: '',
      descriere: '',
      data_start: '',
      data_sfarsit: '',
      status: 'planificat',
      buget: '',
    });
    
    setShowForm(false);
    fetchProiecte();
  } catch (err) {
    const mesajEroare = err.response?.data?.detalii || 'Eroare la salvarea proiectului.';
    setErori([mesajEroare]);
  }
};

  const formatRON  = (v) => v ? `${Number(v).toLocaleString('ro-RO')} RON` : '—';
  const formatData = (d) => d ? new Date(d).toLocaleDateString('ro-RO') : '—';

  return (
    <div style={{ fontFamily: 'Consolas, monospace' }}>

      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
            <span style={{ color: cyan }}>{'>'}</span> PROIECTE
          </h2>
          <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
            Lista proiecte — {proiecte.length} total
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setErori([]); }}
          style={btnStyle(showForm ? '#808080' : roz)}
        >
          {showForm ? 'ANULEAZA' : '+ PROIECT NOU'}
        </button>
      </div>

      {/* mesaje */}
      {erori.length > 0 && (
        <div style={{ backgroundColor: '#2d1a1a', border: `1px solid ${roz}`, padding: '12px 16px', marginBottom: '20px' }}>
          {erori.map((e, i) => (
            <p key={i} style={{ color: roz, margin: '2px 0', fontSize: '12px' }}>ERROR: {e}</p>
          ))}
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
          backgroundColor: '#252526',
          border: '1px solid #333',
          borderLeft: `3px solid ${roz}`,
          padding: '24px',
          marginBottom: '32px',
          borderRadius: '2px',
        }}>
          <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 20px' }}>PROIECT NOU</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <Camp label="NUME PROIECT" name="nume" value={form.nume}
              onChange={handleChange} required />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: cyan, fontSize: '11px' }}>DESCRIERE:</label>
              <textarea name="descriere" value={form.descriere} onChange={handleChange}
                rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="descriere proiect..." />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ color: cyan, fontSize: '11px' }}>DATA START: *</label>
                <input type="date" name="data_start" value={form.data_start}
                  onChange={handleChange} required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ color: cyan, fontSize: '11px' }}>DATA SFARSIT:</label>
                <input type="date" name="data_sfarsit" value={form.data_sfarsit}
                  onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ color: cyan, fontSize: '11px' }}>STATUS: *</label>
                <select name="status" value={form.status}
                  onChange={handleChange} required style={selectStyle}>
                  {['planificat', 'in desfasurare', 'finalizat', 'anulat'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Camp label="BUGET (RON)" name="buget" type="number"
                value={form.buget} onChange={handleChange}
                placeholder="ex: 50000" />
            </div>

            <button type="submit" style={{
              ...btnStyle(roz),
              alignSelf: 'flex-start',
              padding: '10px 24px',
              fontSize: '13px',
              border: `2px solid ${roz}`,
            }}>
              CREEAZA PROIECT
            </button>
          </form>
        </div>
      )}

      {/* lista proiecte */}
      {loading && <p style={{ color: '#808080' }}>Se incarca...</p>}

      {!loading && proiecte.length === 0 && (
        <p style={{ color: '#808080' }}>Nu exista proiecte inregistrate.</p>
      )}

      {!loading && proiecte.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {proiecte.map(p => (
            <div key={p.id_proiect} style={{
              backgroundColor: '#252526',
              border: '1px solid #333',
              borderLeft: `3px solid ${statusCuloare[p.status] || '#555'}`,
              padding: '16px 20px',
              borderRadius: '2px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
              flexWrap: 'wrap',
            }}>
              {/* info stanga */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ color: '#d4d4d4', fontWeight: 'bold', fontSize: '14px' }}>
                    {p.nume}
                  </span>
                  <span style={{
                    color: statusCuloare[p.status] || '#555',
                    border: `1px solid ${statusCuloare[p.status] || '#555'}`,
                    padding: '2px 8px',
                    fontSize: '10px',
                    letterSpacing: '0.5px',
                  }}>
                    {p.status?.toUpperCase()}
                  </span>
                </div>
                {p.descriere && (
                  <p style={{ color: '#808080', fontSize: '12px', margin: '0 0 8px' }}>
                    {p.descriere}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#6a9955', fontSize: '11px' }}>
                    START: {formatData(p.data_start)}
                  </span>
                  {p.data_sfarsit && (
                    <span style={{ color: '#6a9955', fontSize: '11px' }}>
                      SFARSIT: {formatData(p.data_sfarsit)}
                    </span>
                  )}
                </div>
              </div>

              {/* info dreapta */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#808080', fontSize: '10px', marginBottom: '4px' }}>BUGET</div>
                <div style={{ color: cyan, fontSize: '16px', fontWeight: 'bold' }}>
                  {formatRON(p.buget)}
                </div>
                <div style={{ color: '#555', fontSize: '10px', marginTop: '8px' }}>
                  ID: {p.id_proiect}
                </div>
              </div>
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

const inputStyle = {
  backgroundColor: '#3c3c3c',
  color: 'white',
  border: '1px solid #555',
  padding: '8px 12px',
  fontFamily: 'Consolas, monospace',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const selectStyle = {
  backgroundColor: '#3c3c3c',
  color: 'white',
  border: '1px solid #555',
  padding: '8px 12px',
  fontFamily: 'Consolas, monospace',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
};