import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { poateFace } from '../../utils/roluri';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function Sidebar() {
  const { user } = useAuth();
  const rol = user?.rol || '';

  // Definim lista de linkuri direct cu verificări clare pentru PM
  const linkuri = [
    { 
      to: '/dashboard',    
      label: 'DASHBOARD',    
      vizibil: true 
    },
    { 
      to: '/angajati',     
      label: 'ANGAJATI',     
      vizibil: rol === 'project_manager' ? true : (typeof poateFace === 'function' ? poateFace(rol, 'angajati') : false)
    },
    { 
      to: '/angajati/arhiva', 
      label: 'ARHIVA',    
      vizibil: rol === 'project_manager' ? true : (typeof poateFace === 'function' ? poateFace(rol, 'angajati') : false)
    },
    { 
      to: '/concedii',     
      label: 'CONCEDII',     
      vizibil: typeof poateFace === 'function' ? poateFace(rol, 'concedii') : false 
    },
    { 
      to: '/evaluari',     
      label: 'EVALUARI',     
      vizibil: typeof poateFace === 'function' ? poateFace(rol, 'evaluari') : false 
    },
    { 
      to: '/proiecte',     
      label: 'PROIECTE',     
      vizibil: rol === 'project_manager' ? true : (typeof poateFace === 'function' ? poateFace(rol, 'proiecte') : false)
    },
    { 
      to: '/departamente', 
      label: 'DEPARTAMENTE', 
      vizibil: rol === 'project_manager' ? true : (typeof poateFace === 'function' ? poateFace(rol, 'departamente') : false)
    },
    { 
      to: '/pozitii',      
      label: 'POZITII',      
      vizibil: rol === 'project_manager' ? true : (typeof poateFace === 'function' ? poateFace(rol, 'pozitii') : false)
    },
    { 
      to: '/beneficii',    
      label: 'BENEFICII',    
      vizibil: typeof poateFace === 'function' ? poateFace(rol, 'beneficii') : false 
    }
  ];

  const linkuriVizibile = Array.isArray(linkuri) ? linkuri.filter(l => l && l.vizibil) : [];

  return (
    <div style={{
      width: '240px',
      backgroundColor: '#1e1e1e',
      borderRight: '1px solid #2d2d2d',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      boxSizing: 'border-box'
    }}>
      {/* logo actualizat cu logo_empty */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #2d2d2d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="/logo_empty.png" 
            alt="logo_empty"
            style={{ height: '48px', objectFit: 'contain', flexShrink: 0 }} 
            onError={(e) => {
              // Fallback în cazul în care extensia din proiect este .svg sau altceva
              if (!e.target.src.endsWith('.svg') && !e.target.src.includes('data:')) {
                e.target.src = '/logo_empty.svg';
              }
            }}
          />
          <div>
            <div style={{ color: roz, fontWeight: 'bold', fontSize: '16px', letterSpacing: '0.5px' }}>M&M</div>
            <div style={{ color: cyan, fontWeight: 'bold', fontSize: '22px', marginTop: '-2px' }}>Bloom</div>
          </div>
        </div>
      </div>

      {/* navigare */}
      <nav style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflowY: 'auto' }}>
        {linkuriVizibile.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              padding: '11px 20px',
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
            <span style={{ color: '#6a9955', marginRight: '6px' }}>{'>'}</span> {label}
          </NavLink>
        ))}
      </nav>

      {/* rol afisat jos */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #2d2d2d',
        backgroundColor: '#1a1a1a',
        fontFamily: 'Consolas, monospace'
      }}>
        <div style={{ color: '#808080', fontSize: '10px' }}>USER_ROLE:</div>
        <div style={{ color: cyan, fontSize: '12px', fontWeight: 'bold', marginTop: '2px' }}>
          {rol.toUpperCase()}
        </div>
      </div>
    </div>
  );
}