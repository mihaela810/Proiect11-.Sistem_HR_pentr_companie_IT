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

      {/* user info */}
      <div style={{ fontSize: '12px', color: '#9cdcfe' }}>
        <span style={{ color: cyan }}>{user?.username || 'unknown'}</span>
        {user?.rol && (
          <span style={{ color: '#808080', marginLeft: '12px' }}>
            [{user.rol}]
          </span>
        )}
      </div>

      {/* butoane dreapta */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => navigate('/profil-meu')}
          style={btnStyle(cyan)}
        >
          PROFILUL MEU
        </button>
        <button onClick={handleLogout} style={btnStyle(roz)}>
          LOGOUT
        </button>
      </div>
    </header>
  );
}

const btnStyle = (culoare) => ({
  backgroundColor: 'transparent',
  color: culoare,
  border: `1px solid ${culoare}`,
  padding: '4px 14px',
  fontFamily: 'Consolas, monospace',
  fontSize: '11px',
  cursor: 'pointer',
  letterSpacing: '0.5px',
});
