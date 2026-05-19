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
    api.get(API.ANGAJATI).then(res => setAngajati(res.data));
  }, []);

  const fetchConcedii = () => {
    setLoading(true);
    // folosim endpoint-ul de angajati si afisam concediile din profil
    // pentru o lista completa ar trebui un endpoint dedicat GET /api/concedii
    // momentan simulam cu date din angajati
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErori([]);
  setSucces('');

  // Corecție: parsăm ID-urile în numere întregi înainte de a le expedia în Flask
  const dateConcediu = {
    ...form,
    id_angajat: parseInt(form.id_angajat, 10),
    id_aprobator: parseInt(form.id_aprobator, 10)
  };

  try {
    await api.post(API.CONCEDII, dateConcediu);
    setSucces('Cererea de concediu a fost înregistrată cu succes!');
    setForm({ id_angajat: '', tip: 'odihna', data_start: '', data_sfarsit: '', id_aprobator: 1 });
    fetchConcedii();
  } catch (err) {
    setErori([err.response?.data?.detalii || 'Eroare la trimiterea cererii de concediu. Verifică datele introduse.']);
  }
};

  const handleDecizie = async (idConcediu, statusNou, idManager) => {
  setErori([]);
  setSucces('');
  try {
    // Presupunând că ruta din app.py folosește structura standard: /api/concedii/<id>/decizie
    // Trimitem statusul ('aprobat'/'respins') și id_manager parsate numeric
    await api.post(`/api/concedii/${parseInt(idConcediu, 10)}/decizie`, {
      status: statusNou,
      id_manager: parseInt(idManager, 10)
    });
    
    setSucces(`Concediul a fost ${statusNou} cu succes!`);
    fetchConcedii();
  } catch (err) {
    setErori([err.response?.data?.detalii || `Nu s-a putut procesa decizia de ${statusNou}.`]);
  }
};

  return (
    <div style={{ fontFamily: 'Consolas, monospace', maxWidth: '900px' }}>

      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
            <span style={{ color: cyan }}>{'>'}</span> CONCEDII
          </h2>
          <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
            Gestionare cereri de concediu
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setErori([]); setSucces(''); }}
          style={btnStyle(showForm ? '#808080' : roz)}
        >
          {showForm ? 'ANULEAZA' : '+ CERERE NOUA'}
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

      {/* formular cerere noua */}
      {showForm && (
        <div style={{
          backgroundColor: '#252526',
          border: '1px solid #333',
          borderLeft: `3px solid ${roz}`,
          padding: '24px',
          marginBottom: '32px',
          borderRadius: '2px',
        }}>
          <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 20px' }}>
            CERERE CONCEDIU NOUA
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* angajat select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: cyan, fontSize: '11px' }}>ANGAJAT: *</label>
              <select name="id_angajat" value={form.id_angajat}
                onChange={handleChange} required style={selectStyle}>
                <option value="">-- selecteaza angajat --</option>
                {angajati.map(a => (
                  <option key={a.id_angajat} value={a.id_angajat}>
                    {a.prenume} {a.nume} (ID: {a.id_angajat})
                  </option>
                ))}
              </select>
            </div>

            {/* tip concediu */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: cyan, fontSize: '11px' }}>TIP CONCEDIU: *</label>
              <select name="tip" value={form.tip}
                onChange={handleChange} required style={selectStyle}>
                {tipuriConcediu.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* date */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ color: cyan, fontSize: '11px' }}>DATA START: *</label>
                <input type="date" name="data_start" value={form.data_start}
                  onChange={handleChange} required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ color: cyan, fontSize: '11px' }}>DATA SFARSIT: *</label>
                <input type="date" name="data_sfarsit" value={form.data_sfarsit}
                  onChange={handleChange} required style={inputStyle} />
              </div>
            </div>

            {/* id aprobator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: cyan, fontSize: '11px' }}>ID MANAGER APROBATOR: *</label>
              <input type="number" name="id_aprobator" value={form.id_aprobator}
                onChange={handleChange} required style={inputStyle}
                placeholder="ID-ul managerului care aproba" />
            </div>

            <button type="submit" style={{
              ...btnStyle(roz),
              alignSelf: 'flex-start',
              padding: '10px 24px',
            }}>
              TRIMITE CERERE
            </button>
          </form>
        </div>
      )}

      {/* sectiune aprobare/respingere */}
      <div style={{
        backgroundColor: '#252526',
        border: '1px solid #333',
        borderLeft: `3px solid ${cyan}`,
        padding: '24px',
        borderRadius: '2px',
      }}>
        <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 16px' }}>
          PROCESARE CERERI — DECIZIE RAPIDA
        </h3>
        <p style={{ color: '#808080', fontSize: '12px', margin: '0 0 16px' }}>
          Introdu ID-ul cererii si ID-ul managerului pentru a aproba sau respinge.
        </p>

        <DecizieRapida onDecizie={handleDecizie} />
      </div>

    </div>
  );
}

function DecizieRapida({ onDecizie }) {
  const cyan = '#4ec9b0';
  const roz  = '#ff22a1';
  const [idConcediu, setIdConcediu] = useState('');
  const [idManager,  setIdManager]  = useState('');

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ color: cyan, fontSize: '11px' }}>ID CERERE:</label>
        <input type="number" value={idConcediu}
          onChange={e => setIdConcediu(e.target.value)}
          style={{ ...inputStyle, width: '120px' }}
          placeholder="ex: 5" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ color: cyan, fontSize: '11px' }}>ID MANAGER:</label>
        <input type="number" value={idManager}
          onChange={e => setIdManager(e.target.value)}
          style={{ ...inputStyle, width: '120px' }}
          placeholder="ex: 1" />
      </div>
      <button
        onClick={() => onDecizie(idConcediu, 'aprobat', Number(idManager))}
        disabled={!idConcediu || !idManager}
        style={btnStyle('#6a9955')}
      >
        APROBA
      </button>
      <button
        onClick={() => onDecizie(idConcediu, 'respins', Number(idManager))}
        disabled={!idConcediu || !idManager}
        style={btnStyle(roz)}
      >
        RESPINGE
      </button>
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

const inputStyle = {
  backgroundColor: '#3c3c3c',
  color: 'white',
  border: '1px solid #555',
  padding: '8px 12px',
  fontFamily: 'Consolas, monospace',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
};