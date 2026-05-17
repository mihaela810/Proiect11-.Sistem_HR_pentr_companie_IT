import React, { useState } from 'react';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mesaj, setMesaj] = useState('');

  const rozNeon = "#ff22a1"; 
  const albastruCyan = "#4ec9b0";
  const fundalVSCode = "#1e1e1e";

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://127.0.0.1:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token); // Salvezi token-ul securizat
        setMesaj("LOGIN_SUCCESSFUL: Token generat cu succes!");
        // Aici poți redirecționa utilizatorul către Dashboard-ul de HR
      } else {
        setMesaj(`ERROR: ${data.msg}`);
      }
    } catch (err) {
      setMesaj("ERROR: Nu am putut contacta serverul Flask.");
    }
  };

  return (
    <div style={{ backgroundColor: fundalVSCode, minHeight: '100vh', color: '#d4d4d4', fontFamily: 'Consolas, monospace', padding: '40px' }}>
      <h1 style={{ color: rozNeon, borderBottom: `1px solid ${albastruCyan}`, paddingBottom: '10px' }}>
        <span style={{ color: albastruCyan }}>EXECUTE_</span>AUTH_SYSTEM
      </h1>
      
      <form onSubmit={handleLogin} style={{ marginTop: '30px', maxWidth: '400px', backgroundColor: '#252526', padding: '30px', borderRadius: '4px', border: '1px solid #333' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: albastruCyan, display: 'block', marginBottom: '5px' }}>USERNAME:</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ backgroundColor: '#3c3c3c', color: 'white', border: `1px solid ${albastruCyan}`, padding: '8px', width: '100%' }} required />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: albastruCyan, display: 'block', marginBottom: '5px' }}>PASSWORD:</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ backgroundColor: '#3c3c3c', color: 'white', border: `1px solid ${albastruCyan}`, padding: '8px', width: '100%' }} required />
        </div>

        <button type="submit" style={{ backgroundColor: 'transparent', color: rozNeon, border: `2px solid ${rozNeon}`, padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
          RUN_LOGIN()
        </button>
      </form>

      {mesaj && <p style={{ marginTop: '20px', color: mesaj.includes('SUCCESS') ? '#6a9955' : rozNeon }}>{mesaj}</p>}
    </div>
  );
}

export default App;