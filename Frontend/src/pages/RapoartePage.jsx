import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { poateFace } from '../utils/roluri';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function RapoartePage() {
  const { user }    = useAuth();
  const rol         = user?.rol || '';

  const [departamente, setDepartamente] = useState([]);
  const [raport, setRaport]             = useState(null);
  const [idSelectat, setIdSelectat]     = useState('');
  const [istoricConcedii, setIstoric]   = useState([]);
  const [arhivaEvaluari, setArhiva]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [loadingDept, setLoadingDept]   = useState(true);
  const [loadingTab, setLoadingTab]     = useState(false);
  const [eroareTab, setEroareTab]       = useState('');
  const [tabActiv, setTabActiv]         = useState('salarii');

  // incarcam departamentele la mount
  useEffect(() => {
    api.get(API.DEPARTAMENTE)
      .then(res => setDepartamente(res.data))
      .finally(() => setLoadingDept(false));
  }, []);

  // incarcam datele tabului activ doar cand se schimba tabul
  useEffect(() => {
  if (tabActiv === 'salarii') return;
  if (!['hr_manager', 'director', 'ceo'].includes(rol)) return;

  setLoadingTab(true);
  setEroareTab('');

  if (tabActiv === 'concedii') {
    api.get(API.CONCEDII_ISTORIC)
      .then(res => {
        console.log('CONCEDII:', res.data);
        setIstoric(res.data?.date_concedii || []);
      })
      .catch(err => {
        console.log('EROARE CONCEDII:', err.response);
        setEroareTab(err.response?.data?.detalii || 'Eroare la incarcare.');
      })
      .finally(() => setLoadingTab(false));
  }

  if (tabActiv === 'evaluari') {
    api.get(API.EVALUARI_ARHIVA)
      .then(res => {
        console.log('EVALUARI:', res.data);
        setArhiva(res.data?.date_evaluari || []);
      })
      .catch(err => {
        console.log('EROARE EVALUARI:', err.response);
        setEroareTab(err.response?.data?.detalii || 'Eroare la incarcare.');
      })
      .finally(() => setLoadingTab(false));
  }
}, [tabActiv, rol]);

  const handleRaport = async (e) => {
    e.preventDefault();
    if (!idSelectat) return;
    setLoading(true);
    setRaport(null);
    try {
      const res = await api.get(API.DEPARTAMENT_RAPORT(idSelectat));
      setRaport(res.data);
    } catch {
      setRaport({ eroare: 'Nu s-a putut genera raportul.' });
    } finally {
      setLoading(false);
    }
  };

  const formatRON = (v) => v ? `${Number(v).toLocaleString('ro-RO')} RON` : '—';

  const taburi = [
    { id: 'salarii',  label: 'RAPORT SALARII',   vizibil: poateFace(rol, 'salarii') },
    { id: 'concedii', label: 'ISTORIC CONCEDII',  vizibil: ['hr_manager', 'director', 'ceo'].includes(rol) },
    { id: 'evaluari', label: 'ARHIVA EVALUARI',   vizibil: ['hr_manager', 'director', 'ceo'].includes(rol) },
  ].filter(t => t.vizibil);

  const TabelGeneric = ({ date }) => {
    if (!date || date.length === 0) return null;
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${roz}` }}>
              {Object.keys(date[0]).map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '8px 12px',
                  color: cyan, fontWeight: 'normal', whiteSpace: 'nowrap',
                }}>
                  {h.toUpperCase().replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {date.map((row, idx) => (
              <tr key={idx} style={{
                backgroundColor: idx % 2 === 0 ? '#1e1e1e' : '#252526',
                borderBottom: '1px solid #2d2d2d',
              }}>
                {Object.values(row).map((val, i) => (
                  <td key={i} style={{
                    padding: '9px 12px', color: '#9cdcfe',
                    verticalAlign: 'middle', whiteSpace: 'nowrap',
                  }}>
                    {val ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: 'Consolas, monospace', maxWidth: '1000px' }}>

      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> RAPOARTE
        </h2>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          Rapoarte si analize HR
        </p>
      </div>

      {/* taburi */}
      {taburi.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {taburi.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setTabActiv(tab.id); setEroareTab(''); }}
              style={{
                backgroundColor: tabActiv === tab.id ? '#2a2d2e' : 'transparent',
                color: tabActiv === tab.id ? roz : '#555',
                border: `1px solid ${tabActiv === tab.id ? roz : '#555'}`,
                padding: '8px 16px',
                fontFamily: 'Consolas, monospace',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* tab salarii */}
      {tabActiv === 'salarii' && (
        <>
          <div style={{
            backgroundColor: '#252526', border: '1px solid #333',
            borderLeft: `3px solid ${cyan}`, padding: '24px',
            marginBottom: '28px', borderRadius: '2px',
          }}>
            <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 16px' }}>
              RAPORT SALARII DEPARTAMENT
            </h3>
            <form onSubmit={handleRaport} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ color: cyan, fontSize: '11px' }}>SELECTEAZA DEPARTAMENT:</label>
                <select
                  value={idSelectat}
                  onChange={e => setIdSelectat(e.target.value)}
                  required
                  style={selectStyle}
                >
                  <option value="">-- selecteaza --</option>
                  {departamente.map(d => (
                    <option key={d.id_departament} value={d.id_departament}>
                      {d.locatie} — {d.nume}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={loading || loadingDept} style={{
                backgroundColor: 'transparent',
                color: loading ? '#555' : roz,
                border: `2px solid ${loading ? '#555' : roz}`,
                padding: '9px 20px', fontFamily: 'Consolas, monospace',
                fontSize: '12px', cursor: loading ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}>
                {loading ? 'Se genereaza...' : 'GENEREAZA RAPORT'}
              </button>
            </form>
          </div>

          {raport?.eroare && (
            <p style={{ color: roz, fontSize: '12px' }}>ERROR: {raport.eroare}</p>
          )}

          {raport?.date_raport && raport.date_raport.length > 0 && (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                  { label: 'TOTAL ANGAJATI', value: raport.date_raport.length },
                  {
                    label: 'SALARIU MEDIU',
                    value: `${Number(
                      raport.date_raport.reduce((s, r) => s + Number(r.salariu_curent || 0), 0) /
                      raport.date_raport.length
                    ).toLocaleString('ro-RO')} RON`
                  },
                  {
                    label: 'BUGET TOTAL',
                    value: `${Number(
                      raport.date_raport.reduce((s, r) => s + Number(r.salariu_curent || 0), 0)
                    ).toLocaleString('ro-RO')} RON`
                  },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    backgroundColor: '#252526', border: '1px solid #333',
                    borderLeft: `3px solid ${roz}`, padding: '14px 20px',
                    borderRadius: '2px', flex: 1, minWidth: '180px',
                  }}>
                    <div style={{ color: '#808080', fontSize: '10px', marginBottom: '6px' }}>{label}</div>
                    <div style={{ color: cyan, fontSize: '20px', fontWeight: 'bold' }}>{value}</div>
                  </div>
                ))}
              </div>
              <TabelGeneric date={raport.date_raport} />
            </>
          )}

          {raport?.date_raport && raport.date_raport.length === 0 && (
            <p style={{ color: '#808080', fontSize: '12px' }}>
              Nu exista angajati in acest departament.
            </p>
          )}
        </>
      )}

      {/* tab concedii */}
      {tabActiv === 'concedii' && (
        <div>
          <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 16px' }}>
            ISTORIC COMPLET CONCEDII ({istoricConcedii.length})
          </h3>
          {loadingTab && <p style={{ color: '#808080' }}>Se incarca...</p>}
          {eroareTab && <p style={{ color: roz, fontSize: '12px' }}>ERROR: {eroareTab}</p>}
          {!loadingTab && !eroareTab && istoricConcedii.length === 0 && (
            <p style={{ color: '#808080' }}>Nu exista date.</p>
          )}
          {!loadingTab && <TabelGeneric date={istoricConcedii} />}
        </div>
      )}

      {/* tab evaluari */}
      {tabActiv === 'evaluari' && (
        <div>
          <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 16px' }}>
            ARHIVA EVALUARI ({arhivaEvaluari.length})
          </h3>
          {loadingTab && <p style={{ color: '#808080' }}>Se incarca...</p>}
          {eroareTab && <p style={{ color: roz, fontSize: '12px' }}>ERROR: {eroareTab}</p>}
          {!loadingTab && !eroareTab && arhivaEvaluari.length === 0 && (
            <p style={{ color: '#808080' }}>Nu exista date.</p>
          )}
          {!loadingTab && <TabelGeneric date={arhivaEvaluari} />}
        </div>
      )}
    </div>
  );
}

const selectStyle = {
  backgroundColor: '#3c3c3c', color: 'white',
  border: '1px solid #555', padding: '8px 12px',
  fontFamily: 'Consolas, monospace', fontSize: '13px',
  outline: 'none', width: '100%',
};