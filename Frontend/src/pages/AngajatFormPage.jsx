import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

const campGol = {
  nume: '', prenume: '', cnp: '', email: '', telefon: '',
  an_angajare: '', luna_angajare: '', id_departament: '',
  id_pozitie: '', salariu_curent: '',
};

export default function AngajatFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const esteEditare = Boolean(id);

  const [form, setForm]               = useState(campGol);
  const [departamente, setDepartamente] = useState([]);
  const [pozitii, setPozitii]           = useState([]);
  const [erori, setErori]               = useState([]);
  const [succes, setSucces]             = useState('');
  const [loading, setLoading]           = useState(false);

  // incarca departamente si pozitii pentru selecturi
  useEffect(() => {
    api.get(API.DEPARTAMENTE).then(res => setDepartamente(res.data));
    api.get(API.POZITII).then(res => setPozitii(res.data));

    // daca e editare, incarca datele angajatului
    if (esteEditare) {
      api.get(API.ANGAJAT_PROFIL(id)).then(res => {
        const a = res.data;
        const dataAngajare = new Date(a.data_angajare);
        setForm({
          nume:            a.nume           || '',
          prenume:         a.prenume        || '',
          cnp:             a.cnp            || '',
          email:           a.email          || '',
          telefon:         a.telefon        || '',
          an_angajare:     dataAngajare.getFullYear() || '',
          luna_angajare:   dataAngajare.getMonth() + 1 || '',
          id_departament:  a.id_departament || '',
          id_pozitie:      a.id_pozitie     || '',
          salariu_curent:  a.salariu_curent || '',
        });
      });
    }
  }, [id]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEerori([]);
    setSucces('');
    setLoading(true);

    try {
      if (esteEditare) {
        await api.put(API.ANGAJAT_UPDATE(id), form);
        setSucces('Angajat actualizat cu succes!');
      } else {
        await api.post(API.ANGAJATI, form);
        setSucces('Angajat adaugat cu succes!');
        setForm(campGol);
      }
      setTimeout(() => navigate('/angajati'), 1500);
    } catch (err) {
      const data = err.response?.data;
      if (data?.mesaje) setErori(data.mesaje);
      else if (data?.mesaj) setErori([data.mesaj]);
      else setErori(['Eroare neasteptata. Incearca din nou.']);
    } finally {
      setLoading(false);
    }
  };

  const dateTrimise = {
    ...form,
    an_angajare: parseInt(form.an_angajare, 10),
    luna_angajare: parseInt(form.luna_angajare, 10),
    id_departament: parseInt(form.id_departament, 10),
    id_pozitie: parseInt(form.id_pozitie, 10),
    salariu_curent: parseFloat(form.salariu_curent)
  };

  try {
    if (esteEditare) {
      await api.put(`${API.ANGAJATI}/${id}`, dateTrimise);
      setSucces('Angajatul a fost actualizat cu succes!');
    } else {
      await api.post(API.ANGAJATI, dateTrimise);
      setSucces('Angajatul a fost adăugat cu succes!');
      setForm(campGol); // Resetăm doar la adăugare
    }
  } catch (err) {
    // Corecție critică: mapăm array-ul de erori trimis de backend-ul tău din app.py
    if (err.response?.data?.erori) {
      setErori(err.response.data.erori);
    } else {
      setErori([err.response?.data?.detalii || 'A apărut o eroare la salvarea datelor.']);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ fontFamily: 'Consolas, monospace', maxWidth: '600px' }}>

      {/* header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span>{' '}
          {esteEditare ? 'EDITEAZA ANGAJAT' : 'ADAUGA ANGAJAT'}
        </h2>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          {esteEditare ? `modificare date angajat ID: ${id}` : 'introducere angajat nou'}
        </p>
      </div>

      {/* erori din backend */}
      {erori.length > 0 && (
        <div style={{ backgroundColor: 'rgba(244,71,71,0.1)', border: '1px solid #f44747', padding: '12px', marginBottom: '20px' }}>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#f44747', fontFamily: 'Consolas, monospace', fontSize: '13px' }}>
        {erori.map((err, index) => (
          <li key={index}>{err}</li>
        ))}
      </ul>
    </div>
  )}

      {/* mesaj succes */}
      {succes && (
        <div style={{
          backgroundColor: '#1a2d1a',
          border: '1px solid #6a9955',
          padding: '12px 16px',
          marginBottom: '20px',
          borderRadius: '2px',
        }}>
          <p style={{ color: '#6a9955', margin: 0, fontSize: '12px' }}>✓ {succes}</p>
        </div>
      )}

      {/* formular */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* rand dublu */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <Camp label="PRENUME" name="prenume" value={form.prenume} onChange={handleChange} required />
          <Camp label="NUME"    name="nume"    value={form.nume}    onChange={handleChange} required />
        </div>

        <Camp
          label="CNP"
          name="cnp"
          value={form.cnp}
          onChange={handleChange}
          placeholder="ex: 1950101XXXXXX"
          required
          disabled={esteEditare} // Opțional: app.py permite editarea, dar de obicei CNP-ul rămâne fix
        />

        <Camp label="EMAIL" name="email" type="email" value={form.email}
          onChange={handleChange} required />

        <Camp label="TELEFON" name="telefon" value={form.telefon}
          onChange={handleChange} placeholder="07xx xxx xxx" required />

        <div style={{ display: 'flex', gap: '16px' }}>
          <Camp label="AN ANGAJARE"  name="an_angajare"   type="number"
            value={form.an_angajare}  onChange={handleChange}
            placeholder="2024" required />
          <Camp label="LUNA ANGAJARE" name="luna_angajare" type="number"
            value={form.luna_angajare} onChange={handleChange}
            placeholder="1-12" required />
        </div>

        {/* departament select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <label style={{ color: cyan, fontSize: '11px', letterSpacing: '0.5px' }}>
            DEPARTAMENT:
          </label>
          <select
            name="id_departament"
            value={form.id_departament}
            onChange={handleChange}
            required
            style={selectStyle}
          >
            <option value="">-- selecteaza --</option>
            {departamente.map(d => (
              <option key={d.id_departament} value={d.id_departament}>
                {d.nume}
              </option>
            ))}
          </select>
        </div>

        {/* pozitie select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <label style={{ color: cyan, fontSize: '11px', letterSpacing: '0.5px' }}>
            POZITIE:
          </label>
          <select
            name="id_pozitie"
            value={form.id_pozitie}
            onChange={handleChange}
            required
            style={selectStyle}
          >
            <option value="">-- selecteaza --</option>
            {pozitii.map(p => (
              <option key={p.id_pozitie} value={p.id_pozitie}>
                {p.titlu}
              </option>
            ))}
          </select>
        </div>

        <Camp label="SALARIU CURENT (RON)" name="salariu_curent" type="number"
          value={form.salariu_curent} onChange={handleChange}
          placeholder="ex: 8000" required />

        {/* butoane */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button type="submit" disabled={loading} style={{
            backgroundColor: 'transparent',
            color: loading ? '#555' : roz,
            border: `2px solid ${loading ? '#555' : roz}`,
            padding: '10px 24px',
            fontFamily: 'Consolas, monospace',
            fontSize: '13px',
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '1px',
          }}>
            {loading ? 'Se salveaza...' : esteEditare ? 'SALVEAZA MODIFICARI' : 'ADAUGA ANGAJAT'}
          </button>

          <button type="button" onClick={() => navigate('/angajati')} style={{
            backgroundColor: 'transparent',
            color: '#808080',
            border: '1px solid #808080',
            padding: '10px 20px',
            fontFamily: 'Consolas, monospace',
            fontSize: '13px',
            cursor: 'pointer',
          }}>
            ANULEAZA
          </button>
        </div>

      </form>
    </div>
  );


// componenta camp reutilizabila
function Camp({ label, name, value, onChange, type = 'text', placeholder, required, disabled }) {
  const cyan = '#4ec9b0';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
      <label style={{ color: cyan, fontSize: '11px', letterSpacing: '0.5px' }}>
        {label}{required && <span style={{ color: '#ff22a1' }}> *</span>}
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
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

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