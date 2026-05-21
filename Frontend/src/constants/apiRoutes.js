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

  // pozitii
  POZITII:            '/pozitii',

  // proiecte
  PROIECTE:           '/proiecte',

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

  AUDIT_LOG: '/audit-log',


  // predictie
  ML_COMPARATIE:   '/ml/comparatie',
  ML_STATISTICI:   '/ml/statistici',
};

export default API;