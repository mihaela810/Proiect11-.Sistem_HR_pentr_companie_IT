import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function DepartamentDetaliiPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [dept, setDept]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare]   = useState(null);

  useEffect(() => {
    api.get(API.DEPARTAMENT_DETALII(id))
      .then(res => setDept(res.data))
      .catch(() => setEroare('Nu s-au putut incarca datele departamentului.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ color: '#808080', fontFamily: 'Consolas, monospace' }}>Se incarca...</p>;
  if (eroare)  return <p style={{ color: roz, fontFamily: 'Consolas, monospace' }}>ERROR: {eroare}</p>;
  if (!dept)   return null;

  return (
    <div style={{ fontFamily: 'Consolas, monospace', maxWidth: '900px' }}>

      {/* header */}
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => navigate('/departamente')}
          style={{ color: '#808080', background: 'none', border: 'none',
            fontFamily: 'Consolas, monospace', fontSize: '12px',
            cursor: 'pointer', marginBottom: '12px', padding: 0 }}>
          ← INAPOI
        </button>
        <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> {dept.nume}
        </h2>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          {dept.total_angajati} angajati · {dept.locatie || 'locatie necunoscuta'}
        </p>
      </div>

      {/* info departament */}
      <div style={{
        backgroundColor: '#252526', border: '1px solid #333',
        borderLeft: `3px solid ${cyan}`, padding: '20px 24px',
        marginBottom: '28px', borderRadius: '2px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <InfoRow label="LOCATIE"  value={dept.locatie} />
          <InfoRow label="MANAGER"  value={dept.nume_manager ? `${dept.prenume_manager} ${dept.nume_manager}` : '—'} />
          {dept.descriere && <InfoRow label="DESCRIERE" value={dept.descriere} />}
        </div>
      </div>

      {/* tabel angajati */}
      <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 12px' }}>
        ANGAJATI ({dept.total_angajati})
      </h3>

      {dept.angajati.length === 0 ? (
        <p style={{ color: '#808080', fontSize: '12px' }}>Nu exista angajati in acest departament.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${roz}` }}>
                {['ID', 'NUME', 'PRENUME', 'EMAIL', 'POZITIE', 'STATUS'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px',
                    color: cyan, fontWeight: 'normal', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dept.angajati.map((a, idx) => (
                <tr key={a.id_angajat}
                  onClick={() => navigate(`/angajati/${a.id_angajat}`)}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#1e1e1e' : '#252526',
                    borderBottom: '1px solid #2d2d2d',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2d2d2d'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#1e1e1e' : '#252526'}
                >
                  <td style={tdStyle}>{a.id_angajat}</td>
                  <td style={tdStyle}>{a.nume}</td>
                  <td style={tdStyle}>{a.prenume}</td>
                  <td style={tdStyle}>{a.email}</td>
                  <td style={tdStyle}>{a.pozitie}</td>
                  <td style={{ ...tdStyle, color: a.status === 'activ' ? '#6a9955' : roz }}>
                    {a.status?.toUpperCase()}
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

function InfoRow({ label, value }) {
  return (
    <div>
      <div style={{ color: '#808080', fontSize: '10px', marginBottom: '4px', letterSpacing: '1px' }}>
        {label}
      </div>
      <div style={{ color: '#9cdcfe', fontSize: '13px' }}>{value || '—'}</div>
    </div>
  );
}

const tdStyle = {
  padding: '9px 12px',
  color: '#9cdcfe',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};