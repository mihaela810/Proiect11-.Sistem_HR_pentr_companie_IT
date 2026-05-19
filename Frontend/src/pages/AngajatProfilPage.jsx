import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import API from '../constants/apiRoutes';
import { AuthContext } from '../context/AuthContext';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';
const verde = '#6a9955';
const gri   = '#808080';
const fundal_sectiune = '#1e1e1e';
const fundal_modal    = 'rgba(0,0,0,0.75)';

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

function InfoRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', gap: '16px', padding: '7px 0', borderBottom: '1px solid #2d2d2d' }}>
      <span style={{ color: gri, minWidth: '200px', fontSize: '12px' }}>{label}</span>
      <span style={{ color: highlight ? cyan : '#d4d4d4', fontSize: '12px', fontWeight: highlight ? 'bold' : 'normal' }}>
        {value || '—'}
      </span>
    </div>
  );
}

function Modal({ titlu, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: fundal_modal,
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#252526', border: '1px solid #3c3c3c', borderRadius: '4px',
        padding: '24px', minWidth: '380px', maxWidth: '480px', fontFamily: 'Consolas, monospace',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: roz, margin: 0, fontSize: '14px' }}>{titlu}</h3>
          <button onClick={onClose} style={{ ...btnStyle(gri), padding: '2px 8px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Camp({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', color: gri, fontSize: '11px', marginBottom: '4px', letterSpacing: '0.5px' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', boxSizing: 'border-box',
          backgroundColor: fundal_sectiune, border: '1px solid #3c3c3c',
          color: '#d4d4d4', fontFamily: 'Consolas, monospace', fontSize: '12px',
          padding: '7px 10px', outline: 'none', borderRadius: '2px',
        }}
      />
    </div>
  );
}

function Alerta({ tip, mesaj }) {
  if (!mesaj) return null;
  const culoare = tip === 'eroare' ? '#f44747' : verde;
  return (
    <div style={{
      color: culoare, fontSize: '11px', padding: '8px 10px',
      border: `1px solid ${culoare}`, borderRadius: '2px', marginTop: '12px',
    }}>
      {tip === 'eroare' ? '⚠ ' : '✓ '}{mesaj}
    </div>
  );
}

