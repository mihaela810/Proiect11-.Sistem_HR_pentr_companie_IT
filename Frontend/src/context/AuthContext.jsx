import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(localStorage.getItem('token') || null);
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // la prima incarcare, daca exista token in localStorage, decodifica-l
  // si populeaza user-ul fara sa ceri login din nou
  useEffect(() => {
    if (token) {
      try {
        // JWT are 3 parti separate prin punct — payload-ul e partea din mijloc, encodat in base64
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id:       payload.id_angajat,
          // flask-jwt-extended pune identity in 'sub'
          username: typeof payload.sub === 'string' ? payload.sub : payload.sub?.username,
          rol:      payload.sub?.rol || null,
        });
      } catch {
        // token corupt sau invalid — curata totul
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}