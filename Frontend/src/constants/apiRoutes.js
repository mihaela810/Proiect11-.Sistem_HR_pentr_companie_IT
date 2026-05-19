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

  // actiuni pe angajat (proceduri stocate)
  MARIRE_SALARIU:     (id) => `/angajati/${id}/marire-salariu`,
  DEZACTIVARE_CONT:   '/dezactivare-cont',
  SCHIMBARE_PAROLA:   '/schimbare-parola',

  // concedii
  CONCEDII:           '/concedii',
  CONCEDIU_DECIZIE:   (id) => `/concedii/decizie/${id}`,

  // evaluari
  EVALUARI:           '/evaluari',

  // departamente
  DEPARTAMENTE:       '/departamente',

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

  // predictie
  ML_COMPARATIE:   '/ml/comparatie',
  ML_STATISTICI:   '/ml/statistici',
};

export default API;