export default function AngajatProfilPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user }   = useContext(AuthContext);
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare]   = useState(null);

  // stare modals
  const [modalDeschis, setModalDeschis] = useState(null); // 'marire' | 'parola' | 'dezactivare'
 
  // stare formular mărire salariu
  const [marire, setMarire] = useState({ procent: '', motiv: '' });
  const [marireStatus, setMarireStatus] = useState({ tip: null, mesaj: '' });
  const [marireLoading, setMarireLoading] = useState(false);

  // stare formular schimbare parolă
  const [parola, setParola] = useState({ veche: '', noua: '', confirma: '' });
  const [parolaStatus, setParolaStatus] = useState({ tip: null, mesaj: '' });
  const [parolaLoading, setParolaLoading] = useState(false);
 
  // stare dezactivare cont
  const [motivDezactivare, setMotivDezactivare] = useState('');
  const [dezactivareStatus, setDezactivareStatus] = useState({ tip: null, mesaj: '' });
  const [dezactivareLoading, setDezactivareLoading] = useState(false);
 
  const inchideModal = () => {
    setModalDeschis(null);
    setMarire({ procent: '', motiv: '' });
    setMarireStatus({ tip: null, mesaj: '' });
    setParola({ veche: '', noua: '', confirma: '' });
    setParolaStatus({ tip: null, mesaj: '' });
    setMotivDezactivare('');
    setDezactivareStatus({ tip: null, mesaj: '' });
  };

  useEffect(() => {
    api.get(API.ANGAJAT_PROFIL(id))
      .then(res => setProfil(res.data))
      .catch(() => setEroare('Nu s-a putut incarca profilul angajatului.'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── handlers ────────────────────────────────────────────────────────────────
 
  const handleMarireSalariu = async () => {
    const procent = parseFloat(marire.procent);
    if (!procent || procent <= 0 || procent > 100) {
      setMarireStatus({ tip: 'eroare', mesaj: 'Procentul trebuie să fie între 0.01 și 100.' });
      return;
    }
    if (!marire.motiv.trim()) {
      setMarireStatus({ tip: 'eroare', mesaj: 'Motivul este obligatoriu.' });
      return;
    }
    setMarireLoading(true);
    try {
      await api.post(API.MARIRE_SALARIU(id), { procent, motiv: marire.motiv });
      setMarireStatus({ tip: 'succes', mesaj: `Salariul a fost mărit cu ${procent}%.` });
      // reîncarcă profilul ca să apară noul salariu
      const res = await api.get(API.ANGAJAT_PROFIL(id));
      setProfil(res.data);
    } catch (e) {
      const msg = e.response?.data?.mesaj || e.response?.data?.error || 'Eroare la mărirea salariului.';
      setMarireStatus({ tip: 'eroare', mesaj: msg });
    } finally {
      setMarireLoading(false);
    }
  };
 
  const handleSchimbareParola = async () => {
    if (!parola.veche || !parola.noua || !parola.confirma) {
      setParolaStatus({ tip: 'eroare', mesaj: 'Toate câmpurile sunt obligatorii.' });
      return;
    }
    if (parola.noua !== parola.confirma) {
      setParolaStatus({ tip: 'eroare', mesaj: 'Parola nouă nu coincide cu confirmarea.' });
      return;
    }
    if (parola.noua.length < 6) {
      setParolaStatus({ tip: 'eroare', mesaj: 'Parola nouă trebuie să aibă cel puțin 6 caractere.' });
      return;
    }
    setParolaLoading(true);
    try {
      await api.post(API.SCHIMBARE_PAROLA, {
        id_utilizator: user?.id,
        parola_veche: parola.veche,
        parola_noua: parola.noua,
      });
      setParolaStatus({ tip: 'succes', mesaj: 'Parola a fost schimbată cu succes.' });
    } catch (e) {
      const msg = e.response?.data?.mesaj || e.response?.data?.error || 'Eroare la schimbarea parolei.';
      setParolaStatus({ tip: 'eroare', mesaj: msg });
    } finally {
      setParolaLoading(false);
    }
  };
 
  const handleDezactivareCont = async () => {
    if (!motivDezactivare.trim()) {
      setDezactivareStatus({ tip: 'eroare', mesaj: 'Motivul dezactivării este obligatoriu.' });
      return;
    }
    setDezactivareLoading(true);
    try {
      await api.post(API.DEZACTIVARE_CONT, { id_utilizator: parseInt(id), motiv: motivDezactivare });
      setDezactivareStatus({ tip: 'succes', mesaj: 'Contul a fost dezactivat.' });
      // actualizează statusul în profil local
      setProfil(prev => ({ ...prev, status: 'inactiv' }));
      setTimeout(inchideModal, 1500);
    } catch (e) {
      const msg = e.response?.data?.mesaj || e.response?.data?.error || 'Eroare la dezactivarea contului.';
      setDezactivareStatus({ tip: 'eroare', mesaj: msg });
    } finally {
      setDezactivareLoading(false);
    }
  };

  if (loading) return <p style={{ color: '#808080', fontFamily: 'Consolas, monospace' }}>Se incarca...</p>;
  if (eroare)  return <p style={{ color: roz, fontFamily: 'Consolas, monospace' }}>ERROR: {eroare}</p>;
  if (!profil) return null;

  const formatRON  = (v) => v ? `${Number(v).toLocaleString('ro-RO')} RON` : '—';
  const formatData = (d) => d ? new Date(d).toLocaleDateString('ro-RO') : '—';
  const esteActiv  = profil.status === 'activ';

   // roluri care pot face acțiuni sensibile
  const poateMareSalariu   = ['hr_manager', 'director', 'ceo', 'admin'].includes(user?.rol);
  const poateDezactiva     = ['hr_manager', 'director', 'ceo', 'admin'].includes(user?.rol);
  const poateSchimbaParola = true; // oricine își poate schimba propria parolă

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
          {!esteActiv && (
            <span style={{
              display: 'inline-block', marginTop: '6px', padding: '2px 8px',
              border: '1px solid #f44747', color: '#f44747', fontSize: '10px', letterSpacing: '1px',
            }}>
              CONT DEZACTIVAT
            </span>
          )}
        </div>
        {/* butoane acțiuni */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => navigate(`/angajati/${id}/editeaza`)} style={btnStyle('#f39c12')}>
              EDITEAZA
            </button>
            <button onClick={() => navigate('/angajati')} style={btnStyle(gri)}>
              INAPOI
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {poateSchimbaParola && (
              <button onClick={() => setModalDeschis('parola')} style={btnStyle(cyan)}>
                SCHIMBA PAROLA
              </button>
            )}
            {poateMareSalariu && esteActiv && (
              <button onClick={() => setModalDeschis('marire')} style={btnStyle(verde)}>
                MARIRE SALARIU
              </button>
            )}
            {poateDezactiva && esteActiv && (
              <button onClick={() => setModalDeschis('dezactivare')} style={btnStyle('#f44747')}>
                DEZACTIVEAZA CONT
              </button>
            )}
          </div>
        </div>
      </div>

      {/* date personale */}
      <Sectiune titlu=" DATE PERSONALE">
        <InfoRow label="CNP"           value={profil.cnp} />
        <InfoRow label="Email"         value={profil.email} />
        <InfoRow label="Telefon"       value={profil.telefon} />
        <InfoRow label="Data angajare" value={formatData(profil.data_angajare)} />
        <InfoRow label="Status"        value={profil.status?.toUpperCase()} />
      </Sectiune>

      {/* pozitie si salariu */}
      <Sectiune titlu="POZITIE SI SALARIU">
        <InfoRow label="Functie"        value={profil.functie} />
        <InfoRow label="Departament"    value={profil.departament} />
        <InfoRow label="Salariu brut"      value={formatRON(profil.salariu_curent)} />
        <InfoRow
          label="Salariu net estimat"
          value={
            profil.analiza_piata?.salariu_net_calculat
              ? formatRON(profil.analiza_piata.salariu_net_calculat)
              : '—'
          }
          highlight
        />
        <InfoRow label="Grila salariala"
          value={`${formatRON(profil.salariu_min)} — ${formatRON(profil.salariu_max)}`} />
        <InfoRow label="Compa-ratio"    value={profil.analiza_piata?.compa_ratio} />
        <InfoRow label="Pozitie grila"  value={profil.analiza_piata?.pozitie_grila} />
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
                  <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: cyan, fontWeight: 'normal' }}>
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

       {/* ── proiecte active ─────────────────────────────────────────────────── */}
      <Sectiune titlu={`PROIECTE ACTIVE (${profil.proiecte?.length || 0})`}>
        {profil.proiecte?.length === 0 ? (
          <p style={{ color: gri, fontSize: '12px' }}>Nu exista proiecte active.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${roz}` }}>
                {['PROIECT', 'ROL', 'ORE ALOCATE'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: cyan, fontWeight: 'normal' }}>
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

      {/* ── istoric salarial ────────────────────────────────────────────────── */}
      <Sectiune titlu={`ISTORIC SALARIAL (${profil.istoric_salarii?.length || 0})`}>
        {profil.istoric_salarii?.length === 0 ? (
          <p style={{ color: gri, fontSize: '12px' }}>Nu exista modificari salariale.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${roz}` }}>
                {['DATA', 'SALARIU VECHI', 'SALARIU NOU', 'MOTIV'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: cyan, fontWeight: 'normal' }}>
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
                  <td style={{ ...tdStyle, color: gri }}>{s.motiv || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Sectiune>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════════ */}
 
      {/* ── modal mărire salariu ──────────────────────────────────────────── */}
      {modalDeschis === 'marire' && (
        <Modal titlu="MARIRE SALARIU" onClose={inchideModal}>
          <p style={{ color: gri, fontSize: '11px', margin: '0 0 16px' }}>
            Salariu curent: <span style={{ color: cyan }}>{formatRON(profil.salariu_curent)}</span>
          </p>
          <Camp
            label="PROCENT MARIRE (%)"
            type="number"
            value={marire.procent}
            onChange={v => setMarire(prev => ({ ...prev, procent: v }))}
            placeholder="ex: 10"
          />
          {marire.procent && !isNaN(parseFloat(marire.procent)) && (
            <p style={{ color: verde, fontSize: '11px', margin: '-8px 0 12px' }}>
              Salariu nou estimat:{' '}
              {formatRON(profil.salariu_curent * (1 + parseFloat(marire.procent) / 100))}
            </p>
          )}
          <Camp
            label="MOTIV"
            value={marire.motiv}
            onChange={v => setMarire(prev => ({ ...prev, motiv: v }))}
            placeholder="ex: Evaluare anuala excelenta"
          />
          <Alerta tip={marireStatus.tip} mesaj={marireStatus.mesaj} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button onClick={inchideModal} style={btnStyle(gri)} disabled={marireLoading}>
              ANULEAZA
            </button>
            <button
              onClick={handleMarireSalariu}
              style={btnStyle(verde)}
              disabled={marireLoading}
            >
              {marireLoading ? 'SE SALVEAZA...' : 'CONFIRMA MARIREA'}
            </button>
          </div>
        </Modal>
      )}
 
      {/* ── modal schimbare parolă ────────────────────────────────────────── */}
      {modalDeschis === 'parola' && (
        <Modal titlu="SCHIMBARE PAROLA" onClose={inchideModal}>
          <Camp
            label="PAROLA ACTUALA"
            type="password"
            value={parola.veche}
            onChange={v => setParola(prev => ({ ...prev, veche: v }))}
            placeholder="••••••••"
          />
          <Camp
            label="PAROLA NOUA"
            type="password"
            value={parola.noua}
            onChange={v => setParola(prev => ({ ...prev, noua: v }))}
            placeholder="min. 6 caractere"
          />
          <Camp
            label="CONFIRMA PAROLA NOUA"
            type="password"
            value={parola.confirma}
            onChange={v => setParola(prev => ({ ...prev, confirma: v }))}
            placeholder="••••••••"
          />
          <Alerta tip={parolaStatus.tip} mesaj={parolaStatus.mesaj} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button onClick={inchideModal} style={btnStyle(gri)} disabled={parolaLoading}>
              ANULEAZA
            </button>
            <button
              onClick={handleSchimbareParola}
              style={btnStyle(cyan)}
              disabled={parolaLoading}
            >
              {parolaLoading ? 'SE SALVEAZA...' : 'SCHIMBA PAROLA'}
            </button>
          </div>
        </Modal>
      )}
 
      {/* ── modal dezactivare cont ────────────────────────────────────────── */}
      {modalDeschis === 'dezactivare' && (
        <Modal titlu="DEZACTIVARE CONT" onClose={inchideModal}>
          <p style={{ color: '#f44747', fontSize: '11px', margin: '0 0 16px', lineHeight: '1.6' }}>
            Atenție: această acțiune va dezactiva contul angajatului{' '}
            <span style={{ color: '#d4d4d4' }}>{profil.prenume} {profil.nume}</span>.
            Angajatul nu va mai putea să se autentifice.
          </p>
          <Camp
            label="MOTIV DEZACTIVARE"
            value={motivDezactivare}
            onChange={setMotivDezactivare}
            placeholder="ex: Incetarea contractului de munca"
          />
          <Alerta tip={dezactivareStatus.tip} mesaj={dezactivareStatus.mesaj} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button onClick={inchideModal} style={btnStyle(gri)} disabled={dezactivareLoading}>
              ANULEAZA
            </button>
            <button
              onClick={handleDezactivareCont}
              style={btnStyle('#f44747')}
              disabled={dezactivareLoading}
            >
              {dezactivareLoading ? 'SE PROCESEAZA...' : 'DEZACTIVEAZA'}
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}

const tdStyle = {
  padding: '7px 10px',
  color: '#9cdcfe',
  verticalAlign: 'middle',
};

const btnStyle = (culoare) => ({
  backgroundColor: 'transparent',
  color: culoare,
  border: `1px solid ${culoare}`,
  padding: '6px 14px',
  fontFamily: 'Consolas, monospace',
  fontSize: '12px',
  cursor: 'pointer',
  letterSpacing: '0.5px',
});