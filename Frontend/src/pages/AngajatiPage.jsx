import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function AngajatiPage() {
  const [angajati, setAngajati]         = useState([]);
  const [termen, setTermen]             = useState('');
  const [departamente, setDepartamente] = useState([]);
  const [pozitii, setPozitii]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [eroare, setEroare]             = useState(null);
  const navigate = useNavigate();

  const [filtruDept,   setFiltruDept]   = useState('');
  const [filtruPoz,    setFiltruPoz]    = useState('');
  const [filtruStatus, setFiltruStatus] = useState('');
  const [sortare,      setSortare]      = useState('nume_asc');

  const { user } = useAuth();
  const rol = user?.rol || '';

  const poateEdita  = ['ceo'].includes(rol);
  const poateAdauga = ['hr_manager', 'ceo'].includes(rol);

  const fetchToti = () => {
    setLoading(true);
    setEroare(null);

    if (['project_manager', 'team_leader'].includes(rol)) {
      api.get(API.VIEW_TEAM_LEADER)
        .then(res => setAngajati(res.data.date_echipa || res.data || []))
        .catch(() => setEroare('Nu s-au putut incarca angajatii alocati.'))
        .finally(() => setLoading(false));
    } else {
      api.get(API.ANGAJATI)
        .then(res => setAngajati(res.data))
        .catch(() => setEroare('Nu s-au putut incarca angajatii.'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    // app_readonly nu are acces — nu facem niciun request
    if (!rol || rol === 'app_readonly') {
      setLoading(false);
      return;
    }

    fetchToti();
    api.get(API.DEPARTAMENTE).then(res => setDepartamente(res.data)).catch(() => {});
    api.get(API.POZITII).then(res => setPozitii(res.data)).catch(() => {});
  }, [rol]); // rol in dependency array — se reruleaza daca rolul se schimba

  // acces interzis pentru app_readonly — returnam inainte de orice render
  if (rol === 'app_readonly') {
    return (
      <div style={{ fontFamily: 'Consolas, monospace', maxWidth: '800px' }}>
        <h2 style={{ color: roz, margin: '0 0 20px', fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> ANGAJATI
        </h2>
        <div style={{
          backgroundColor: '#2d1a1a', border: `1px solid ${roz}`,
          borderLeft: `3px solid ${roz}`, padding: '20px 24px',
          fontSize: '12px', color: '#808080',
        }}>
          <span style={{ color: roz }}>ACCES RESTRICTIONAT</span>
          {' — '}Rolul <span style={{ color: '#f39c12' }}>app_readonly</span> nu are acces la lista angajatilor.
        </div>
      </div>
    );
  }

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

  const handleFiltrare = () => {
    setLoading(true);
    setEroare(null);
    const params = { sortare };
    if (filtruDept)   params.departament = filtruDept;
    if (filtruPoz)    params.pozitie     = filtruPoz;
    if (filtruStatus) params.status      = filtruStatus;
    api.get(API.ANGAJATI_FILTRARE, { params })
      .then(res => setAngajati(res.data.angajati || []))
      .catch(() => setEroare('Eroare la filtrare.'))
      .finally(() => setLoading(false));
  };

  const handleResetFiltre = () => {
    setFiltruDept('');
    setFiltruPoz('');
    setFiltruStatus('');
    setSortare('nume_asc');
    fetchToti();
  };

  const handleDeactiveaza = (id, nume, prenume) => {
    const motiv = window.prompt(`Introdu motivul dezactivarii pentru ${prenume} ${nume}:`);
    if (motiv === null) return;
    if (motiv.trim() === '') {
      alert('Motivul este obligatoriu conform regulilor sistemului!');
      return;
    }
    setLoading(true);
    api.post(`/api/angajati/${id}/dezactiveaza`, { motiv_dezactivare: motiv })
      .then(() => { alert(`Contul lui ${prenume} ${nume} a fost dezactivat.`); fetchToti(); })
      .catch(err => alert(err.response?.data?.detalii || 'Eroare la dezactivarea angajatului.'))
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
          {angajati.length} angajati
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
              backgroundColor: '#3c3c3c', color: 'white',
              border: '1px solid #555', padding: '7px 12px',
              fontFamily: 'Consolas, monospace', fontSize: '12px',
              flex: 1, outline: 'none',
            }}
          />
          <button type="submit" style={btnStyle(cyan)}>CAUTA</button>
          <button type="button" onClick={() => { setTermen(''); fetchToti(); }} style={btnStyle('#808080')}>
            RESET
          </button>
        </form>

        {/* filtre — nu pentru project_manager si team_leader */}
        {!['project_manager', 'team_leader'].includes(rol) && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={filtruDept} onChange={e => setFiltruDept(e.target.value)} style={selectStyle}>
              <option value="">TOATE DEPARTAMENTELE</option>
              {departamente.map(d => (
                <option key={d.id_departament} value={d.id_departament}>{d.nume}</option>
              ))}
            </select>
            <select value={filtruPoz} onChange={e => setFiltruPoz(e.target.value)} style={selectStyle}>
              <option value="">TOATE POZITIILE</option>
              {pozitii.map(p => (
                <option key={p.id_pozitie} value={p.id_pozitie}>{p.titlu}</option>
              ))}
            </select>
            <select value={filtruStatus} onChange={e => setFiltruStatus(e.target.value)} style={selectStyle}>
              <option value="">TOATE STATUSURILE</option>
              <option value="activ">ACTIV</option>
              <option value="inactiv">INACTIV</option>
            </select>
            <select value={sortare} onChange={e => setSortare(e.target.value)} style={selectStyle}>
              <option value="nume_asc">NUME A→Z</option>
              <option value="nume_desc">NUME Z→A</option>
              <option value="departament">DEPARTAMENT</option>
              <option value="pozitie">POZITIE</option>
            </select>
            <button onClick={handleFiltrare} style={btnStyle(cyan)}>FILTREAZA</button>
            <button onClick={handleResetFiltre} style={btnStyle('#808080')}>RESET</button>
          </div>
        )}

        {/* adauga angajat */}
        {poateAdauga && (
          <button onClick={() => navigate('/angajati/nou')} style={btnStyle(roz)}>
            + ADAUGA
          </button>
        )}
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
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${roz}` }}>
                {['NUME', 'EMAIL', 'TELEFON', 'DEPARTAMENT', 'POZITIE', 'SALARIU', 'ACTIUNI'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px',
                    color: cyan, fontWeight: 'normal',
                    letterSpacing: '0.5px', whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {angajati.map((a, idx) => (
                <tr key={a.id_angajat} style={{
                  backgroundColor: a.status === 'inactiv' ? '#2a1a1a' : idx % 2 === 0 ? '#1e1e1e' : '#252526',
                  borderBottom: '1px solid #2d2d2d',
                  opacity: a.status === 'inactiv' ? 0.6 : 1,
                }}>
                  <td style={{ ...tdStyle, color: a.status === 'inactiv' ? '#808080' : '#d4d4d4', fontWeight: 'bold' }}>
                    {a.prenume} {a.nume}
                    {a.status === 'inactiv' && (
                      <span style={{
                        marginLeft: '8px', color: '#e74c3c',
                        border: '1px solid #e74c3c', padding: '1px 6px',
                        fontSize: '9px', letterSpacing: '0.5px',
                      }}>
                        INACTIV
                      </span>
                    )}
                  </td>
                  <td style={tdStyle}>{a.email}</td>
                  <td style={tdStyle}>{a.telefon}</td>
                  <td style={tdStyle}>{a.nume_departament || '—'}</td>
                  <td style={tdStyle}>{a.titlu_pozitie || '—'}</td>
                  <td style={{ ...tdStyle, color: cyan }}>
                    {Number(a.salariu_curent).toLocaleString('ro-RO')} RON
                  </td>
                  <td style={{ ...tdStyle, display: 'flex', gap: '6px' }}>
                    <button onClick={() => navigate(`/angajati/${a.id_angajat}`)} style={btnMicStyle(cyan)}>
                      PROFIL
                    </button>
                    {poateEdita && (
                      <button onClick={() => navigate(`/angajati/${a.id_angajat}/editeaza`)} style={btnMicStyle('#f39c12')}>
                        EDIT
                      </button>
                    )}
                    {poateEdita && (
                      <button onClick={() => handleDeactiveaza(a.id_angajat, a.nume, a.prenume)} style={btnMicStyle(roz)}>
                        DEZACT
                      </button>
                    )}
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

const selectStyle = {
  backgroundColor: '#3c3c3c', color: 'white', border: '1px solid #555',
  padding: '7px 12px', fontFamily: 'Consolas, monospace', fontSize: '12px',
  outline: 'none', cursor: 'pointer',
};

const tdStyle = {
  padding: '9px 12px', color: '#9cdcfe',
  verticalAlign: 'middle', whiteSpace: 'nowrap',
};

const btnStyle = (culoare) => ({
  backgroundColor: 'transparent', color: culoare, border: `1px solid ${culoare}`,
  padding: '7px 14px', fontFamily: 'Consolas, monospace', fontSize: '12px',
  cursor: 'pointer', letterSpacing: '0.5px', whiteSpace: 'nowrap',
});

const btnMicStyle = (culoare) => ({
  backgroundColor: 'transparent', color: culoare, border: `1px solid ${culoare}`,
  padding: '3px 8px', fontFamily: 'Consolas, monospace', fontSize: '10px',
  cursor: 'pointer',
});