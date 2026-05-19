import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';
const dark = '#1e1e1e';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mesaj, setMesaj]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMesaj('');

  try {
    const response = await api.post(API.LOGIN, { username, password });

    // CORECTIE: app.py returnează "access_token", nu "token"
    if (response.data.access_token) {
      login(response.data.access_token);
      localStorage.setItem('token', response.data.access_token); // Asigură-te că se salvează pentru axios.js
      navigate('/dashboard');
    } else {
      setMesaj(`ERROR: ${response.data.msg || 'Token lipsa'}`);
    }
  } catch (err) {
    const msg = err.response?.data?.msg || 'Nu am putut contacta serverul Flask.';
    setMesaj(`ERROR: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: dark,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Consolas, monospace',
      color: '#d4d4d4',
    }}>

      <div style={{ width: '100%', maxWidth: '420px' }}>

      {/* logo */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
      <img
        src="/logo_B.png"
        alt="logo_B"
        style={{ height: '64px', objectFit: 'contain', flexShrink: 0 }}
      />
    <div>
      <h1 style={{ color: roz, margin: 0, fontSize: '26px', fontFamily: 'Consolas, monospace' }}>
        <span style={{ color: cyan }}>M&M</span> Bloom
        </h1>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '4px 0 0', fontFamily: 'Consolas, monospace' }}>
        Bloom — autentificare necesara
        </p>
      </div>
    </div>

        {/* form */}
        <form
          onSubmit={handleLogin}
          style={{
            backgroundColor: '#252526',
            padding: '32px',
            borderRadius: '4px',
            border: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div>
            <label style={{ color: cyan, display: 'block', marginBottom: '6px', fontSize: '12px' }}>
              USERNAME:
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{
                backgroundColor: '#3c3c3c',
                color: 'white',
                border: `1px solid ${cyan}`,
                padding: '8px 12px',
                width: '100%',
                fontFamily: 'Consolas, monospace',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ color: cyan, display: 'block', marginBottom: '6px', fontSize: '12px' }}>
              PASSWORD:
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                backgroundColor: '#3c3c3c',
                color: 'white',
                border: `1px solid ${cyan}`,
                padding: '8px 12px',
                width: '100%',
                fontFamily: 'Consolas, monospace',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: 'transparent',
              color: loading ? '#555' : roz,
              border: `2px solid ${loading ? '#555' : roz}`,
              padding: '10px 20px',
              fontFamily: 'Consolas, monospace',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '1px',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Se executa...' : 'LOGIN'}
          </button>

          {/* mesaj eroare / succes */}
          {mesaj && (
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: mesaj.includes('ERROR') ? roz : '#6a9955',
            }}>
              {mesaj}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}