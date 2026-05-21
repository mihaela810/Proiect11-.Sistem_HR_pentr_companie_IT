import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

const campGol = {
  nume: '', 
  prenume: '', 
  cnp: '', 
  email: '', 
  telefon: '',
  an_angajare: '', 
  luna_angajare: '', 
  id_departament: '',
  id_pozitie: '', 
  salariu_curent: '',
};

export default function AngajatFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const esteEditare = Boolean(id);

  const [form, setForm]                 = useState(campGol);
  const [departamente, setDepartamente] = useState([]);
  const [pozitii, setPozitii]           = useState([]);
  const [erori, setErori]               = useState([]);
  const [succes, setSucces]             = useState('');
  const [loading, setLoading]           = useState(false);

  // Încarcă departamente și poziții pentru selecturi
  useEffect(() => {
    api.get(API.DEPARTAMENTE)
      .then(res => setDepartamente(Array.isArray(res.data) ? res.data : []))
      .catch(() => console.error("Eroare la incarcarea departamentelor."));

    api.get(API.POZITII)
      .then(res => setPozitii(Array.isArray(res.data) ? res.data : []))
      .catch(() => console.error("Eroare la incarcarea pozitiilor."));

    // Dacă este editare, încarcă datele angajatului existent
    if (esteEditare) {
      setLoading(true);
      api.get(`${API.ANGAJATI}/${id}`)
        .then(res => {
          if (res.data) {
            setForm({
              nume: res.data.nume || '',
              prenume: res.data.prenume || '',
              cnp: res.data.cnp || '',
              email: res.data.email || '',
              telefon: res.data.telefon || '',
              an_angajare: res.data.an_angajare || '',
              luna_angajare: res.data.luna_angajare || '',
              id_departament: res.data.id_departament || '',
              id_pozitie: res.data.id_pozitie || '',
              salariu_curent: res.data.salariu_curent || '',
            });
          }
        })
        .catch(() => setErori(['Nu s-au putut incarca datele angajatului.']))
        .finally(() => setLoading(false));
    }
  }, [id, esteEditare]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErori([]);
    setSucces('');
    setLoading(true);

    // Pregătire payload curat pentru backend (conversii tipuri de date)
    const payload = {
      ...form,
      an_angajare: parseInt(form.an_angajare, 10),
      luna_angajare: parseInt(form.luna_angajare, 10),
      id_departament: parseInt(form.id_departament, 10),
      id_pozitie: parseInt(form.id_pozitie, 10),
      salariu_curent: parseFloat(form.salariu_curent)
    };

    try {
      if (esteEditare) {
        await api.put(`${API.ANGAJATI}/${id}`, payload);
        setSucces('Datele angajatului au fost actualizate cu succes!');
      } else {
        await api.post(API.ANGAJATI, payload);
        setSucces('Angajatul a fost adaugat cu succes!');
        setForm(campGol); // Resetare doar la adăugare
      }
      setTimeout(() => navigate('/angajati'), 1500);
    } catch (err) {
      setErori([err.response?.data?.detalii || 'A aparut o eroare la salvarea datelor.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Consolas, monospace', color: '#d4d4d4', backgroundColor: '#1e1e1e', minHeight: '100vh' }}>
      
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '20px' }}>
          {esteEditare ? 'Editează Angajat' : 'Adaugă Angajat Nou'}
        </h2>
        <p style={{ margin: '4px 0 0', color: '#808080', fontSize: '12px' }}>
          {esteEditare ? `Modificare profil ID: ${id}` : 'Introduceți datele noului angajat'}
        </p>
      </div>

      {erori.map((err, i) => <div key={i} style={{ color: roz, marginBottom: '10px', fontSize: '13px' }}>⚠️ {err}</div>)}
      {succes && <div style={{ color: '#6a9955', marginBottom: '10px', fontSize: '13px' }}>✅ {succes}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#252526', padding: '24px', border: '1px solid #333' }}>
        
        {/* RAND 1 */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Camp label="NUME *" name="nume" value={form.nume} onChange={handleChange} required />
          <Camp label="PRENUME *" name="prenume" value={form.prenume} onChange={handleChange} required />
          <Camp label="CNP *" name="cnp" value={form.cnp} onChange={handleChange} required placeholder="13 cifre" />
        </div>

        {/* RAND 2 */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Camp label="EMAIL *" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Camp label="TELEFON *" name="telefon" value={form.telefon} onChange={handleChange} required />
          <Camp label="SALARIU BRUT (RON) *" name="salariu_curent" type="number" value={form.salariu_curent} onChange={handleChange} required />
        </div>

        {/* RAND 3 */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Camp label="AN ANGAJARE *" name="an_angajare" type="number" value={form.an_angajare} onChange={handleChange} required placeholder="ex: 2024" />
          <Camp label="LUNA ANGAJARE (1-12) *" name="luna_angajare" type="number" value={form.luna_angajare} onChange={handleChange} required placeholder="ex: 5" />
        </div>

        {/* RAND 4 (SELECTURI) */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' }}>
            <label style={{ color: cyan, fontSize: '11px' }}>DEPARTAMENT *</label>
            <select name="id_departament" value={form.id_departament} onChange={handleChange} style={selectStyle} required>
              <option value="">-- Selecteaza Departament --</option>
              {departamente.map(d => (
                <option key={d.id_departament} value={d.id_departament}>{d.nume}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' }}>
            <label style={{ color: cyan, fontSize: '11px' }}>POZITIE / FUNCTIE *</label>
            <select name="id_pozitie" value={form.id_pozitie} onChange={handleChange} style={selectStyle} required>
              <option value="">-- Selecteaza Pozitie --</option>
              {pozitii.map(p => (
                <option key={p.id_pozitie} value={p.id_pozitie}>{p.titlu} ({p.nivel})</option>
              ))}
            </select>
          </div>
        </div>

        {/* BUTOANE ACTIONS */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button type="submit" disabled={loading} style={btnStyle(roz)}>
            {loading ? 'Se salveaza...' : 'SALVEAZA MODIFICARILE'}
          </button>
          <button type="button" onClick={() => navigate('/angajati')} style={btnStyle('#808080')}>
            ANULEAZA
          </button>
        </div>

      </form>
    </div>
  );
}

function Camp({ label, name, value, onChange, type = 'text', placeholder, required, disabled }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' }}>
      <label style={{ color: cyan, fontSize: '11px' }}>
        {label}{required && <span style={{ color: roz }}> *</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{
          backgroundColor: disabled ? '#2a2a2a' : '#3c3c3c',
          color: disabled ? '#555' : 'white',
          border: '1px solid #555',
          padding: '8px 12px',
          fontFamily: 'Consolas, monospace',
          fontSize: '13px',
          outline: 'none',
        }}
      />
    </div>
  );
}

const btnStyle = (culoare) => ({
  backgroundColor: 'transparent',
  color: culoare,
  border: `1px solid ${culoare}`,
  padding: '10px 20px',
  fontFamily: 'Consolas, monospace',
  fontSize: '13px',
  cursor: 'pointer',
  letterSpacing: '0.5px',
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