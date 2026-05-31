import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

function TabelGeneric({ date, titlu }) {
  if (!date || date.length === 0 || !date[0]) {
    return <p style={{ color: '#808080', fontSize: '12px' }}>Nu exista date.</p>;
  }
  return (
    <>
      {titlu && (
        <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 12px' }}>{titlu}</h3>
      )}
      <div style={{ overflowX: 'auto', marginBottom: '28px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${roz}` }}>
              {Object.keys(date[0]).map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '8px 12px',
                  color: cyan, fontWeight: 'normal', whiteSpace: 'nowrap',
                }}>
                  {h.toUpperCase().replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {date.map((row, idx) => (
              <tr key={idx} style={{
                backgroundColor: idx % 2 === 0 ? '#1e1e1e' : '#252526',
                borderBottom: '1px solid #2d2d2d',
              }}>
                {Object.values(row).map((val, i) => (
                  <td key={i} style={{
                    padding: '9px 12px', color: '#9cdcfe',
                    verticalAlign: 'middle', whiteSpace: 'nowrap',
                  }}>
                    {val ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function EchipaPage() {
  const { user }        = useAuth();
  const rol             = user?.rol || '';

  const [echipa, setEchipa]           = useState([]);
  const [subordonati, setSubordonati] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [eroare, setEroare]           = useState(null);

  useEffect(() => {
    const cereri = [];

    // Ambele roluri trebuie să poată vizualiza membrii asociați structurii lor
    if (['team_leader', 'project_manager'].includes(rol)) {
      cereri.push(
        api.get(API.VIEW_TEAM_LEADER)
          .then(res => setEchipa(res.data.date_echipa || res.data || []))
          .catch(() => {})
      );
    }

    if (['hr_manager', 'director', 'ceo'].includes(rol)) {
    cereri.push(
      api.get('/echipa')
        .then(res => setSubordonati(Array.isArray(res.data) ? res.data : res.data.subordonati || []))
        .catch(() => {})
    );
  }

    Promise.all(cereri)
      .catch(() => setEroare('Nu s-au putut incarca datele echipei.'))
      .finally(() => setLoading(false));
  }, [rol]);

  if (loading) return <p style={{ color: '#808080', fontFamily: 'Consolas, monospace' }}>Se incarca...</p>;
  if (eroare)  return <p style={{ color: roz, fontFamily: 'Consolas, monospace' }}>ERROR: {eroare}</p>;

  return (
    <div style={{ fontFamily: 'Consolas, monospace' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> ECHIPA MEA
        </h2>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          structura echipei si subordonatii directi
        </p>
      </div>

      {['team_leader', 'project_manager'].includes(rol) && (
        <TabelGeneric
          date={echipa}
          titlu={`MEMBRII ECHIPEI (${echipa.length})`}
        />
      )}

      {['hr_manager', 'director', 'ceo'].includes(rol) && (
        <TabelGeneric
          date={subordonati}
          titlu={`SUBORDONATI DIRECTI (${subordonati.length})`}
        />
      )}

      {echipa.length === 0 && subordonati.length === 0 && (
        <p style={{ color: '#808080' }}>Nu exista date disponibile pentru rolul tau.</p>
      )}
    </div>
  );
}