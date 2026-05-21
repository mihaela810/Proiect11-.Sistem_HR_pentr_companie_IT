import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { poateFace } from '../../utils/roluri';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function Sidebar() {
  const { user } = useAuth();
  const rol = user?.rol || '';

  const linkuri = [
    { to: '/dashboard',    label: 'DASHBOARD',    vizibil: true },
    { to: '/angajati',     label: 'ANGAJATI',     vizibil: poateFace(rol, 'angajati') },
    { to: '/angajati/arhiva', label: 'ARHIVA',    vizibil: poateFace(rol, 'angajati') },
    { to: '/concedii',     label: 'CONCEDII',     vizibil: poateFace(rol, 'concedii') },
    { to: '/evaluari',     label: 'EVALUARI',     vizibil: poateFace(rol, 'evaluari') },
    { to: '/proiecte',     label: 'PROIECTE',     vizibil: poateFace(rol, 'proiecte') },
    { to: '/departamente', label: 'DEPARTAMENTE', vizibil: poateFace(rol, 'departamente') },
    { to: '/pozitii',      label: 'POZITII',      vizibil: poateFace(rol, 'pozitii') },
    { to: '/beneficii',    label: 'BENEFICII',    vizibil: poateFace(rol, 'beneficii') },
    { to: '/echipa',       label: 'ECHIPA MEA',   vizibil: poateFace(rol, 'view_echipa') },
    { to: '/rapoarte',     label: 'RAPOARTE',     vizibil: poateFace(rol, 'rapoarte') },
    { to: '/ml',           label: 'ML COMPARATIE', vizibil: poateFace(rol, 'ml') },
    { to: '/audit', label: 'AUDIT LOG', vizibil: poateFace(rol, 'audit') },
    { to: '/hr-view', label: 'VIEW HR', vizibil: poateFace(rol, 'view_hr') },
  ].filter(l => l.vizibil);

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      backgroundColor: '#252526',
      borderRight: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      fontFamily: 'Consolas, monospace',
      flexShrink: 0,
    }}>

      {/* logo + titlu */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #333' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo_empty.png" alt="logo_empty"
            style={{ height: '48px', objectFit: 'contain', flexShrink: 0 }} />
          <div>
            <div style={{ color: roz, fontWeight: 'bold', fontSize: '16px' }}>M&M</div>
            <div style={{ color: cyan, fontWeight: 'bold', fontSize: '22px' }}>Bloom</div>
          </div>
        </div>
      </div>

      {/* navigare */}
      <nav style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
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

      {/* rol afisat jos */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #333',
        fontSize: '10px',
        color: '#555',
        letterSpacing: '0.5px',
      }}>
        ROL: <span style={{ color: cyan }}>{rol?.toUpperCase() || 'NECUNOSCUT'}</span>
      </div>
    </aside>
  );
}
