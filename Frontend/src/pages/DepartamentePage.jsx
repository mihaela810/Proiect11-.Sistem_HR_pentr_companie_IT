import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import API from '../constants/apiRoutes';
import { useNavigate } from 'react-router-dom';

const roz  = '#ff22a1';
const cyan = '#4ec9b0';

export default function DepartamentePage() {
  const { user }  = useAuth();
  const rol       = user?.rol || '';
  const navigate  = useNavigate();

  const [departamente, setDepartamente] = useState([]);
  const [orasDirector, setOrasDirector] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [erori, setErori]               = useState([]);
  const [succes, setSucces]             = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm] = useState({ nume: '', descriere: '', locatie: '' });

  const poateAdauga = !['hr_specialist', 'director', 'app_readonly', 'project_manager'].includes(rol);
  const poateCreea = ['hr_manager', 'ceo'].includes(rol);

  useEffect(() => { 
    if (rol) {
      incarcaDepartamente(); 
    }
  }, [rol]);

  const incarcaDepartamente = async () => {
    setLoading(true);
    setErori([]);

    try {
      if (rol === 'director') {
        const [depRes, profRes] = await Promise.all([
          api.get(API.DIRECTOR_DEPARTAMENTE).catch(() => ({ data: [] })),
          api.get('/utilizatori/profil-meu').catch(() => ({ data: null }))
        ]);
        setDepartamente(depRes.data.date || depRes.data || []);
        if (profRes.data?.oras) setOrasDirector(profRes.data.oras);
        setLoading(false);
      } 
      else if (rol === 'project_manager') {
        // 1. Preluăm toate departamentele globale ca bază de date
        const toateDepRes = await api.get(API.DEPARTAMENTE);
        const toateDepartamente = toateDepRes.data || [];

        // 2. Preluăm profilul PM-ului pentru a afla departamentul lui direct
        const profilRes = await api.get('/utilizatori/profil-meu').catch(() => null);
        const idDepMeu = profilRes?.data?.id_departament;

        // 3. Preluăm membrii din proiectele alocate lui
        const echipaRes = await api.get(API.VIEW_TEAM_LEADER).catch(() => ({ data: [] }));
        const dateEchipa = echipaRes.data.date_echipa || echipaRes.data || [];

        // 4. Colectăm ID-urile unice ale departamentelor (cel propriu + cele ale echipei)
        const idUriDepartamenteUman = new Set();
        if (idDepMeu) idUriDepartamenteUman.add(Number(idDepMeu));
        
        dateEchipa.forEach(membru => {
          if (membru.id_departament) {
            idUriDepartamenteUman.add(Number(membru.id_departament));
          }
        });

        // 5. Filtrăm lista completă ca să reținem doar departamentele relevante
        const departamenteFiltrate = toateDepartamente.filter(dep => 
          idUriDepartamenteUman.has(Number(dep.id_departament))
        );

        setDepartamente(departamenteFiltrate);
        setLoading(false);
      } 
      else {
        // Pentru CEO, HR Manager, etc. - încarcă totul
        const res = await api.get(API.DEPARTAMENTE);
        setDepartamente(res.data || []);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setErori(['Nu s-au putut incarca departamentele.']);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErori([]);
    setSucces('');

    api.post(API.DEPARTAMENTE, form)
      .then(() => {
        setSucces('Departamentul a fost creat cu succes!');
        setForm({ nume: '', descriere: '', locatie: '' });
        setShowForm(false);
        incarcaDepartamente();
      })
      .catch(err => {
        setErori([err.response?.data?.detalii || 'Eroare la salvare.']);
      });
  };

  return (
    <div style={{ fontFamily: 'Consolas, monospace' }}>
      
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ color: roz, margin: 0, fontSize: '18px' }}>
            <span style={{ color: cyan }}>{'>'}</span> DEPARTAMENTE
          </h2>
          <p style={{ color: '#6a9955', fontSize: '12px', margin: '6px 0 0' }}>
            {rol === 'project_manager' 
              ? `Afișate: ${departamente.length} departamente (asociate proiectelor tale și cel propriu)`
              : rol === 'director' && orasDirector
                ? `Filtrare automata pentru locatia: ${orasDirector.toUpperCase()}`
                : 'Managementul structurii organizatorice'
            }
          </p>
        </div>

        {poateCreea && (
          <button onClick={() => { setShowForm(!showForm); setErori([]); }} style={btnStyle(showForm ? '#808080' : roz)}>
            {showForm ? 'ANULEAZA' : '+ DEPARTAMENT NOU'}
          </button>
        )}
      </div>

      {/* erori si succes */}
      {erori.length > 0 && (
        <div style={{ backgroundColor: '#2d1a1a', border: `1px solid ${roz}`, padding: '12px 16px', marginBottom: '20px' }}>
          {erori.map((e, i) => <p key={i} style={{ color: roz, margin: '2px 0', fontSize: '12px' }}>ERROR: {e}</p>)}
        </div>
      )}
      {succes && (
        <div style={{ backgroundColor: '#1a2d1a', border: '1px solid #6a9955', padding: '12px 16px', marginBottom: '20px' }}>
          <p style={{ color: '#6a9955', margin: 0, fontSize: '12px' }}>✓ {succes}</p>
        </div>
      )}

      {/* formular adaugare */}
      {showForm && poateCreea && (
        <div style={{
          backgroundColor: '#252526', border: '1px solid #333',
          borderLeft: `3px solid ${roz}`, padding: '24px',
          marginBottom: '28px', borderRadius: '2px'
        }}>
          <h3 style={{ color: cyan, fontSize: '13px', margin: '0 0 20px' }}>CREARE DEPARTAMENT NOU</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
            <Camp label="NUME DEPARTAMENT" name="nume" value={form.nume} onChange={handleChange} required />
            <Camp label="LOCATIE / ORAS" name="locatie" value={form.locatie} onChange={handleChange} required />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: cyan, fontSize: '11px' }}>DESCRIERE:</label>
              <textarea name="descriere" value={form.descriere} onChange={handleChange} rows="3" style={textareaStyle}></textarea>
            </div>

            <button type="submit" style={{ ...btnStyle(roz), alignSelf: 'flex-start', padding: '10px 24px', border: `2px solid ${roz}` }}>
              SALVEAZA DEPARTAMENT
            </button>
          </form>
        </div>
      )}

      {/* starea de incarcare */}
      {loading && <p style={{ color: '#808080' }}>Se incarca departamentele...</p>}

      {/* grila carduri departamente */}
      {!loading && departamente.length === 0 && (
        <p style={{ color: '#808080' }}>Nu au fost gasite departamente accesibile contului dvs.</p>
      )}

      {!loading && departamente.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {departamente.map(d => (
            <div key={d.id_departament} style={{
              backgroundColor: '#252526', border: '1px solid #333',
              borderTop: `2px solid ${cyan}`, padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ color: 'white', margin: 0, fontSize: '15px', letterSpacing: '0.5px' }}>
                  {d.nume}
                </h4>
                <span style={{ color: '#808080', fontSize: '10px' }}>ID: {d.id_departament}</span>
              </div>
              
              {d.locatie && (
                <div style={{ color: '#d4d4d4', fontSize: '12px', display: 'flex', gap: '6px' }}>
                  📍 {d.locatie}
                </div>
              )}
              {d.nr_angajati !== undefined && (
                <div style={{ color: '#6a9955', fontSize: '11px' }}>
                  👥 {d.nr_angajati} angajati activi
                </div>
              )}
              {d.descriere && (
                <p style={{ color: '#808080', fontSize: '12px', margin: 0 }}>{d.descriere}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Camp({ label, name, value, onChange, required }) {
  const cyan = '#4ec9b0';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ color: cyan, fontSize: '11px' }}>
        {label}{required && <span style={{ color: '#ff22a1' }}> *</span>}
      </label>
      <input name={name} value={value} onChange={onChange}
        required={required} style={inputStyle} />
    </div>
  );
}

const btnStyle = (culoare) => ({
  backgroundColor: 'transparent', color: culoare,
  border: `1px solid ${culoare}`, padding: '8px 16px',
  fontFamily: 'Consolas, monospace', fontSize: '12px',
  cursor: 'pointer', letterSpacing: '0.5px', whiteSpace: 'nowrap',
});

const inputStyle = {
  backgroundColor: '#3c3c3c', color: 'white', border: '1px solid #555',
  padding: '8px 12px', fontFamily: 'Consolas, monospace', fontSize: '13px',
  outline: 'none', width: '100%', boxSizing: 'border-box'
};

const textareaStyle = {
  backgroundColor: '#3c3c3c', color: 'white', border: '1px solid #555',
  padding: '8px 12px', fontFamily: 'Consolas, monospace', fontSize: '13px',
  outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical'
};