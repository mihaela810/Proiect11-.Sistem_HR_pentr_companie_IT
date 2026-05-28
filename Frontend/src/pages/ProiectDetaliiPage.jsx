import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

const statusCuloare = {
  'in desfasurare': '#6a9955',
  'finalizat':      '#4ec9b0',
  'anulat':         '#ff22a1',
  'planificat':     '#f39c12',
};

export default function ProiectDetaliiPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [proiect, setProiect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare]   = useState(null);

  useEffect(() => {
    api.get(API.PROIECT_DETALII(id))
      .then(res => setProiect(res.data))
      .catch(() => setEroare('Nu s-au putut incarca datele proiectului.'))
      .finally(() => setLoading(false));
  }, [id]);

  const formatRON  = (v) => v ? `${Number(v).toLocaleString('ro-RO')} RON` : '—';
  const formatData = (d) => d ? new Date(d).toLocaleDateString('ro-RO') : '—';

  if (loading) return <p style={{ color: '#808080', fontFamily: 'Consolas, monospace' }}>Se incarca...</p>;
  if (eroare)  return <p style={{ color: roz, fontFamily: 'Consolas, monospace' }}>ERROR: {eroare}</p>;
  if (!proiect) return null;

  return (
    <div style={{ fontFamily: 'Consolas, monospace', maxWidth: '900px' }}>

      {/* header */}
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => navigate('/proiecte')}
          style={{ color: '#808080', background: 'none', border: 'none',
            fontFamily: 'Consolas, monospace', fontSize: '12px',
            cursor: 'pointer', marginBottom: '12px', padding: 0 }}>
          ← INAPOI
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
            <span style={{ color: cyan }}>{'>'}</span> {proiect.nume}
          </h2>
          <span style={{
            color: statusCuloare[proiect.status] || '#555',
            border: `1px solid ${statusCuloare[proiect.status] || '#555'}`,
            padding: '2px 8px', fontSize: '10px',
          }}>
            {proiect.status?.toUpperCase()}
          </span>
        </div>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          {proiect.total_angajati} angajati alocati
        </p>
      </div>

      {/* info proiect */}
      <div style={{
        backgroundColor: '#252526', border: '1px solid #333',
        borderLeft: `3px solid ${statusCuloare[proiect.status] || cyan}`,
        padding: '20px 24px', marginBottom: '28px', borderRadius: '2px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <InfoRow label="DATA START"   value={formatData(proiect.data_start)} />
          <InfoRow label="DATA SFARSIT" value={formatData(proiect.data_sfarsit)} />
          <InfoRow label="BUGET"        value={formatRON(proiect.buget)} />
          <InfoRow label="ID PROIECT"   value={proiect.id_proiect} />
        </div>
        {proiect.descriere && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ color: '#808080', fontSize: '10px', marginBottom: '6px', letterSpacing: '1px' }}>
              DESCRIERE
            </div>
            <p style={{ color: '#9cdcfe', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
              {proiect.descriere}
            </p>
          </div>
        )}
      </div>

      {/* tabel angajati alocati */}
      <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 12px' }}>

    ANGAJATI ALOCATI ({proiect.total_angajati})
      </h3>

      {proiect.angajati.length === 0 ? (
        <p style={{ color: '#808080', fontSize: '12px' }}>Nu exista angajati alocati pe acest proiect.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${roz}` }}>
                {['NUME', 'PRENUME', 'POZITIE', 'ROL PROIECT', 'ORE ALOCATE'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px',
                    color: cyan, fontWeight: 'normal', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proiect.angajati.map((a, idx) => (
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
                  <td style={tdStyle}>{a.nume}</td>
                  <td style={tdStyle}>{a.prenume}</td>
                  <td style={tdStyle}>{a.pozitie}</td>
                  <td style={tdStyle}>{a.rol_proiect || '—'}</td>
                  <td style={tdStyle}>{a.ore_alocate ?? '—'}</td>
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