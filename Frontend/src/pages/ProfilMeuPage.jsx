import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getRolPermisiuni } from '../utils/roluri';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

function Sectiune({ titlu, children }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 12px', letterSpacing: '1px' }}>
        {titlu}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '16px', padding: '7px 0', borderBottom: '1px solid #2d2d2d' }}>
      <span style={{ color: '#808080', minWidth: '200px', fontSize: '12px' }}>{label}</span>
      <span style={{ color: '#d4d4d4', fontSize: '12px' }}>{value || '—'}</span>
    </div>
  );
}

export default function ProfilMeuPage() {
  const { user } = useAuth();
  const permisiuni = getRolPermisiuni(user?.rol);

  const [evaluari, setEvaluari]           = useState([]);
  const [manager, setManager]             = useState(null);
  const [istoricSalarial, setIstoric]     = useState([]);
  const [notificari, setNotificari]       = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const cereri = [
      api.get(API.MEU_EVALUARI).catch(() => ({ data: [] })),
      api.get(API.MEU_MANAGER).catch(() => ({ data: null })),
      api.get(API.MEU_ISTORIC_SALARIAL).catch(() => ({ data: [] })),
      api.get(API.MEU_NOTIFICARI).catch(() => ({ data: [] })),
    ];

    Promise.all(cereri).then(([resEval, resMgr, resIstoric, resNotif]) => {
      setEvaluari(Array.isArray(resEval.data) ? resEval.data : []);
      setManager(resMgr.data || null);
      setIstoric(Array.isArray(resIstoric.data) ? resIstoric.data : []);
      setNotificari(Array.isArray(resNotif.data) ? resNotif.data : []);
      setLoading(false);
    });
  }, []);

  const formatData = (d) => d ? new Date(d).toLocaleDateString('ro-RO') : '—';
  const formatRON  = (v) => v ? `${Number(v).toLocaleString('ro-RO')} RON` : '—';

  if (loading) return (
    <p style={{ color: '#808080', fontFamily: 'Consolas, monospace' }}>Se incarca...</p>
  );

  const nrNotifNecitite = notificari.filter(n => !n.citita).length;

  return (
    <div style={{ fontFamily: 'Consolas, monospace', maxWidth: '900px' }}>

      {/* header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ color: roz, margin: 0, fontSize: '20px' }}>
          {user?.username}
        </h2>
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px', alignItems: 'center' }}>
          <span style={{
            color: permisiuni.culoare,
            border: `1px solid ${permisiuni.culoare}`,
            padding: '2px 10px',
            fontSize: '11px',
            letterSpacing: '0.5px',
          }}>
            {permisiuni.label?.toUpperCase()}
          </span>
          <span style={{ color: '#6a9955', fontSize: '12px' }}>
            ID utilizator: {user?.id}
          </span>
          {nrNotifNecitite > 0 && (
            <span style={{
              color: '#1e1e1e',
              backgroundColor: roz,
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 'bold',
            }}>
              {nrNotifNecitite} NOTIFICARI NOI
            </span>
          )}
        </div>
      </div>

      {/* manager */}
      <Sectiune titlu="MANAGERUL MEU">
        {manager ? (
          <>
            <InfoRow label="Nume manager"
              value={`${manager.prenume_manager} ${manager.nume_manager}`} />
            <InfoRow label="ID manager" value={manager.id_manager} />
          </>
        ) : (
          <p style={{ color: '#808080', fontSize: '12px' }}>
            Nu este asociat un manager.
          </p>
        )}
      </Sectiune>

      {/* notificari */}
      <Sectiune titlu={`NOTIFICARI (${notificari.length})`}>
        {notificari.length === 0 ? (
          <p style={{ color: '#808080', fontSize: '12px' }}>Nu ai notificari.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notificari.map((n, i) => (
              <div key={i} style={{
                backgroundColor: n.citita ? '#1e1e1e' : '#252526',
                border: `1px solid ${n.citita ? '#2d2d2d' : cyan}`,
                borderLeft: `3px solid ${n.citita ? '#333' : cyan}`,
                padding: '10px 14px',
                borderRadius: '2px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: n.citita ? '#555' : cyan, fontSize: '10px' }}>
                    {n.citita ? 'CITITA' : 'NOUA'}
                  </span>
                  <span style={{ color: '#555', fontSize: '10px' }}>
                    {formatData(n.data_creare)}
                  </span>
                </div>
                <p style={{ color: n.citita ? '#808080' : '#d4d4d4', margin: 0, fontSize: '12px' }}>
                  {n.mesaj}
                </p>
              </div>
            ))}
          </div>
        )}
      </Sectiune>

      {/* evaluarile mele */}
      <Sectiune titlu={`EVALUARILE MELE (${evaluari.length})`}>
        {evaluari.length === 0 ? (
          <p style={{ color: '#808080', fontSize: '12px' }}>Nu ai evaluari inregistrate.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${roz}` }}>
                {['DATA', 'TEHNIC', 'COMUNICARE', 'LEADERSHIP', 'SCOR FINAL', 'FEEDBACK'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '6px 10px',
                    color: cyan, fontWeight: 'normal',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {evaluari.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #2d2d2d' }}>
                  <td style={tdStyle}>{formatData(e.data_evaluare)}</td>
                  <td style={tdStyle}>{e.scor_tehnic}</td>
                  <td style={tdStyle}>{e.scor_comunicare}</td>
                  <td style={tdStyle}>{e.scor_leadership}</td>
                  <td style={{ ...tdStyle, color: cyan, fontWeight: 'bold' }}>
                    {Number(e.scor_final).toFixed(2)}
                  </td>
                  <td style={{ ...tdStyle, color: '#808080' }}>{e.feedback || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Sectiune>

      {/* istoric salarial */}
      <Sectiune titlu={`ISTORIC SALARIAL (${istoricSalarial.length})`}>
        {istoricSalarial.length === 0 ? (
          <p style={{ color: '#808080', fontSize: '12px' }}>
            Nu exista modificari salariale inregistrate.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${roz}` }}>
                {['DATA', 'SALARIU VECHI', 'SALARIU NOU', 'MOTIV'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '6px 10px',
                    color: cyan, fontWeight: 'normal',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {istoricSalarial.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #2d2d2d' }}>
                  <td style={tdStyle}>{formatData(s.data_modificare)}</td>
                  <td style={{ ...tdStyle, color: '#808080' }}>
                    {formatRON(s.salariu_vechi)}
                  </td>
                  <td style={{ ...tdStyle, color: cyan }}>
                    {formatRON(s.salariu_nou)}
                  </td>
                  <td style={{ ...tdStyle, color: '#808080' }}>{s.motiv || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Sectiune>

      {/* schimbare parola */}
      <Sectiune titlu="SCHIMBARE PAROLA">
        <SchimbareParola idAngajat={user?.id} />
      </Sectiune>

    </div>
  );
}

function SchimbareParola({ idAngajat }) {
  const cyan = '#4ec9b0';
  const roz  = '#ff22a1';
  const [form, setForm]     = useState({ parola_veche: '', parola_noua: '', confirmare: '' });
  const [mesaj, setMesaj]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMesaj('');

    if (form.parola_noua !== form.confirmare) {
      setMesaj('ERROR: Parolele noi nu coincid.');
      return;
    }
    if (form.parola_noua.length < 6) {
      setMesaj('ERROR: Parola noua trebuie sa aiba minim 6 caractere.');
      return;
    }

    setLoading(true);
    try {
      await api.post(API.ANGAJAT_SCHIMBARE_PAROLA, {
        id_angajat:   idAngajat,
        parola_veche: form.parola_veche,
        parola_noua:  form.parola_noua,
      });
      setMesaj('Parola a fost schimbata cu succes!');
      setForm({ parola_veche: '', parola_noua: '', confirmare: '' });
    } catch (err) {
      const data = err.response?.data;
      setMesaj(`ERROR: ${data?.detalii || data?.mesaj || 'Eroare la schimbarea parolei.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '400px' }}>
      {[
        { name: 'parola_veche', label: 'PAROLA CURENTA' },
        { name: 'parola_noua',  label: 'PAROLA NOUA' },
        { name: 'confirmare',   label: 'CONFIRMA PAROLA NOUA' },
      ].map(({ name, label }) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ color: cyan, fontSize: '11px' }}>{label}:</label>
          <input
            type="password"
            name={name}
            value={form[name]}
            onChange={handleChange}
            required
            style={{
              backgroundColor: '#3c3c3c', color: 'white',
              border: '1px solid #555', padding: '8px 12px',
              fontFamily: 'Consolas, monospace', fontSize: '13px',
              outline: 'none', width: '100%', boxSizing: 'border-box',
            }}
          />
        </div>
      ))}

      {mesaj && (
        <p style={{
          color: mesaj.startsWith('ERROR') ? roz : '#6a9955',
          fontSize: '12px', margin: 0,
        }}>
          {mesaj}
        </p>
      )}

      <button type="submit" disabled={loading} style={{
        backgroundColor: 'transparent',
        color: loading ? '#555' : roz,
        border: `2px solid ${loading ? '#555' : roz}`,
        padding: '10px 24px',
        fontFamily: 'Consolas, monospace',
        fontSize: '13px',
        cursor: loading ? 'not-allowed' : 'pointer',
        alignSelf: 'flex-start',
      }}>
        {loading ? 'Se salveaza...' : 'SCHIMBA PAROLA'}
      </button>
    </form>
  );
}

const tdStyle = {
  padding: '7px 10px',
  color: '#9cdcfe',
  verticalAlign: 'middle',
};