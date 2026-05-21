import { useState, useEffect } from 'react';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

const actiuneCuloare = {
  'INSERT': '#6a9955',
  'UPDATE': '#f39c12',
  'DELETE': '#e74c3c',
};

const tabelCuloare = {
  'angajati':        '#4ec9b0',
  'utilizatori':     '#9b59b6',
  'concedii':        '#3498db',
  'evaluari':        '#f39c12',
  'salarii':         '#e74c3c',
  'proiecte':        '#1abc9c',
  'alocari_proiecte':'#e67e22',
};

export default function AuditPage() {
  const [logs, setLogs]           = useState([]);
  const [filtrate, setFiltrate]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [eroare, setEroare]       = useState(null);

  // filtre
  const [filtreTabel, setFiltreTabel]     = useState('');
  const [filtreActiune, setFiltreActiune] = useState('');
  const [filtreUser, setFiltreUser]       = useState('');
  const [cautare, setCautare]             = useState('');

  // paginare
  const [pagina, setPagina]   = useState(1);
  const perPagina             = 25;

  useEffect(() => {
    api.get(API.AUDIT_LOG)
      .then(res => {
        const date = res.data.date_audit || [];
        setLogs(date);
        setFiltrate(date);
      })
      .catch(() => setEroare('Nu s-au putut incarca datele audit.'))
      .finally(() => setLoading(false));
  }, []);

  // filtrare reactiva
  useEffect(() => {
    let rezultat = [...logs];

    if (filtreTabel)   rezultat = rezultat.filter(l => l.tabel === filtreTabel);
    if (filtreActiune) rezultat = rezultat.filter(l => l.actiune === filtreActiune);
    if (filtreUser)    rezultat = rezultat.filter(l => l.utilizator === filtreUser);
    if (cautare) {
      const t = cautare.toLowerCase();
      rezultat = rezultat.filter(l =>
        String(l.id_inregistrare).includes(t) ||
        String(l.valoare_veche || '').toLowerCase().includes(t) ||
        String(l.valoare_noua  || '').toLowerCase().includes(t) ||
        String(l.coloana       || '').toLowerCase().includes(t) ||
        String(l.utilizator    || '').toLowerCase().includes(t)
      );
    }

    setFiltrate(rezultat);
    setPagina(1);
  }, [filtreTabel, filtreActiune, filtreUser, cautare, logs]);

  const tabele   = [...new Set(logs.map(l => l.tabel))].filter(Boolean).sort();
  const actiuni  = [...new Set(logs.map(l => l.actiune))].filter(Boolean).sort();
  const useri    = [...new Set(logs.map(l => l.utilizator))].filter(Boolean).sort();

  const totalPagini  = Math.ceil(filtrate.length / perPagina);
  const logsAfisate  = filtrate.slice((pagina - 1) * perPagina, pagina * perPagina);

  const formatData = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return `${dt.toLocaleDateString('ro-RO')} ${dt.toLocaleTimeString('ro-RO')}`;
  };

  const resetFiltre = () => {
    setFiltreTabel('');
    setFiltreActiune('');
    setFiltreUser('');
    setCautare('');
  };

  if (loading) return <p style={{ color: '#808080', fontFamily: 'Consolas, monospace' }}>Se incarca...</p>;
  if (eroare)  return <p style={{ color: roz,      fontFamily: 'Consolas, monospace' }}>ERROR: {eroare}</p>;

  return (
    <div style={{ fontFamily: 'Consolas, monospace' }}>

      {/* header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> AUDIT LOG
        </h2>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          {logs.length} inregistrari totale — afisate {filtrate.length} dupa filtrare
        </p>
      </div>

      {/* sumar actiuni */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['INSERT', 'UPDATE', 'DELETE'].map(tip => {
          const nr = logs.filter(l => l.actiune === tip).length;
          return (
            <div
              key={tip}
              onClick={() => setFiltreActiune(filtreActiune === tip ? '' : tip)}
              style={{
                backgroundColor: filtreActiune === tip ? actiuneCuloare[tip] + '22' : '#252526',
                border: `1px solid ${actiuneCuloare[tip]}`,
                borderLeft: `3px solid ${actiuneCuloare[tip]}`,
                padding: '12px 20px', borderRadius: '2px',
                cursor: 'pointer', minWidth: '120px',
              }}
            >
              <div style={{ color: '#808080', fontSize: '10px', marginBottom: '4px' }}>{tip}</div>
              <div style={{ color: actiuneCuloare[tip], fontSize: '22px', fontWeight: 'bold' }}>{nr}</div>
            </div>
          );
        })}
        <div style={{
          backgroundColor: '#252526', border: '1px solid #333',
          borderLeft: `3px solid ${cyan}`, padding: '12px 20px',
          borderRadius: '2px', minWidth: '120px',
        }}>
          <div style={{ color: '#808080', fontSize: '10px', marginBottom: '4px' }}>TOTAL</div>
          <div style={{ color: cyan, fontSize: '22px', fontWeight: 'bold' }}>{logs.length}</div>
        </div>
      </div>

      {/* filtre */}
      <div style={{
        backgroundColor: '#252526', border: '1px solid #333',
        borderLeft: `3px solid ${cyan}`, padding: '16px 20px',
        marginBottom: '20px', borderRadius: '2px',
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

          {/* cautare */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 2, minWidth: '200px' }}>
            <label style={{ color: cyan, fontSize: '10px' }}>CAUTA:</label>
            <input
              type="text"
              value={cautare}
              onChange={e => setCautare(e.target.value)}
              placeholder="valoare, coloana, utilizator..."
              style={inputStyle}
            />
          </div>

          {/* filtru tabel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '150px' }}>
            <label style={{ color: cyan, fontSize: '10px' }}>TABEL:</label>
            <select value={filtreTabel} onChange={e => setFiltreTabel(e.target.value)} style={selectStyle}>
              <option value="">-- toate --</option>
              {tabele.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* filtru actiune */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '130px' }}>
            <label style={{ color: cyan, fontSize: '10px' }}>ACTIUNE:</label>
            <select value={filtreActiune} onChange={e => setFiltreActiune(e.target.value)} style={selectStyle}>
              <option value="">-- toate --</option>
              {actiuni.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* filtru utilizator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '150px' }}>
            <label style={{ color: cyan, fontSize: '10px' }}>UTILIZATOR:</label>
            <select value={filtreUser} onChange={e => setFiltreUser(e.target.value)} style={selectStyle}>
              <option value="">-- toti --</option>
              {useri.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <button onClick={resetFiltre} style={{
            backgroundColor: 'transparent', color: '#808080',
            border: '1px solid #808080', padding: '8px 14px',
            fontFamily: 'Consolas, monospace', fontSize: '11px',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            RESET
          </button>
        </div>
      </div>

      {/* tabel */}
      {logsAfisate.length === 0 ? (
        <p style={{ color: '#808080' }}>Nu exista inregistrari pentru filtrele selectate.</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${roz}` }}>
                  {['ID', 'TABEL', 'ID REC', 'ACTIUNE', 'COLOANA', 'VALOARE VECHE', 'VALOARE NOUA', 'UTILIZATOR', 'DATA'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '8px 10px',
                      color: cyan, fontWeight: 'normal',
                      whiteSpace: 'nowrap', letterSpacing: '0.5px',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logsAfisate.map((log, idx) => (
                  <tr key={log.id_log} style={{
                    backgroundColor: idx % 2 === 0 ? '#1e1e1e' : '#252526',
                    borderBottom: '1px solid #2d2d2d',
                  }}>
                    <td style={{ ...tdStyle, color: '#555' }}>{log.id_log}</td>
                    <td style={tdStyle}>
                      <span style={{
                        color: tabelCuloare[log.tabel] || '#9cdcfe',
                        fontSize: '10px',
                      }}>
                        {log.tabel}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#808080' }}>{log.id_inregistrare}</td>
                    <td style={tdStyle}>
                      <span style={{
                        color: actiuneCuloare[log.actiune] || '#9cdcfe',
                        border: `1px solid ${actiuneCuloare[log.actiune] || '#555'}`,
                        padding: '1px 6px', fontSize: '10px',
                      }}>
                        {log.actiune}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#d4d4d4' }}>{log.coloana || '—'}</td>
                    <td style={{ ...tdStyle, color: '#e74c3c', maxWidth: '150px' }}>
                      <span style={{
                        display: 'block', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }} title={log.valoare_veche}>
                        {log.valoare_veche || '—'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#6a9955', maxWidth: '150px' }}>
                      <span style={{
                        display: 'block', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }} title={log.valoare_noua}>
                        {log.valoare_noua || '—'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#9b59b6' }}>{log.utilizator || '—'}</td>
                    <td style={{ ...tdStyle, color: '#808080', whiteSpace: 'nowrap' }}>
                      {formatData(log.data_actiune)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* paginare */}
          {totalPagini > 1 && (
            <div style={{
              display: 'flex', gap: '8px', alignItems: 'center',
              marginTop: '16px', flexWrap: 'wrap',
            }}>
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
                style={btnPagStyle(pagina === 1)}
              >
                ← PREV
              </button>

              {Array.from({ length: Math.min(5, totalPagini) }, (_, i) => {
                const start = Math.max(1, Math.min(pagina - 2, totalPagini - 4));
                const nr    = start + i;
                return (
                  <button
                    key={nr}
                    onClick={() => setPagina(nr)}
                    style={{
                      ...btnPagStyle(false),
                      color: nr === pagina ? '#1e1e1e' : cyan,
                      backgroundColor: nr === pagina ? cyan : 'transparent',
                      border: `1px solid ${cyan}`,
                    }}
                  >
                    {nr}
                  </button>
                );
              })}

              <button
                onClick={() => setPagina(p => Math.min(totalPagini, p + 1))}
                disabled={pagina === totalPagini}
                style={btnPagStyle(pagina === totalPagini)}
              >
                NEXT →
              </button>

              <span style={{ color: '#808080', fontSize: '11px', marginLeft: '8px' }}>
                pagina {pagina} din {totalPagini} — {filtrate.length} inregistrari
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const tdStyle = {
  padding: '7px 10px',
  color: '#9cdcfe',
  verticalAlign: 'middle',
};

const btnPagStyle = (disabled) => ({
  backgroundColor: 'transparent',
  color: disabled ? '#333' : '#4ec9b0',
  border: `1px solid ${disabled ? '#333' : '#4ec9b0'}`,
  padding: '5px 10px',
  fontFamily: 'Consolas, monospace',
  fontSize: '11px',
  cursor: disabled ? 'not-allowed' : 'pointer',
});

const inputStyle = {
  backgroundColor: '#3c3c3c', color: 'white',
  border: '1px solid #555', padding: '7px 12px',
  fontFamily: 'Consolas, monospace', fontSize: '12px',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};

const selectStyle = {
  backgroundColor: '#3c3c3c', color: 'white',
  border: '1px solid #555', padding: '7px 12px',
  fontFamily: 'Consolas, monospace', fontSize: '12px',
  outline: 'none', width: '100%',
};