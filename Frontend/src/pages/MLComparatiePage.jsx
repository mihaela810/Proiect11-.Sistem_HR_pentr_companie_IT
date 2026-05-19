import { useState, useEffect } from 'react';
import api from '../api/axios';
import API from '../constants/apiRoutes';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

const culoriModele = {
  'Random Forest':       '#3498db',
  'Logistic Regression': '#e67e22',
  'XGBoost':             '#e74c3c',
};

const culoriRisc = {
  'Mare':  '#e74c3c',
  'Mediu': '#f39c12',
  'Mic':   '#6a9955',
};

export default function MLComparatiePage() {
  const [statistici, setStatistici] = useState(null);
  const [topRisc, setTopRisc]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [eroare, setEroare]         = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(API.ML_STATISTICI),
      api.get(API.ML_COMPARATIE),
    ])
      .then(([resStats, resDate]) => {
        setStatistici(resStats.data);
        setTopRisc(resDate.data.date?.slice(0, 15) || []);
      })
      .catch(() => setEroare('Nu s-au putut incarca datele ML. Verifica daca notebook-urile au fost rulate.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#808080', fontFamily: 'Consolas, monospace' }}>Se incarca...</p>;
  if (eroare)  return <p style={{ color: roz, fontFamily: 'Consolas, monospace' }}>ERROR: {eroare}</p>;

  const distributie = statistici?.distributie || [];

  return (
    <div style={{ fontFamily: 'Consolas, monospace', maxWidth: '1100px' }}>

      {/* header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
          <span style={{ color: cyan }}>{'>'}</span> ML COMPARATIE
        </h2>
        <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
          Comparatie predictii churn — Random Forest vs Logistic Regression vs XGBoost
        </p>
      </div>

      {/* card consens */}
      <div style={{
        backgroundColor: '#252526',
        border: `1px solid ${roz}`,
        borderLeft: `4px solid ${roz}`,
        padding: '16px 24px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
      }}>
        <div>
          <div style={{ color: '#808080', fontSize: '11px', marginBottom: '4px' }}>
            ANGAJATI CU RISC MARE — CONFIRMAT DE TOATE 3 MODELELE
          </div>
          <div style={{ color: roz, fontSize: '36px', fontWeight: 'bold' }}>
            {statistici?.consens_mare}
          </div>
        </div>
        <div style={{ color: '#555', fontSize: '12px', borderLeft: '1px solid #333', paddingLeft: '24px' }}>
          Acestia sunt angajatii cu<br />
          prioritate maxima pentru HR.<br />
          <span style={{ color: '#6a9955' }}>Toti 3 algoritmii ii marcheaza ca risc.</span>
        </div>
      </div>

      {/* tabel distributie risc */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 16px' }}>
          DISTRIBUTIA RISCULUI PER MODEL
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${roz}` }}>
              {['MODEL', 'RISC MARE', 'RISC MEDIU', 'RISC MIC', 'TOTAL', '% MARE'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '8px 14px',
                  color: cyan, fontWeight: 'normal', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {distributie.map((row, idx) => (
              <tr key={idx} style={{
                backgroundColor: idx % 2 === 0 ? '#1e1e1e' : '#252526',
                borderBottom: '1px solid #2d2d2d',
              }}>
                <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                  <span style={{
                    color: culoriModele[row.model],
                    fontWeight: 'bold',
                    fontSize: '12px',
                  }}>
                    {row.model}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', color: culoriRisc['Mare'], fontWeight: 'bold' }}>
                  {row.mare}
                </td>
                <td style={{ padding: '10px 14px', color: culoriRisc['Mediu'] }}>
                  {row.mediu}
                </td>
                <td style={{ padding: '10px 14px', color: culoriRisc['Mic'] }}>
                  {row.mic}
                </td>
                <td style={{ padding: '10px 14px', color: '#9cdcfe' }}>
                  {row.total}
                </td>
                <td style={{ padding: '10px 14px', color: roz, fontWeight: 'bold' }}>
                  {row.total ? `${((row.mare / row.total) * 100).toFixed(1)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* bara vizuala distributie */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 16px' }}>
          VIZUALIZARE DISTRIBUTIE
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {distributie.map((row, idx) => {
            const total = row.total || 1;
            return (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: culoriModele[row.model], fontSize: '11px', fontWeight: 'bold' }}>
                    {row.model}
                  </span>
                  <span style={{ color: '#555', fontSize: '10px' }}>{row.total} angajati</span>
                </div>
                <div style={{ display: 'flex', height: '20px', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(row.mare / total) * 100}%`,
                    backgroundColor: culoriRisc['Mare'],
                    transition: 'width 0.3s',
                  }} title={`Mare: ${row.mare}`} />
                  <div style={{
                    width: `${(row.mediu / total) * 100}%`,
                    backgroundColor: culoriRisc['Mediu'],
                  }} title={`Mediu: ${row.mediu}`} />
                  <div style={{
                    width: `${(row.mic / total) * 100}%`,
                    backgroundColor: culoriRisc['Mic'],
                  }} title={`Mic: ${row.mic}`} />
                </div>
              </div>
            );
          })}
        </div>
        {/* legenda */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
          {['Mare', 'Mediu', 'Mic'].map(nivel => (
            <div key={nivel} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: culoriRisc[nivel], borderRadius: '2px' }} />
              <span style={{ color: '#808080', fontSize: '11px' }}>Risc {nivel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* top 15 angajati risc mare */}
      <div>
        <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 16px' }}>
          TOP 15 ANGAJATI — RISC MARE DUPA RANDOM FOREST
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${roz}` }}>
                {['ID', 'DEPARTAMENT', 'POZITIE', 'PROB RF', 'PROB LR', 'PROB XGB', 'RISC RF', 'RISC LR', 'RISC XGB'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '7px 10px',
                    color: cyan, fontWeight: 'normal', whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topRisc.map((a, idx) => (
                <tr key={a.id_angajat} style={{
                  backgroundColor: idx % 2 === 0 ? '#1e1e1e' : '#252526',
                  borderBottom: '1px solid #2d2d2d',
                }}>
                  <td style={tdStyle}>{a.id_angajat}</td>
                  <td style={tdStyle}>{a.departament}</td>
                  <td style={tdStyle}>{a.nivel_pozitie}</td>
                  <td style={{ ...tdStyle, color: culoriModele['Random Forest'], fontWeight: 'bold' }}>
                    {(Number(a.prob_rf) * 100).toFixed(1)}%
                  </td>
                  <td style={{ ...tdStyle, color: culoriModele['Logistic Regression'] }}>
                    {(Number(a.prob_lr) * 100).toFixed(1)}%
                  </td>
                  <td style={{ ...tdStyle, color: culoriModele['XGBoost'] }}>
                    {(Number(a.prob_xgb) * 100).toFixed(1)}%
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: culoriRisc[a.risc_rf], border: `1px solid ${culoriRisc[a.risc_rf]}`, padding: '1px 6px', fontSize: '10px' }}>
                      {a.risc_rf}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: culoriRisc[a.risc_lr], border: `1px solid ${culoriRisc[a.risc_lr]}`, padding: '1px 6px', fontSize: '10px' }}>
                      {a.risc_lr}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: culoriRisc[a.risc_xgb], border: `1px solid ${culoriRisc[a.risc_xgb]}`, padding: '1px 6px', fontSize: '10px' }}>
                      {a.risc_xgb}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

const tdStyle = {
  padding: '7px 10px',
  color: '#9cdcfe',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};