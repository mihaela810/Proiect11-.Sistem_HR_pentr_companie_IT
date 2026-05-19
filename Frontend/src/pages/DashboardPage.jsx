import { useState, useEffect } from 'react';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      backgroundColor: '#252526',
      border: '1px solid #333',
      borderLeft: `3px solid ${roz}`,
      padding: '20px 24px',
      borderRadius: '4px',
      minWidth: '180px',
      flex: 1,
    }}>
      <div style={{ color: '#808080', fontSize: '11px', marginBottom: '8px', letterSpacing: '1px' }}>
        {label}
      </div>
      <div style={{ color: cyan, fontSize: '26px', fontWeight: 'bold' }}>
        {value ?? '—'}
      </div>
      {sub && (
        <div style={{ color: '#6a9955', fontSize: '11px', marginTop: '6px' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare]   = useState(null);

  useEffect(() => {
    api.get(API.STATISTICI)
      .then(res => setStats(res.data.date_statistice))
      .catch(() => setEroare('Nu s-au putut incarca statisticile.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <p style={{ color: '#808080', fontFamily: 'Consolas, monospace' }}>
      SE_INCARCA...
    </p>
  );

  if (eroare) return (
    <p style={{ color: roz, fontFamily: 'Consolas, monospace' }}>
      ERROR: {eroare}
    </p>
  );

  const formatRON = (val) =>
    val ? `${Number(val).toLocaleString('ro-RO')} RON` : '—';

  return (
    <div style={{ fontFamily: 'Consolas, monospace' }}>

      {/* titlu */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> DASHBOARD
        </h2>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          Statistici generale — Angajati activi
        </p>
      </div>

      {/* carduri KPI */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <StatCard
          label="TOTAL ANGAJATI ACTIVI"
          value={stats?.total_angajati}
          sub="angajati cu status activ"
        />
        <StatCard
          label="SALARIU MEDIU"
          value={formatRON(stats?.salariu_mediu)}
          sub="media pe toti angajatii activi"
        />
        <StatCard
          label="BUGET TOTAL SALARII"
          value={formatRON(stats?.buget_total_salarii)}
          sub="suma lunara bruta"
        />
        <StatCard
          label="SALARIU MAXIM"
          value={formatRON(stats?.salariu_maxim)}
          sub="cel mai mare salariu activ"
        />
        <StatCard
          label="SALARIU MINIM"
          value={formatRON(stats?.salariu_minim)}
          sub="cel mai mic salariu activ"
        />
      </div>

      {/* sectiune navigare rapida */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 16px' }}>
          Acces rapid
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'ANGAJATI',     path: '/angajati'     },
            { label: 'CONCEDII',     path: '/concedii'     },
            { label: 'EVALUARI',     path: '/evaluari'     },
            { label: 'PROIECTE',     path: '/proiecte'     },
            { label: 'ML_COMPARATIE', path: '/ml'          },
          ].map(({ label, path }) => (
            <a
              key={path}
              href={path}
              style={{
                color: roz,
                border: `1px solid ${roz}`,
                padding: '8px 16px',
                fontSize: '12px',
                textDecoration: 'none',
                letterSpacing: '0.5px',
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
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}