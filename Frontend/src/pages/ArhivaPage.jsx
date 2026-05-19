import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function ArhivaPage() {
  const [arhiva, setArhiva]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare]   = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(API.ANGAJATI_ARHIVA)
      .then(res => setArhiva(res.data.date || []))
      .catch(() => setEroare('Nu s-a putut incarca arhiva.'))
      .finally(() => setLoading(false));
  }, []);

  const formatData = (d) => d ? new Date(d).toLocaleDateString('ro-RO') : '—';
  const formatRON  = (v) => v ? `${Number(v).toLocaleString('ro-RO')} RON` : '—';

  return (
    <div style={{ fontFamily: 'Consolas, monospace' }}>

      {/* header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> ARHIVA
        </h2>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          {arhiva.length} fosti angajati cu status inactiv
        </p>
      </div>

      {/* stari */}
      {loading && <p style={{ color: '#808080' }}>Se incarca...</p>}
      {eroare  && <p style={{ color: roz }}>ERROR: {eroare}</p>}
      {!loading && !eroare && arhiva.length === 0 && (
        <p style={{ color: '#808080' }}>Nu exista angajati in arhiva.</p>
      )}

      {/* tabel */}
      {!loading && arhiva.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${roz}` }}>
                {['ID', 'NUME', 'EMAIL', 'DEPARTAMENT', 'POZITIE', 'DATA ANGAJARE', 'SALARIU', 'ACTIUNI'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px',
                    color: cyan, fontWeight: 'normal', whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {arhiva.map((a, idx) => (
                <tr key={a.id_angajat} style={{
                  backgroundColor: idx % 2 === 0 ? '#1e1e1e' : '#252526',
                  borderBottom: '1px solid #2d2d2d',
                  opacity: 0.75,
                }}>
                  <td style={tdStyle}>{a.id_angajat}</td>
                  <td style={{ ...tdStyle, color: '#808080', fontWeight: 'bold' }}>
                    {a.prenume} {a.nume}
                  </td>
                  <td style={tdStyle}>{a.email}</td>
                  <td style={tdStyle}>{a.nume_departament || '—'}</td>
                  <td style={tdStyle}>{a.titlu_pozitie || '—'}</td>
                  <td style={tdStyle}>{formatData(a.data_angajare)}</td>
                  <td style={{ ...tdStyle, color: '#555' }}>
                    {formatRON(a.salariu_curent)}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => navigate(`/angajati/${a.id_angajat}`)}
                      style={btnMicStyle(cyan)}
                    >
                      PROFIL
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

const tdStyle = {
  padding: '9px 12px', color: '#9cdcfe',
  verticalAlign: 'middle', whiteSpace: 'nowrap',
};

const btnMicStyle = (culoare) => ({
  backgroundColor: 'transparent', color: culoare,
  border: `1px solid ${culoare}`, padding: '3px 8px',
  fontFamily: 'Consolas, monospace', fontSize: '10px',
  cursor: 'pointer',
});