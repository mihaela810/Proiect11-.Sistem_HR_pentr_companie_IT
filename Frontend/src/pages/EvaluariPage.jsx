import { useState, useEffect } from 'react';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function EvaluariPage() {
  const [angajati, setAngajati] = useState([]);
  const [erori, setErori]       = useState([]);
  const [succes, setSucces]     = useState('');
  const [loading, setLoading]   = useState(false);

  const [form, setForm] = useState({
    id_angajat:       '',
    id_evaluator:     '',
    scor_tehnic:      '',
    scor_comunicare:  '',
    scor_leadership:  '',
    feedback:         '',
  });

  useEffect(() => {
    api.get(API.ANGAJATI).then(res => setAngajati(res.data));
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErori([]);
  setSucces('');
  setLoading(true);

  // Validare scoruri 1-10 în frontend (păstrată din codul tău)
  const scoruri = ['scor_tehnic', 'scor_comunicare', 'scor_leadership'];
  for (const s of scoruri) {
    const val = Number(form[s]);
    if (isNaN(val) || val < 1 || val > 10) {
      setErori([`Scorul pentru ${s.replace('_', ' ')} trebuie sa fie intre 1 si 10.`]);
      setLoading(false);
      return;
    }
  }

  // CORECTIE CRITICA: Convertim toate câmpurile în numere (Integer) conform cerințelor bazei de date din app.py
  const dateTrimise = {
    id_angajat: parseInt(form.id_angajat, 10),
    id_evaluator: parseInt(form.id_evaluator, 10),
    scor_tehnic: parseInt(form.scor_tehnic, 10),
    scor_comunicare: parseInt(form.scor_comunicare, 10),
    scor_leadership: parseInt(form.scor_leadership, 10),
    feedback: form.feedback
  };

  try {
    // Presupunând că ai definit ruta în constants/apiRoutes ca API.EVALUARI sau '/api/evaluari'
    await api.post(API.EVALUARI || '/api/evaluari', dateTrimise);
    setSucces('Evaluarea a fost salvata cu succes!');
    setForm({
      id_angajat: '',
      id_evaluator: '',
      scor_tehnic: '',
      scor_comunicare: '',
      scor_leadership: '',
      feedback: '',
    });
  } catch (err) {
    setErori([err.response?.data?.detalii || 'Nu s-a putut salva evaluarea.']);
    } finally {
      setLoading(false);
    }
  };

  const scorFinalCalculat = () => {
    const t = Number(form.scor_tehnic);
    const c = Number(form.scor_comunicare);
    const l = Number(form.scor_leadership);
    if (t && c && l) return ((t + c + l) / 3).toFixed(2);
    return null;
  };

  return (
    <div style={{ fontFamily: 'Consolas, monospace', maxWidth: '650px' }}>

      {/* header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> EVALUARI
        </h2>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          Adaugare evaluare angajat — scorul final se calculeaza automat in backend
        </p>
      </div>

      {/* erori */}
      {erori.length > 0 && (
        <div style={{ backgroundColor: '#2d1a1a', border: `1px solid ${roz}`, padding: '12px 16px', marginBottom: '20px' }}>
          {erori.map((e, i) => (
            <p key={i} style={{ color: roz, margin: '2px 0', fontSize: '12px' }}>ERROR: {e}</p>
          ))}
        </div>
      )}

      {/* succes */}
      {succes && (
        <div style={{ backgroundColor: '#1a2d1a', border: '1px solid #6a9955', padding: '12px 16px', marginBottom: '20px' }}>
          <p style={{ color: '#6a9955', margin: 0, fontSize: '12px' }}>✓ {succes}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* angajat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ color: cyan, fontSize: '11px' }}>ANGAJAT EVALUAT: *</label>
          <select name="id_angajat" value={form.id_angajat}
            onChange={handleChange} required style={selectStyle}>
            <option value="">-- selecteaza angajat --</option>
            {angajati.map(a => (
              <option key={a.id_angajat} value={a.id_angajat}>
                {a.prenume} {a.nume} — {a.nume_departament}
              </option>
            ))}
          </select>
        </div>

        {/* evaluator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ color: cyan, fontSize: '11px' }}>ID EVALUATOR: *</label>
          <input type="number" name="id_evaluator" value={form.id_evaluator}
            onChange={handleChange} required style={inputStyle}
            placeholder="ID-ul angajatului care face evaluarea" />
        </div>

        {/* scoruri */}
        <div style={{
          backgroundColor: '#252526',
          border: '1px solid #333',
          borderLeft: `3px solid ${cyan}`,
          padding: '20px',
          borderRadius: '2px',
        }}>
          <h3 style={{ color: cyan, fontSize: '12px', margin: '0 0 16px' }}>
            SCORURI — valori intre 1 si 10
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { name: 'scor_tehnic',     label: 'SCOR TEHNIC'     },
              { name: 'scor_comunicare', label: 'SCOR COMUNICARE' },
              { name: 'scor_leadership', label: 'SCOR LEADERSHIP' },
            ].map(({ name, label }) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ color: cyan, fontSize: '11px' }}>{label}: *</label>
                  <span style={{ color: form[name] ? roz : '#555', fontSize: '11px' }}>
                    {form[name] || '—'} / 10
                  </span>
                </div>
                {/* slider + input numeric */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="range" name={name} min="1" max="10"
                    value={form[name] || 1}
                    onChange={handleChange}
                    style={{ flex: 1, accentColor: roz, cursor: 'pointer' }}
                  />
                  <input
                    type="number" name={name} min="1" max="10"
                    value={form[name]}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyle, width: '60px', textAlign: 'center' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* preview scor final */}
          {scorFinalCalculat() && (
            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ color: '#808080', fontSize: '12px' }}>
                SCOR FINAL (preview):
              </span>
              <span style={{ color: cyan, fontSize: '22px', fontWeight: 'bold' }}>
                {scorFinalCalculat()}
              </span>
            </div>
          )}
        </div>

        {/* feedback */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ color: cyan, fontSize: '11px' }}>FEEDBACK:</label>
          <textarea
            name="feedback"
            value={form.feedback}
            onChange={handleChange}
            rows={4}
            placeholder="observatii, recomandari, puncte de imbunatatit..."
            style={{
              ...inputStyle,
              resize: 'vertical',
              lineHeight: '1.5',
            }}
          />
        </div>

        {/* submit */}
        <button type="submit" disabled={loading} style={{
          backgroundColor: 'transparent',
          color: loading ? '#555' : roz,
          border: `2px solid ${loading ? '#555' : roz}`,
          padding: '10px 24px',
          fontFamily: 'Consolas, monospace',
          fontSize: '13px',
          cursor: loading ? 'not-allowed' : 'pointer',
          letterSpacing: '1px',
          alignSelf: 'flex-start',
        }}>
          {loading ? 'Se salveaza...' : 'SALVEAZA EVALUAREA'}
        </button>

      </form>
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