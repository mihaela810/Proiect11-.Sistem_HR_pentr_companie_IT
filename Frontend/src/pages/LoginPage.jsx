import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';
const dark = '#1e1e1e';

export default function LoginPage() {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [mesaj, setMesaj]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMesaj('');

    try {
      const response = await api.post(API.LOGIN, { username, password });
      if (response.data.token) {
        login(response.data.token);
        navigate('/dashboard');
      } else {
        setMesaj(`ERROR: ${response.data.msg}`);
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

        {/* logo + titlu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <img
            src="/logo_empty.png"
            alt="logo_empty"
            style={{ height: '64px', objectFit: 'contain', flexShrink: 0 }}
          />
          <div>
            <h1 style={{ color: roz, margin: 0, fontSize: '26px' }}>
              <span style={{ color: cyan }}>M&M  </span>Bloom
            </h1>
            <p style={{ color: '#6a9955', fontSize: '12px', margin: '4px 0 0' }}>
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
          {/* username */}
          <div>
            <label style={{ color: cyan, display: 'block', marginBottom: '6px', fontSize: '12px' }}>
              USERNAME:
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {/* parola */}
          <div>
            <label style={{ color: cyan, display: 'block', marginBottom: '6px', fontSize: '12px' }}>
              PASSWORD:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: '60px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: cyan, cursor: 'pointer',
                  fontFamily: 'Consolas, monospace', fontSize: '11px',
                  padding: 0,
                }}
              >
                {showPass ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          {/* submit */}
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

          {/* mesaj eroare */}
          {mesaj && (
            <p style={{
              margin: 0, fontSize: '12px',
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

const inputStyle = {
  backgroundColor: '#3c3c3c',
  color: 'white',
  border: `1px solid #4ec9b0`,
  padding: '8px 12px',
  width: '100%',
  fontFamily: 'Consolas, monospace',
  fontSize: '14px',
  boxSizing: 'border-box',
  outline: 'none',
};