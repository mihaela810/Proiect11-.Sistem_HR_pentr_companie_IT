import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function AngajatiPage() {
  const [angajati, setAngajati]   = useState([]);
  const [termen, setTermen]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [eroare, setEroare]       = useState(null);
  const navigate = useNavigate();

  // incarca toti angajatii la prima randare
  useEffect(() => {
    fetchToti();
  }, []);

  const fetchToti = () => {
    setLoading(true);
    setEroare(null);
    api.get(API.ANGAJATI)
      .then(res => setAngajati(res.data))
      .catch(() => setEroare('Nu s-au putut incarca angajatii.'))
      .finally(() => setLoading(false));
  };

  const handleCauta = (e) => {
    e.preventDefault();
    if (!termen.trim()) { fetchToti(); return; }

    setLoading(true);
    setEroare(null);
    api.get(API.ANGAJATI_CAUTA, { params: { termen } })
      .then(res => setAngajati(res.data.rezultate || []))
      .catch(() => setEroare('Eroare la cautare.'))
      .finally(() => setLoading(false));
  };

  const handleDeactiveaza = (id, nume, prenume) => {
    const motiv = window.prompt(`Introdu motivul dezactivării pentru ${prenume} ${nume}:`);
  
  // Dacă utilizatorul a apăsat Cancel sau a lăsat gol, oprim execuția (evităm eroarea din backend)
      if (motiv === null) return;
      if (motiv.trim() === "") {
        alert("Motivul este obligatoriu conform regulilor sistemului!");
      return;
      }

      setLoading(true);
  // Apelăm endpoint-ul exact din app.py, trimițând corpul JSON cerut
      api.post(`/api/angajati/${id}/dezactiveaza`, { motiv_dezactivare: motiv })
        .then((res) => {
          alert(`Contul lui ${prenume} ${nume} a fost dezactivat.`);
          fetchToti(); // Reîncărcăm lista pentru a vedea starea actualizată din baza de date
        })
        .catch((err) => {
          alert(err.response?.data?.detalii || 'Eroare la dezactivarea angajatului.');
        })
        .finally(() => setLoading(false));
  };

  return (
    <div style={{ fontFamily: 'Consolas, monospace' }}>

      {/* header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> ANGAJATI
        </h2>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          Toti angajatii
        </p>
      </div>

      {/* bara de actiuni */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>

        {/* cautare */}
        <form onSubmit={handleCauta} style={{ display: 'flex', gap: '8px', flex: 1 }}>
          <input
            type="text"
            placeholder="cauta dupa nume, prenume, email sau ID..."
            value={termen}
            onChange={e => setTermen(e.target.value)}
            style={{
              backgroundColor: '#3c3c3c',
              color: 'white',
              border: `1px solid #555`,
              padding: '7px 12px',
              fontFamily: 'Consolas, monospace',
              fontSize: '12px',
              flex: 1,
              outline: 'none',
            }}
          />
          <button type="submit" style={btnStyle(cyan)}>CAUTA</button>
          <button type="button" onClick={() => { setTermen(''); fetchToti(); }} style={btnStyle('#808080')}>
            RESET
          </button>
        </form>

        {/* adauga angajat */}
        <button
          onClick={() => navigate('/angajati/nou')}
          style={btnStyle(roz)}
        >
          + ADAUGA
        </button>
      </div>

      {/* stari */}
      {loading && <p style={{ color: '#808080' }}>Se incarca...</p>}
      {eroare  && <p style={{ color: roz }}>ERROR: {eroare}</p>}
      {!loading && !eroare && angajati.length === 0 && (
        <p style={{ color: '#808080' }}>Nu au fost gasiti angajati.</p>
      )}

      {/* tabel */}
      {!loading && angajati.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px',
          }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${roz}` }}>
                {['ID', 'NUME', 'EMAIL', 'TELEFON', 'DEPARTAMENT', 'POZITIE', 'SALARIU', 'ACTIUNI'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    color: cyan,
                    fontWeight: 'normal',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {angajati.map((a, idx) => (
                <tr
                  key={a.id_angajat}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#1e1e1e' : '#252526',
                    borderBottom: '1px solid #2d2d2d',
                  }}
                >
                  <td style={tdStyle}>{a.id_angajat}</td>
                  <td style={{ ...tdStyle, color: '#d4d4d4', fontWeight: 'bold' }}>
                    {a.prenume} {a.nume}
                  </td>
                  <td style={tdStyle}>{a.email}</td>
                  <td style={tdStyle}>{a.telefon}</td>
                  <td style={tdStyle}>{a.nume_departament || '—'}</td>
                  <td style={tdStyle}>{a.titlu_pozitie || '—'}</td>
                  <td style={{ ...tdStyle, color: cyan }}>
                    {Number(a.salariu_curent).toLocaleString('ro-RO')} RON
                  </td>
                  <td style={{ ...tdStyle, display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => navigate(`/angajati/${a.id_angajat}`)}
                      style={btnMicStyle(cyan)}
                    >
                      PROFIL
                    </button>
                    <button
                      onClick={() => navigate(`/angajati/${a.id_angajat}/editeaza`)}
                      style={btnMicStyle('#f39c12')}
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDeactiveaza(a.id_angajat, a.nume, a.prenume)}
                      style={btnMicStyle(roz)}
                    >
                      DEZACT
                    </button>
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

// stiluri reutilizabile
const tdStyle = {
  padding: '9px 12px',
  color: '#9cdcfe',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

const btnStyle = (culoare) => ({
  backgroundColor: 'transparent',
  color: culoare,
  border: `1px solid ${culoare}`,
  padding: '7px 14px',
  fontFamily: 'Consolas, monospace',
  fontSize: '12px',
  cursor: 'pointer',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
});

const btnMicStyle = (culoare) => ({
  backgroundColor: 'transparent',
  color: culoare,
  border: `1px solid ${culoare}`,
  padding: '3px 8px',
  fontFamily: 'Consolas, monospace',
  fontSize: '10px',
  cursor: 'pointer',
});