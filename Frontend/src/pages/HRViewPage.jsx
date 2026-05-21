import { useState, useEffect } from 'react';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function HRViewPage() {
  const [angajati, setAngajati] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [eroare, setEroare]     = useState(null);

  useEffect(() => {
    api.get(API.VIEW_HR)
      .then(res => setAngajati(res.data.angajati || res.data || []))
      .catch(() => setEroare('Nu s-au putut incarca datele HR.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={stil.loading}>Se incarca...</p>;
  if (eroare)  return <p style={stil.eroare}>ERROR: {eroare}</p>;

  return (
    <div style={{ fontFamily: 'Consolas, monospace' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> VIEW HR SPECIALIST
        </h2>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          {angajati.length} angajati — fara date salariale si CNP
        </p>
      </div>

      {angajati.length === 0 ? (
        <p style={{ color: '#808080' }}>Nu exista date disponibile.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${roz}` }}>
                {Object.keys(angajati[0]).map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px',
                    color: cyan, fontWeight: 'normal',
                    whiteSpace: 'nowrap', letterSpacing: '0.5px',
                  }}>
                    {h.toUpperCase().replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {angajati.map((row, idx) => (
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
      )}
    </div>
  );
}

const stil = {
  loading: { color: '#808080', fontFamily: 'Consolas, monospace' },
  eroare:  { color: '#ff22a1', fontFamily: 'Consolas, monospace' },
};