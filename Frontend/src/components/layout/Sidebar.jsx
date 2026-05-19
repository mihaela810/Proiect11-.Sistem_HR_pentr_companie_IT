import { NavLink } from 'react-router-dom';

const roz   = '#ff22a1';
const cyan  = '#4ec9b0';
const dark  = '#1e1e1e';
const dark2 = '#252526';

const linkuri = [
  { to: '/dashboard',    label: 'DASHBOARD'     },
  { to: '/angajati',     label: 'ANGAJATI'      },
  { to: '/angajati/arhiva', label: 'ARHIVA'     },
  { to: '/concedii',     label: 'CONCEDII'      },
  { to: '/evaluari',     label: 'EVALUARI'      },
  { to: '/proiecte',     label: 'PROIECTE'      },
  { to: '/departamente', label: 'DEPARTAMENTE'  },
  { to: '/pozitii',      label: 'POZITII'       },
  { to: '/beneficii',    label: 'BENEFICII'     },
  { to: '/ml',           label: 'ML COMPARATIE' },
];

export default function Sidebar() {
  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      backgroundColor: dark2,
      borderRight: `1px solid #333`,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      fontFamily: 'Consolas, monospace',
      flexShrink: 0,
    }}>

      {/* logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #333' }}>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <img
            src="/logo_B.png"
            alt="logo_B"
            style={{ height: '48px', objectFit: 'contain' }}
          />
        </div>
        <div style={{ color: roz, fontWeight: 'bold', fontSize: '16px' }}>
          M&M
        </div>
        <div style={{ color: cyan, fontWeight: 'bold', fontSize: '22px' }}>
          Bloom
        </div>
      </div>

      {/* navigare */}
      <nav style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {linkuri.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              padding: '9px 20px',
              color: isActive ? roz : '#9cdcfe',
              backgroundColor: isActive ? '#2a2d2e' : 'transparent',
              borderLeft: isActive ? `3px solid ${roz}` : '3px solid transparent',
              textDecoration: 'none',
              fontSize: '12px',
              fontFamily: 'Consolas, monospace',
              letterSpacing: '0.5px',
              transition: 'all 0.15s',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}