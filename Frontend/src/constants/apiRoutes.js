const API = {
  // autentificare
  LOGIN:              '/login',

  // angajati
  ANGAJATI:           '/angajati',
  ANGAJAT_PROFIL:     (id) => `/angajati/profil/${id}`,
  ANGAJAT_UPDATE:     (id) => `/angajati/${id}`,
  ANGAJAT_DELETE:     (id) => `/angajati/${id}`,
  ANGAJATI_CAUTA:     '/angajati/cauta',
  ANGAJATI_ARHIVA:    '/angajati/arhiva',
  ANGAJAT_MARIRE:           '/angajati/marire',
  ANGAJAT_DEZACTIVARE:      '/angajati/dezactivare',
  ANGAJAT_SCHIMBARE_PAROLA: '/angajati/schimbare-parola',
  ANGAJATI_FILTRARE:        '/angajati/filtrare',


  // actiuni pe angajat (proceduri stocate)
  MARIRE_SALARIU:     (id) => `/angajati/${id}/marire-salariu`,
  DEZACTIVARE_CONT:   '/dezactivare-cont',
  SCHIMBARE_PAROLA:   '/schimbare-parola',

  // concedii
  CONCEDII:           '/concedii',
  CONCEDIU_DECIZIE:   (id) => `/concedii/decizie/${id}`,
  CONCEDII_ISTORIC:     '/angajati/istoric-concedii',

  // evaluari
  EVALUARI:           '/evaluari',
  EVALUARI_ARHIVA:      '/management/arhiva-evaluari',

  // departamente
  DEPARTAMENTE:       '/departamente',
  DEPARTAMENT_RAPORT:       (id) => `/statistici/departament/${id}`,
  DEPARTAMENT_DETALII: (id) => `/departamente/${id}`,

  // pozitii
  POZITII:            '/pozitii',

  // proiecte
  PROIECTE:           '/proiecte',
  PROIECT_DETALII: (id) => `/detalii-proiecte/${id}`,

  // beneficii
  BENEFICII:          '/beneficii',

  // statistici
  STATISTICI:         '/statistici',

   // rapoarte (proceduri stocate)
  RAPORT_SALARII:     '/raport-salarii-departament',
  SUBORDONATI:        '/subordonati-manageri',

  VIEW_HR:              '/hr/angajati-view',
  VIEW_PROIECTE:        '/proiecte/angajati-view',
  VIEW_SUBORDONATI:     '/manageri/subordonati-view',
  VIEW_TEAM_LEADER:         '/team-leader/angajati-view',

    // profil personal (JWT)
  MEU_EVALUARI:             '/evaluari',
  MEU_MANAGER:              '/manageri',
  MEU_ISTORIC_SALARIAL:     '/istoric-salarial',
  MEU_NOTIFICARI:           '/notificari',
  MEU_EVALUARI_FACUTE: '/api/evaluari',

  AUDIT_LOG: '/audit-log',

  PROFIL_MEU_UPDATE: '/angajati/profil-meu',

  // Director
  DIRECTOR_INFO:          '/api/director/info',
  DIRECTOR_ANGAJATI:      '/api/director/angajati',
  DIRECTOR_DEPARTAMENTE:  '/api/director/departamente',
  DIRECTOR_PROIECTE:      '/api/director/proiecte',
  DIRECTOR_ARHIVA:        '/api/director/arhiva',

// HR Specialist
  HR_DEPARTAMENTE:        '/api/hr/departamente',

  // predictie
  ML_COMPARATIE:   '/ml/comparatie',
  ML_STATISTICI:   '/ml/statistici',
};

export default API;