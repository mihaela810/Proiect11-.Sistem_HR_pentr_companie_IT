import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { poateFace } from '../utils/roluri';
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

export default function AngajatProfilPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rol = user?.rol || '';

  const [profil, setProfil]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [eroare, setEroare]       = useState(null);
  const [showMarire, setShowMarire] = useState(false);
  const [procent, setProcent]     = useState('');
  const [motiv, setMotiv]         = useState('');
  const [mesajMarire, setMesajMarire] = useState('');
  const [loadingMarire, setLoadingMarire] = useState(false);

  const incarcaProfil = () => {
    setLoading(true);
    api.get(API.ANGAJAT_PROFIL(id))
      .then(res => setProfil(res.data))
      .catch(() => setEroare('Nu s-a putut incarca profilul angajatului.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { incarcaProfil(); }, [id]);

  const handleMarire = async (e) => {
    e.preventDefault();
    setMesajMarire('');
    if (!procent || Number(procent) <= 0) {
      setMesajMarire('ERROR: Procentul trebuie sa fie pozitiv.');
      return;
    }
    setLoadingMarire(true);
    try {
      await api.post(API.ANGAJAT_MARIRE, {
        id_angajat: id,
        procent:    Number(procent),
        motiv:      motiv || 'Marire salariala',
      });
      setMesajMarire(`✓ Marire de ${procent}% aplicata cu succes!`);
      setProcent('');
      setMotiv('');
      setTimeout(() => {
        setShowMarire(false);
        setMesajMarire('');
        incarcaProfil();
      }, 2000);
    } catch (err) {
      const data = err.response?.data;
      setMesajMarire(`ERROR: ${data?.detalii || data?.mesaj || 'Eroare la marire.'}`);
    } finally {
      setLoadingMarire(false);
    }
  };

  if (loading) return <p style={{ color: '#808080', fontFamily: 'Consolas, monospace' }}>Se incarca...</p>;
  if (eroare)  return <p style={{ color: roz, fontFamily: 'Consolas, monospace' }}>ERROR: {eroare}</p>;
  if (!profil) return null;

  const formatRON  = (v) => v ? `${Number(v).toLocaleString('ro-RO')} RON` : '—';
  const formatData = (d) => d ? new Date(d).toLocaleDateString('ro-RO') : '—';

  const culoareGrila = () => {
    const poz = profil.analiza_piata?.pozitie_grila || '';
    if (poz.includes('Subdeplătit')) return roz;
    if (poz.includes('Peste'))       return '#f39c12';
    return '#6a9955';
  };

  return (
    <div style={{ fontFamily: 'Consolas, monospace', maxWidth: '900px' }}>

      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ color: roz, margin: 0, fontSize: '20px' }}>
            {profil.prenume} {profil.nume}
          </h2>
          <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
            {profil.functie} — {profil.departament}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {poateFace(rol, 'salarii') && (
            <button
              onClick={() => { setShowMarire(!showMarire); setMesajMarire(''); }}
              style={btnStyle('#6a9955')}
            >
              {showMarire ? 'ANULEAZA' : 'MARIRE SALARIU'}
            </button>
          )}
          {!poateFace(rol, 'readonly') && (
            <button
              onClick={() => navigate(`/angajati/${id}/editeaza`)}
              style={btnStyle('#f39c12')}
            >
              EDITEAZA
            </button>
          )}
          {poateFace(rol, 'angajati') && !poateFace(rol, 'readonly') && (
            <BtnDezactivare idAngajat={id} onSuccess={() => navigate('/angajati')} />
          )}
          <button onClick={() => navigate('/angajati')} style={btnStyle('#808080')}>
            INAPOI
          </button>
        </div>
      </div>

      {/* formular marire */}
      {showMarire && poateFace(rol, 'salarii') && (
        <div style={{
          backgroundColor: '#252526', border: `1px solid #6a9955`,
          borderLeft: `3px solid #6a9955`, padding: '20px',
          marginBottom: '28px', borderRadius: '2px',
        }}>
          <h3 style={{ color: '#6a9955', fontSize: '13px', margin: '0 0 16px' }}>
            ACORDA MARIRE SALARIALA
          </h3>
          <form onSubmit={handleMarire} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ color: cyan, fontSize: '11px' }}>PROCENT MARIRE (%):</label>
                <input
                  type="number" value={procent} min="0.1" step="0.1"
                  onChange={e => setProcent(e.target.value)}
                  required style={inputStyle}
                  placeholder="ex: 10"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 2 }}>
                <label style={{ color: cyan, fontSize: '11px' }}>MOTIV:</label>
                <input
                  type="text" value={motiv}
                  onChange={e => setMotiv(e.target.value)}
                  style={inputStyle}
                  placeholder="ex: performanta excelenta Q1"
                />
              </div>
            </div>
            {/* preview salariu nou */}
            {procent && Number(procent) > 0 && (
              <div style={{ backgroundColor: '#1e1e1e', border: '1px solid #333', padding: '10px 14px', fontSize: '12px' }}>
                <span style={{ color: '#808080' }}>Salariu curent: </span>
                <span style={{ color: '#9cdcfe' }}>{formatRON(profil.salariu_curent)}</span>
                <span style={{ color: '#555', margin: '0 8px' }}>→</span>
                <span style={{ color: '#6a9955', fontWeight: 'bold' }}>
                  {formatRON(profil.salariu_curent * (1 + Number(procent) / 100))}
                </span>
                <span style={{ color: '#6a9955', marginLeft: '8px' }}>
                  (+{procent}%)
                </span>
              </div>
            )}
            {mesajMarire && (
              <p style={{ color: mesajMarire.startsWith('ERROR') ? roz : '#6a9955', margin: 0, fontSize: '12px' }}>
                {mesajMarire}
              </p>
            )}
            <button type="submit" disabled={loadingMarire} style={{
              ...btnStyle('#6a9955'), alignSelf: 'flex-start',
              padding: '10px 24px', border: `2px solid #6a9955`,
            }}>
              {loadingMarire ? 'SE_APLICA...' : 'APLICA_MARIRE()'}
            </button>
          </form>
        </div>
      )}

      {/* date personale */}
      <Sectiune titlu="DATE PERSONALE">
        {poateFace(rol, 'cnp') && <InfoRow label="CNP" value={profil.cnp} />}
        <InfoRow label="Email"         value={profil.email} />
        <InfoRow label="Telefon"       value={profil.telefon} />
        <InfoRow label="Data angajare" value={formatData(profil.data_angajare)} />
        <InfoRow label="Status"        value={profil.status?.toUpperCase()} />
      </Sectiune>

      {/* pozitie si salariu */}
      <Sectiune titlu="POZITIE SI SALARIU">
        <InfoRow label="Functie"     value={profil.functie} />
        <InfoRow label="Departament" value={profil.departament} />
        {poateFace(rol, 'salarii') && (
          <>
            <InfoRow label="Salariu brut" value={formatRON(profil.salariu_curent)} />
            <InfoRow
              label="Salariu net estimat"
              value={
                profil.analiza_piata?.salariu_net_calculat
                  ? formatRON(profil.analiza_piata.salariu_net_calculat)
                  : '—'
              }
            />
            <InfoRow
              label="Grila salariala"
              value={`${formatRON(profil.salariu_min)} — ${formatRON(profil.salariu_max)}`}
            />
            <div style={{ display: 'flex', gap: '16px', padding: '7px 0', borderBottom: '1px solid #2d2d2d' }}>
              <span style={{ color: '#808080', minWidth: '200px', fontSize: '12px' }}>
                Pozitie in grila
              </span>
              <span style={{ color: culoareGrila(), fontSize: '12px', fontWeight: 'bold' }}>
                {profil.analiza_piata?.pozitie_grila} ({profil.analiza_piata?.compa_ratio})
              </span>
            </div>
          </>
        )}
      </Sectiune>

      {/* evaluari */}
      <Sectiune titlu={`EVALUARI (${profil.evaluari?.length || 0})`}>
        {profil.evaluari?.length === 0 ? (
          <p style={{ color: '#808080', fontSize: '12px' }}>Nu exista evaluari.</p>
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
              {profil.evaluari.map((e, i) => (
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

      {/* proiecte */}
      <Sectiune titlu={`PROIECTE ACTIVE (${profil.proiecte?.length || 0})`}>
        {profil.proiecte?.length === 0 ? (
          <p style={{ color: '#808080', fontSize: '12px' }}>Nu exista proiecte active.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${roz}` }}>
                {['PROIECT', 'ROL', 'ORE ALOCATE'].map(h => (
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
              {profil.proiecte.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #2d2d2d' }}>
                  <td style={tdStyle}>{p.nume}</td>
                  <td style={tdStyle}>{p.rol_proiect}</td>
                  <td style={{ ...tdStyle, color: cyan }}>{p.ore_alocate}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Sectiune>

      {/* istoric salarial */}
      {poateFace(rol, 'salarii') && (
        <Sectiune titlu={`ISTORIC SALARIAL (${profil.istoric_salarii?.length || 0})`}>
          {profil.istoric_salarii?.length === 0 ? (
            <p style={{ color: '#808080', fontSize: '12px' }}>Nu exista modificari salariale.</p>
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
                {profil.istoric_salarii.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #2d2d2d' }}>
                    <td style={tdStyle}>{formatData(s.data_modificare)}</td>
                    <td style={tdStyle}>{formatRON(s.salariu_vechi)}</td>
                    <td style={{ ...tdStyle, color: cyan }}>{formatRON(s.salariu_nou)}</td>
                    <td style={{ ...tdStyle, color: '#808080' }}>{s.motiv || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Sectiune>
      )}

    </div>
  );
}

function BtnDezactivare({ idAngajat, onSuccess }) {
  const roz = '#ff22a1';
  const [showModal, setShowModal] = useState(false);
  const [motiv, setMotiv]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [eroare, setEroare]       = useState('');

  const handleDezactivare = async () => {
    if (!motiv.trim()) { setEroare('Motivul este obligatoriu.'); return; }
    setLoading(true);
    try {
      await api.post(API.ANGAJAT_DEZACTIVARE, {
        id_angajat: idAngajat,
        motiv,
      });
      onSuccess();
    } catch (err) {
      const data = err.response?.data;
      setEroare(data?.detalii || data?.mesaj || 'Eroare la dezactivare.');
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} style={{
        backgroundColor: 'transparent', color: roz,
        border: `1px solid ${roz}`, padding: '6px 14px',
        fontFamily: 'Consolas, monospace', fontSize: '12px', cursor: 'pointer',
      }}>
        DEZACTIVEAZA
      </button>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#252526', border: `1px solid ${roz}`,
            padding: '28px', borderRadius: '4px', width: '420px',
            fontFamily: 'Consolas, monospace',
          }}>
            <h3 style={{ color: roz, margin: '0 0 16px', fontSize: '14px' }}>
              CONFIRMA DEZACTIVARE
            </h3>
            <p style={{ color: '#808080', fontSize: '12px', margin: '0 0 16px' }}>
              Angajatul va fi marcat ca inactiv. Aceasta actiune poate fi reversata.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <label style={{ color: '#4ec9b0', fontSize: '11px' }}>MOTIV: *</label>
              <textarea
                value={motiv}
                onChange={e => { setMotiv(e.target.value); setEroare(''); }}
                rows={3}
                placeholder="ex: demisie, contract expirat..."
                style={{
                  backgroundColor: '#3c3c3c', color: 'white',
                  border: '1px solid #555', padding: '8px 12px',
                  fontFamily: 'Consolas, monospace', fontSize: '13px',
                  outline: 'none', resize: 'vertical',
                }}
              />
            </div>
            {eroare && <p style={{ color: roz, fontSize: '12px', margin: '0 0 12px' }}>ERROR: {eroare}</p>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleDezactivare} disabled={loading} style={{
                backgroundColor: 'transparent', color: loading ? '#555' : roz,
                border: `2px solid ${loading ? '#555' : roz}`,
                padding: '8px 20px', fontFamily: 'Consolas, monospace',
                fontSize: '12px', cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Se proceseaza...' : 'CONFIRMA'}
              </button>
              <button onClick={() => { setShowModal(false); setMotiv(''); setEroare(''); }} style={{
                backgroundColor: 'transparent', color: '#808080',
                border: '1px solid #808080', padding: '8px 20px',
                fontFamily: 'Consolas, monospace', fontSize: '12px', cursor: 'pointer',
              }}>
                ANULEAZA
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const tdStyle = {
  padding: '7px 10px',
  color: '#9cdcfe',
  verticalAlign: 'middle',
};

const btnStyle = (culoare) => ({
  backgroundColor: 'transparent', color: culoare,
  border: `1px solid ${culoare}`, padding: '6px 14px',
  fontFamily: 'Consolas, monospace', fontSize: '12px',
  cursor: 'pointer',
});

const inputStyle = {
  backgroundColor: '#3c3c3c', color: 'white',
  border: '1px solid #555', padding: '8px 12px',
  fontFamily: 'Consolas, monospace', fontSize: '13px',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};