import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: '48px',
      backgroundColor: '#252526',
      borderBottom: '1px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      fontFamily: 'Consolas, monospace',
      flexShrink: 0,
    }}>

      {/* user info — fara comentariu, doar numele */}
      <div style={{ fontSize: '12px', color: '#9cdcfe' }}>
        <span style={{ color: cyan }}>
          {user?.username || 'unknown'}
        </span>
        {user?.rol && (
          <span style={{ color: '#808080', marginLeft: '12px' }}>
            [{user.rol}]
          </span>
        )}
      </div>

      {/* logout fara paranteze */}
      <button
        onClick={handleLogout}
        style={{
          backgroundColor: 'transparent',
          color: roz,
          border: `1px solid ${roz}`,
          padding: '4px 14px',
          fontFamily: 'Consolas, monospace',
          fontSize: '11px',
          cursor: 'pointer',
          letterSpacing: '0.5px',
        }}
      >
        LOGOUT
      </button>
    </header>
  );
}