import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function ArhivaPage() {
  const [arhiva, setArhiva]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare]   = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const rol = user?.rol || '';

  useEffect(() => {
    if (rol) {
      incarcaArhiva();
    }
  }, [rol]);

  const incarcaArhiva = async () => {
    setLoading(true);
    setEroare(null);

    try {
      // 1. Preluăm lista generală de angajați inactivi din arhivă
      const endpointCurent = rol === 'director' ? API.DIRECTOR_ARHIVA : API.ANGAJATI_ARHIVA;
      const arhivaRes = await api.get(endpointCurent);
      const dateArhiva = arhivaRes.data.date || arhivaRes.data || [];

      if (rol === 'project_manager') {
        // 2. Pentru Project Manager, aducem membrii care sunt/au fost asociați proiectelor sale
        const echipaRes = await api.get(API.VIEW_TEAM_LEADER).catch(() => ({ data: [] }));
        const dateEchipa = echipaRes.data.date_echipa || echipaRes.data || [];

        // Creăm un Set cu ID-urile unice ale tuturor angajaților din proiectele lui
        const idUriOameniProiecte = new Set(dateEchipa.map(membru => Number(membru.id_angajat)));

        // 3. Filtrăm arhiva globală: păstrăm doar foștii angajați care se află în proiectele lui
        const arhivaFiltrata = dateArhiva.filter(angajatInactiv => 
          idUriOameniProiecte.has(Number(angajatInactiv.id_angajat))
        );

        setArhiva(arhivaFiltrata);
      } else {
        // Pentru CEO, HR Manager sau Director, păstrăm comportamentul inițial neatins
        setArhiva(dateArhiva);
      }
    } catch (err) {
      console.error("Eroare incarcare arhiva:", err);
      setEroare('Nu s-a putut incarca arhiva angajatilor inactivi.');
    } finally {
      setLoading(false);
    }
  };

  const formatData = (d) => d ? new Date(d).toLocaleDateString('ro-RO') : '—';
  const formatRON  = (v) => v ? `${Number(v).toLocaleString('ro-RO')} RON` : '—';

  // Blocăm complet accesul utilizatorilor neautorizați (ex: readonly)
  if (rol === 'app_readonly') {
    return (
      <div style={{ fontFamily: 'Consolas, monospace', color: '#808080', padding: '20px' }}>
        <h2 style={{ color: roz, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> ARHIVA
        </h2>
        <p style={{ marginTop: '16px', fontSize: '13px' }}>
          // Nu aveti permisiunea de a accesa arhiva companiei.
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Consolas, monospace' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> ARHIVA
        </h2>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          {rol === 'project_manager'
            ? `Afișați: ${arhiva.length} foști angajați care au făcut parte din proiectele tale. Datele financiare sunt mascate.`
            : rol === 'director'
              ? 'Vizualizare foști angajați (Filtrare automată pe orașul tău)'
              : 'Vizualizare foști angajați (Toate locațiile)'
          }
        </p>
      </div>

      {loading && <p style={{ color: '#808080' }}>Se incarca...</p>}
      {eroare  && <p style={{ color: roz }}>ERROR: {eroare}</p>}

      {!loading && !eroare && arhiva.length === 0 && (
        <div style={{ color: '#808080', fontSize: '13px', padding: '12px', border: '1px dashed #333' }}>
          // Nu există angajați inactivi înregistrați pentru criteriul selectat.
        </div>
      )}

      {!loading && !eroare && arhiva.length > 0 && (
        <div style={{ overflowX: 'auto', border: '1px solid #333', borderRadius: '4px', backgroundColor: '#252526' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333', backgroundColor: '#2d2d2d' }}>
                <th style={{ padding: '12px', color: cyan }}>ID</th>
                <th style={{ padding: '12px', color: cyan }}>NUME COMPLET</th>
                <th style={{ padding: '12px', color: cyan }}>EMAIL</th>
                <th style={{ padding: '12px', color: cyan }}>DEPARTAMENT</th>
                <th style={{ padding: '12px', color: cyan }}>POZIȚIE</th>
                <th style={{ padding: '12px', color: cyan }}>DATA ANGAJARE</th>
                <th style={{ padding: '12px', color: cyan }}>ULTIMUL SALARIU</th>
                <th style={{ padding: '12px', color: cyan }}>ACȚIUNI</th>
              </tr>
            </thead>
            <tbody>
              {arhiva.map((a) => {
                // Regulă de business: Project managerul nu are voie să vadă istoricul salarial al foștilor angajați
                const mascheazaSalariu = rol === 'project_manager';

                return (
                  <tr key={a.id_angajat} style={{ borderBottom: '1px solid #2d2d2d', opacity: 0.85 }}>
                    <td style={tdStyle}>{a.id_angajat}</td>
                    <td style={{ ...tdStyle, color: 'white', fontWeight: 'bold' }}>
                      {a.prenume} {a.nume}
                    </td>
                    <td style={tdStyle}>{a.email}</td>
                    <td style={tdStyle}>{a.nume_departament || '—'}</td>
                    <td style={tdStyle}>{a.titlu_pozitie || '—'}</td>
                    <td style={tdStyle}>{formatData(a.data_angajare)}</td>
                    
                    {/* Ultimul Salariu */}
                    <td style={{ ...tdStyle, color: mascheazaSalariu ? '#555' : '#6a9955', fontStyle: mascheazaSalariu ? 'italic' : 'normal' }}>
                      {mascheazaSalariu ? '[CONFIDENȚIAL]' : formatRON(a.salariu_curent)}
                    </td>
                    
                    <td style={tdStyle}>
                      <button
                        onClick={() => navigate(`/angajati/${a.id_angajat}`)}
                        style={btnMicStyle(cyan)}
                      >
                        PROFIL
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const tdStyle = {
  padding: '9px 12px', color: '#9cdcfe',
  verticalAlign: 'middle', whiteSpace: 'nowrap',
};

const btnMicStyle = (culoare) => ({
  backgroundColor: 'transparent', color: culoare, border: `1px solid ${culoare}`,
  padding: '3px 8px', fontFamily: 'Consolas, monospace', fontSize: '10px',
  cursor: 'pointer',
});