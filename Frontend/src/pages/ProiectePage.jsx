import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import API from '../constants/apiRoutes';
import { useNavigate } from 'react-router-dom';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

const statusCuloare = {
  'in desfasurare': '#6a9955',
  'finalizat':      '#4ec9b0',
  'anulat':         '#ff22a1',
  'planificat':     '#f39c12',
};

export default function ProiectePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [proiecte, setProiecte] = useState([]);
  const [alocari, setAlocari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabActiv, setTabActiv] = useState('proiecte');

  const rol = (user?.rol || '').toLowerCase();
  const accesInterzis = rol === 'hr_specialist';

  useEffect(() => {
    if (rol && !accesInterzis) {
      incarcaDateProiecte();
    } else {
      setLoading(false);
    }
  }, [rol, user]);

  const incarcaDateProiecte = async () => {
    setLoading(true);
    try {
      // 1. LOGICĂ DE AFIȘARE ȘI FILTRARE PROIECTE
      if (rol === 'project_manager') {
        const res = await api.get('/proiecte/ale-mele');
        const proiectePM = res.data?.proiecte || [];
        // Pentru PM limităm strict la primele 8 proiecte, așa cum ai cerut
        setProiecte(proiectePM.slice(0, 8));
      } else {
        // Pentru CEO (sau alte roluri administrative), le afișăm pe TOATE (fără limitare de slice)
        const res = await api.get(API.PROIECTE);
        const toateProiectele = Array.isArray(res.data) ? res.data : [];
        setProiecte(toateProiectele);
      }

      // 2. ÎNCĂRCARE DATE REALE PENTRU ANGAJAȚI / ECHIPĂ DIN BAZA DE DATE
      // Preluăm id-ul angajatului logat din token/sesiune
      const idManagerLogat = user?.id_angajat;
      
      if (idManagerLogat) {
        // Apelăm ruta din backend-ul tău din app.py care întoarce echipa reală: /api/echipa/<id_manager>
        const resEchipa = await api.get('/echipa').catch(() => null);
        
        // ÎNLOCUIEȘTE blocul if (resEchipa && Array.isArray(resEchipa.data)) cu:
        if (resEchipa && Array.isArray(resEchipa.data)) {
          const echipaReala = resEchipa.data.map(angajat => ({
            id_angajat:   angajat.id_angajat,
            nume_angajat: `${angajat.prenume} ${angajat.nume}`,
            nume_proiect: angajat.departament || '—',
            rol_proiect:  angajat.functie || 'Membru Echipă',
            ore_alocate:  '—'
          }));
        setAlocari(echipaReala);
        }
      }

    } catch (err) {
      console.error("Eroare la procesarea structurilor din baza de date:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatRON = (v) => v ? `${Number(v).toLocaleString('ro-RO')} RON` : '—';

  if (accesInterzis) {
    return (
      <div style={{ fontFamily: 'Consolas, monospace', color: '#808080', padding: '20px' }}>
        <h2 style={{ color: roz, fontSize: '18px' }}><span style={{ color: cyan }}>{'>'}</span> PROIECTE</h2>
        <p style={{ marginTop: '16px', fontSize: '13px' }}> Rolul dvs. nu are permisiunea de a vizualiza proiectele.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Consolas, monospace', padding: '10px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> MANAGEMENT PROIECTE
        </h2>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          {rol === 'project_manager' 
            ? ' Mod PM: Limitat la maximum 8 proiecte asignate și echipa proprie.' 
            : ` Mod Administrator (${rol.toUpperCase()}): Se afișează toate proiectele companiei.`}
        </p>
      </div>

      {/* Tab-uri */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '1px' }}>
        <button onClick={() => setTabActiv('proiecte')} style={tabStyle(tabActiv === 'proiecte')}>
          PROIECTE ({proiecte.length})
        </button>
        <button onClick={() => setTabActiv('alocari')} style={tabStyle(tabActiv === 'alocari')}>
          ECHIPĂ ȘI RESURSE REALE
        </button>
      </div>

      {loading && <p style={{ color: '#808080' }}>Se incarca...</p>}

      {/* TAB 1: PROIECTE */}
      {!loading && tabActiv === 'proiecte' && (
        <>
          {proiecte.length === 0 ? (
            <p style={{ color: '#808080' }}> Nu există proiecte încărcate în sistem.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {proiecte.map(p => (
                <div 
                  key={p.id_proiect} 
                  onClick={() => navigate(`/detalii-proiecte/${p.id_proiect}`)}
                  style={{
                    backgroundColor: '#252526', border: '1px solid #333',
                    borderTop: `2px solid ${statusCuloare[p.status] || '#555'}`, padding: '18px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{
                        fontSize: '10px', padding: '2px 6px',
                        backgroundColor: '#1e1e1e', color: statusCuloare[p.status],
                        border: `1px solid ${statusCuloare[p.status]}`
                      }}>
                        {(p.status || 'planificat').toUpperCase()}
                      </span>
                      {p.buget && (
                        <span style={{ color: '#6a9955', fontSize: '12px', fontWeight: 'bold' }}>
                          {formatRON(p.buget)}
                        </span>
                      )}
                    </div>
                    <h4 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '15px' }}>{p.nume}</h4>
                    <p style={{ color: '#808080', fontSize: '12px', margin: '0', lineHeight: '1.4' }}>
                      {p.descriere || 'Fără descriere.'}
                    </p>
                  </div>
                  <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '10px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#9cdcfe' }}>Vizualizare Securizată</div>
                    <div style={{ color: '#555', fontSize: '10px' }}>ID: {p.id_proiect}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: ALOCĂRI REALE */}
      {!loading && tabActiv === 'alocari' && (
        <>
          {alocari.length === 0 ? (
            <p style={{ color: '#808080' }}> Nu au fost găsiți subordonați înregistrați pentru contul dvs. în DB.</p>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid #333', backgroundColor: '#252526' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${roz}`, backgroundColor: '#2d2d2d' }}>
                    <th style={thStyle}>ID ANGAJAT</th>
                    <th style={thStyle}>NUME COMPLET COLEG</th>
                    <th style={thStyle}>PROIECT REAL</th>
                    <th style={thStyle}>ROL ÎN ECHIPĂ</th>
                    <th style={thStyle}>NORMA DIN DB</th>
                  </tr>
                </thead>
                <tbody>
                  {alocari.map((a, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#1e1e1e' : '#252526', borderBottom: '1px solid #2d2d2d' }}>
                      <td style={tdStyle}>{a.id_angajat}</td>
                      <td style={{ ...tdStyle, color: 'white', fontWeight: 'bold' }}>{a.nume_angajat}</td>
                      <td style={{ ...tdStyle, color: cyan }}>{a.nume_proiect}</td>
                      <td style={{ ...tdStyle, color: '#9cdcfe' }}>{a.rol_proiect}</td>
                      <td style={{ ...tdStyle, color: '#6a9955', fontWeight: 'bold' }}>{a.ore_alocate} ore</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const tabStyle = (activ) => ({
  backgroundColor: activ ? '#252526' : 'transparent',
  color: activ ? roz : '#808080',
  border: '1px solid #333',
  borderBottom: activ ? '1px solid #252526' : '1px solid #333',
  padding: '10px 20px',
  fontFamily: 'Consolas, monospace',
  fontSize: '12px',
  cursor: 'pointer',
});

const thStyle = { padding: '10px 12px', color: cyan, fontWeight: 'normal' };
const tdStyle = { padding: '10px 12px', color: '#9cdcfe' };