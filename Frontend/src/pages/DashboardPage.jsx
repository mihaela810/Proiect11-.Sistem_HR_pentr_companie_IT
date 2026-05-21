import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { poateFace, getRolPermisiuni } from '../utils/roluri';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

function StatCard({ label, value, sub, culoare }) {
  return (
    <div style={{
      backgroundColor: '#252526',
      border: '1px solid #333',
      borderLeft: `3px solid ${culoare || roz}`,
      padding: '20px 24px',
      borderRadius: '4px',
      flex: 1,
      minWidth: '160px',
    }}>
      <div style={{ color: '#808080', fontSize: '11px', marginBottom: '8px', letterSpacing: '1px' }}>
        {label}
      </div>
      <div style={{ color: culoare || cyan, fontSize: '26px', fontWeight: 'bold' }}>
        {value ?? '—'}
      </div>
      {sub && (
        <div style={{ color: '#6a9955', fontSize: '11px', marginTop: '6px' }}>{sub}</div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const rol           = user?.rol || '';
  const permisiuni    = getRolPermisiuni(rol);

  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare]   = useState(null);

  useEffect(() => {
    api.get(API.STATISTICI)
      .then(res => setStats(res.data.date_statistice))
      .catch(() => setEroare('Nu s-au putut incarca statisticile.'))
      .finally(() => setLoading(false));
  }, []);

  const formatRON = (val) =>
    val ? `${Number(val).toLocaleString('ro-RO')} RON` : '—';

  // linkuri de acces rapid filtrate dupa rol
  const accesRapid = [
    { label: 'ANGAJATI',      path: '/angajati',     vizibil: poateFace(rol, 'angajati')     },
    { label: 'CONCEDII',      path: '/concedii',     vizibil: poateFace(rol, 'concedii')     },
    { label: 'EVALUARI',      path: '/evaluari',     vizibil: poateFace(rol, 'evaluari')     },
    { label: 'PROIECTE',      path: '/proiecte',     vizibil: poateFace(rol, 'proiecte')     },
    { label: 'ECHIPA MEA',    path: '/echipa',       vizibil: poateFace(rol, 'view_echipa')  },
    { label: 'RAPOARTE',      path: '/rapoarte',     vizibil: poateFace(rol, 'rapoarte')     },
    { label: 'ML COMPARATIE', path: '/ml',           vizibil: poateFace(rol, 'ml')           },
  ].filter(l => l.vizibil);

  return (
    <div style={{ fontFamily: 'Consolas, monospace' }}>

      {/* salut */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ color: roz, margin: 0, fontSize: '20px' }}>
          <span style={{ color: cyan }}>{'>'}</span> DASHBOARD
        </h2>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          Bine ai venit, <span style={{ color: cyan }}>{user?.username}</span>
          {' — '}
          <span style={{ color: permisiuni.culoare }}>
            {permisiuni.label}
          </span>
        </p>
      </div>

      {/* KPI-uri */}
      {loading && (
        <p style={{ color: '#808080', fontSize: '12px' }}>Se incarca...</p>
      )}
      {eroare && (
        <p style={{ color: roz, fontSize: '12px' }}>ERROR: {eroare}</p>
      )}

      {!loading && !eroare && stats && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <StatCard
            label="TOTAL ANGAJATI ACTIVI"
            value={stats.total_angajati}
            sub="cu status activ"
          />
          <StatCard
            label="SALARIU MEDIU"
            value={poateFace(rol, 'salarii') ? formatRON(stats.salariu_mediu) : '***'}
            sub="media pe angajati activi"
            culoare={poateFace(rol, 'salarii') ? cyan : '#555'}
          />
          <StatCard
            label="BUGET TOTAL SALARII"
            value={poateFace(rol, 'salarii') ? formatRON(stats.buget_total_salarii) : '***'}
            sub="suma lunara bruta"
            culoare={poateFace(rol, 'salarii') ? '#f39c12' : '#555'}
          />
          <StatCard
            label="SALARIU MAXIM"
            value={poateFace(rol, 'salarii') ? formatRON(stats.salariu_maxim) : '***'}
            sub="cel mai mare salariu"
            culoare={poateFace(rol, 'salarii') ? '#6a9955' : '#555'}
          />
          <StatCard
            label="SALARIU MINIM"
            value={poateFace(rol, 'salarii') ? formatRON(stats.salariu_minim) : '***'}
            sub="cel mai mic salariu"
            culoare={poateFace(rol, 'salarii') ? '#6a9955' : '#555'}
          />
        </div>
      )}

      {/* acces rapid */}
      {accesRapid.length > 0 && (
        <div>
          <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 16px' }}>
            Acces rapid
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {accesRapid.map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  color: roz,
                  border: `1px solid ${roz}`,
                  backgroundColor: 'transparent',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontFamily: 'Consolas, monospace',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = roz;
                  e.target.style.color = '#1e1e1e';
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = roz;
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}