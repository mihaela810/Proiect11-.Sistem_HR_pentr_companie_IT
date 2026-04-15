#  Sistem HR pentru Companie IT

## Cuprins

1. [Descrierea Aplicației](#descrierea-aplicației)
2. [Funcționalități](#funcționalități)
3. [Structura Bazei de Date](#structura-bazei-de-date)
4. [Concepte de Baze de Date Acoperite](#concepte-de-baze-de-date-acoperite)
5. [Extensie Avansată / AI](#extensie-avansată--ai)
6. [Tehnologii Folosite](#tehnologii-folosite)
7. [Arhitectura Aplicației](#arhitectura-aplicației)
8. [Instalare și Configurare](#instalare-și-configurare)

---

## Descrierea Aplicației

Sistemul HR este o aplicație web dezvoltată pentru gestionarea completă a resurselor umane într-o companie de software (similară Endava). Aplicația permite administrarea angajaților, departamentelor, proiectelor, evaluărilor de performanță, istoricului salarial, concediilor și beneficiilor.
Scopul principal este centralizarea tuturor informațiilor legate de resursele umane într-o singură platformă, oferind vizibilitate completă asupra structurii organizaționale, alocării resurselor pe proiecte și evoluției profesionale a angajaților.

---

## Funcționalități

### 1. Gestiunea Angajaților
- Adăugarea, editarea și dezactivarea angajaților
- Vizualizarea profilului complet al fiecărui angajat (date personale, departament, poziție, manager direct)
- Vizualizarea ierarhiei organizaționale (arbore manager → subordonați)
- Filtrare și căutare avansată după departament, poziție, proiect sau status

### 2. Gestiunea Departamentelor
- Crearea și administrarea departamentelor (Engineering, QA, DevOps, HR, Finance etc.)
- Atribuirea unui manager de departament
- Vizualizarea numărului de angajați per departament
- Statistici per departament (buget salarial, număr proiecte active)

### 3. Gestiunea Pozițiilor
- Definirea pozițiilor disponibile în companie (Junior Developer, Senior Developer, Team Lead, Project Manager etc.)
- Asocierea unui interval salarial minim-maxim pentru fiecare poziție
- Urmărirea evoluției în carieră a angajaților prin schimbarea pozițiilor

### 4. Gestiunea Proiectelor
- Crearea și administrarea proiectelor companiei
- Definirea datelor de început, sfârșit estimat și status (activ, finalizat, în pauză)
- Atribuirea unui Project Manager pentru fiecare proiect
- Vizualizarea bugetului și a echipei alocate

### 5. Alocări pe Proiecte (Relație M:N cu Atribute)
- Alocarea angajaților pe unul sau mai multe proiecte simultan
- Specificarea rolului pe proiect (backend developer, frontend developer, tester, architect etc.)
- Definirea procentului de alocare (ex. 50% pe Proiect A, 50% pe Proiect B)
- Înregistrarea datei de început și sfârșit a alocării
- Vizualizarea disponibilității fiecărui angajat (cât % este alocat)

### 6. Evaluări de Performanță
- Crearea evaluărilor periodice (trimestriale / anuale)
- Sistem de notare pe criterii multiple: competențe tehnice, soft skills, productivitate, leadership
- Scor general calculat automat (medie ponderată)
- Adăugarea de comentarii și obiective pentru următoarea perioadă
- Istoricul complet al evaluărilor per angajat

### 7. Istoric Salarial
- Înregistrarea automată a fiecărei modificări salariale
- Vizualizarea evoluției salariale în timp (grafic)
- Calcul salarial prin proceduri stocate (salariu brut → salariu net, cu aplicarea taxelor: CAS, CASS, impozit pe venit)
- Comparație salarială pe departament și poziție

### 8. Gestiunea Concediilor
- Solicitarea concediilor de către angajați 
- Flux de aprobare: angajat → manager → HR
- Calculul automat al zilelor rămase disponibile
- Notificări automate prin triggere la aprobarea/respingerea cererii
- Calendar vizual cu concediile echipei

### 9. Gestiunea Beneficiilor
- Definirea beneficiilor disponibile
- Atribuirea beneficiilor pe angajat
- Vizualizarea costului total al beneficiilor per angajat și per departament

---

## Funcționalități

### 1. Gestiunea Angajaților
- Adăugarea, editarea și dezactivarea angajaților
- Vizualizarea profilului complet al fiecărui angajat (date personale, departament, poziție, manager direct)
- Vizualizarea ierarhiei organizaționale (arbore manager → subordonați)
- Filtrare și căutare avansată după departament, poziție, proiect sau status

### 2. Gestiunea Departamentelor
- Crearea și administrarea departamentelor (Engineering, QA, DevOps, HR, Finance etc.)
- Atribuirea unui manager de departament
- Vizualizarea numărului de angajați per departament
- Statistici per departament (buget salarial, număr proiecte active)

### 3. Gestiunea Pozițiilor
- Definirea pozițiilor disponibile în companie (Junior Developer, Senior Developer, Team Lead, Project Manager etc.)
- Asocierea unui interval salarial minim-maxim pentru fiecare poziție
- Urmărirea evoluției în carieră a angajaților prin schimbarea pozițiilor

### 4. Gestiunea Proiectelor
- Crearea și administrarea proiectelor companiei
- Definirea datelor de început, sfârșit estimat și status (activ, finalizat, în pauză)
- Atribuirea unui Project Manager pentru fiecare proiect
- Vizualizarea bugetului și a echipei alocate

### 5. Alocări pe Proiecte (Relație M:N cu Atribute)
- Alocarea angajaților pe unul sau mai multe proiecte simultan
- Specificarea rolului pe proiect (backend developer, frontend developer, tester, architect etc.)
- Definirea procentului de alocare (ex. 50% pe Proiect A, 50% pe Proiect B)
- Înregistrarea datei de început și sfârșit a alocării
- Vizualizarea disponibilității fiecărui angajat (cât % este alocat)

### 6. Evaluări de Performanță
- Crearea evaluărilor periodice (trimestriale / anuale)
- Sistem de notare pe criterii multiple: competențe tehnice, soft skills, productivitate, leadership
- Scor general calculat automat (medie ponderată)
- Adăugarea de comentarii și obiective pentru următoarea perioadă
- Istoricul complet al evaluărilor per angajat

### 7. Istoric Salarial
- Înregistrarea automată a fiecărei modificări salariale
- Vizualizarea evoluției salariale în timp (grafic)
- Calcul salarial prin proceduri stocate (salariu brut → salariu net, cu aplicarea taxelor: CAS, CASS, impozit pe venit)
- Comparație salarială pe departament și poziție

### 8. Gestiunea Concediilor
- Solicitarea concediilor de către angajați (concediu de odihnă, medical, special)
- Flux de aprobare: angajat → manager → HR
- Calculul automat al zilelor rămase disponibile
- Notificări automate prin triggere la aprobarea/respingerea cererii
- Calendar vizual cu concediile echipei

### 9. Gestiunea Beneficiilor
- Definirea beneficiilor disponibile (tichete de masă, asigurare medicală privată, abonament sport, zile extra de concediu, training budget)
- Atribuirea beneficiilor pe angajat
- Vizualizarea costului total al beneficiilor per angajat și per departament

---
## Tehnologii Folosite

### Backend: Python (Flask)

**Ce este:** Python este un limbaj de programare de nivel înalt, cunoscut pentru sintaxa sa clară și lizibilă. Flask este un micro-framework web pentru Python, ideal pentru construirea de API-uri REST.

**De ce l-am ales:**
- **Ușor de învățat și utilizat** — sintaxă curată, documentație excelentă
- **Ecosistem bogat pentru ML/AI** — biblioteci precum scikit-learn, pandas, numpy sunt esențiale pentru modulul de predicție a churn-ului
- **Flask este minimalist** — oferă doar ce este necesar, fără convenționalisme forțate, permițând control total asupra arhitecturii
- **Conexiune nativă cu MySQL** — prin biblioteca `mysql-connector-python` sau `PyMySQL`

**Ce face în proiect:**
- Expune API-uri REST pentru toate operațiunile CRUD (Create, Read, Update, Delete) pe fiecare entitate
- Gestionează logica de business (validări, calcule, reguli de aprobare concedii)
- Rulează modelul de predicție AI pentru calculul riscului de plecare
- Servește datele către frontend sub formă de JSON

**Biblioteci Python utilizate:**
| Bibliotecă | Scop |
|------------|------|
| `Flask` | Framework web pentru API-uri REST |
| `Flask-CORS` | Permite comunicarea cross-origin cu frontend-ul |
| `mysql-connector-python` | Conexiunea la baza de date MySQL |
| `scikit-learn` | Antrenarea modelului de predicție churn |
| `pandas` | Manipularea și analiza datelor |
| `numpy` | Calcule numerice |

---
## Arhitectura Aplicației

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│              React + Tailwind CSS                   │
│                                                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────────────┐  │
│  │ Dashboard │ │ Angajați  │ │ Proiecte/Evaluări │  │
│  └───────────┘ └───────────┘ └───────────────────┘  │
│                      │                              │
│              HTTP (REST API)                        │
└──────────────────────┼──────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────┐
│                    BACKEND                          │
│                Python (Flask)                       │
│                                                     │
│  ┌──────────┐ ┌──────────────┐ ┌────────────────┐  │
│  │ API REST │ │ Business     │ │ Modul AI       │  │
│  │ Endpoints│ │ Logic        │ │ (Predicție     │  │
│  │          │ │              │ │  Churn)        │  │
│  └──────────┘ └──────────────┘ └────────────────┘  │
│                      │                              │
│             mysql-connector-python                  │
└──────────────────────┼──────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────┐
│                 BAZA DE DATE                        │
│                    MySQL                            │
│                                                     │
│  ┌──────────┐ ┌──────────────┐ ┌────────────────┐  │
│  │ Tabele   │ │ Proceduri    │ │ Triggere       │  │
│  │ (11)     │ │ Stocate      │ │                │  │
│  └──────────┘ └──────────────┘ └────────────────┘  │
│  ┌──────────┐ ┌──────────────┐                      │
│  │ Views    │ │ Indecși      │                      │
│  └──────────┘ └──────────────┘                      │
└─────────────────────────────────────────────────────┘
```



## Structura Bazei de Date

### Diagrama Tabelelor

Baza de date conține **11 tabele**, cu relații bine definite între ele, asigurând integritatea referențială prin chei externe (FOREIGN KEY).

| Tabel | Rol principal |
|---|---|
| `angajati` | Date personale și profesionale ale angajaților |
| `departamente` | Structura organizatorică pe departamente |
| `pozitii` | Funcții și grile salariale |
| `manageri` | Managerii și tipul de conducere |
| `proiecte` | Proiectele companiei |
| `alocari_proiecte` | Alocarea angajaților pe proiecte |
| `concedii` | Cererile și aprobările de concediu |
| `evaluari` | Evaluările de performanță |
| `beneficii` | Tipurile de beneficii disponibile |
| `beneficii_angajati` | Beneficiile acordate fiecărui angajat |
| `istoric_salarial` | Istoricul modificărilor salariale |


### 1. Tabelul `angajati`

Stochează informațiile principale despre angajații companiei: date personale, departament, poziție, manager și status.

| Coloană | Tip | Nul? | Descriere |
|---|---|---|---|
| `id_angajat` | INT (PK) | NU | Identificator unic al angajatului (auto-increment) |
| `nume` | VARCHAR(100) | DA | Numele de familie al angajatului |
| `prenume` | VARCHAR(30) | NU | Prenumele angajatului |
| `cnp` | VARCHAR(13) | NU | Codul Numeric Personal (unic) |
| `email` | VARCHAR(100) | NU | Adresa de email profesională |
| `telefon` | VARCHAR(255) | NU | Numărul de telefon |
| `data_angajare` | DATE | NU | Data la care angajatul a fost angajat |
| `id_departament` | INT (FK) | NU | Referință către tabelul `departamente` |
| `id_pozitie` | INT (FK) | NU | Referință către tabelul `pozitii` |
| `id_manager` | INT (FK) | DA | Referință către tabelul `manageri` (poate fi NULL) |
| `status` | ENUM | NU | Starea angajatului: `activ` sau `inactiv` (implicit `activ`) |

---

### 2. Tabelul `departamente`

Conține informații despre departamentele din companie, inclusiv locația și managerul responsabil.

| Coloană | Tip | Nul? | Descriere |
|---|---|---|---|
| `id_departament` | INT (PK) | NU | Identificator unic al departamentului (auto-increment) |
| `nume` | VARCHAR(30) | NU | Denumirea departamentului |
| `locatie` | VARCHAR(60) | NU | Locația fizică a departamentului |
| `id_manager` | INT (FK) | NU | Referință către tabelul `manageri` |

---

### 3. Tabelul `pozitii`

Definește pozițiile/funcțiile disponibile în companie, cu intervalul salarial și nivelul de senioritate.

| Coloană | Tip | Nul? | Descriere |
|---|---|---|---|
| `id_pozitie` | INT (PK) | NU | Identificator unic al poziției (auto-increment) |
| `titlu` | VARCHAR(30) | NU | Titlul poziției (ex: Developer, Analyst) |
| `salariu_min` | DECIMAL(10,2) | NU | Salariul minim pentru această poziție |
| `salariu_max` | DECIMAL(10,2) | NU | Salariul maxim pentru această poziție |
| `nivel` | ENUM | NU | Nivelul de senioritate: `entry` / `mid` / `senior` / `consultant` |

---

### 4. Tabelul `manageri`

Înregistrează managerii din organizație, cu tipul lor, numărul de subordonați și bonusul de management.

| Coloană | Tip | Nul? | Descriere |
|---|---|---|---|
| `id_manager` | INT (PK) | NU | Identificator unic al managerului (auto-increment) |
| `id_angajat` | INT (FK) | NU | Referință către angajatul care ocupă rolul de manager |
| `id_departament` | INT (FK) | NU | Departamentul condus de manager |
| `data_numire` | DATE | NU | Data la care a fost numit în funcție |
| `nr_subordonati` | INT | NU | Numărul de angajați în subordine directă |
| `bonus_management` | DECIMAL(7,2) | NU | Valoarea bonusului de management |
| `tip` | ENUM | NU | Tipul managerului: `team_leader` / `project_manager` / `director` |

---

### 5. Tabelul `proiecte`

Gestionează proiectele companiei, cu datele de desfășurare, statusul și bugetul alocat.

| Coloană | Tip | Nul? | Descriere |
|---|---|---|---|
| `id_proiect` | INT (PK) | NU | Identificator unic al proiectului (auto-increment) |
| `nume` | VARCHAR(30) | NU | Numele proiectului |
| `descriere` | TEXT | NU | Descrierea detaliată a proiectului |
| `data_start` | DATE | NU | Data de început a proiectului |
| `data_sfarsit` | DATE | NU | Data de finalizare planificată |
| `status` | ENUM | NU | Statusul proiectului: `planificat` / `in desfasurare` / `finalizat` |
| `buget` | DECIMAL(10,2) | NU | Bugetul total alocat proiectului |

---

### 6. Tabelul `alocari_proiecte`

Tabel de legătură care asociază angajații cu proiectele, specificând rolul, orele alocate și perioada de implicare.

| Coloană | Tip | Nul? | Descriere |
|---|---|---|---|
| `id_alocare` | INT (PK) | NU | Identificator unic al alocării (auto-increment) |
| `id_angajat` | INT (FK) | NU | Referință către angajatul alocat |
| `id_proiect` | INT (FK) | NU | Referință către proiectul în care este alocat |
| `rol_proiect` | VARCHAR(30) | DA | Rolul angajatului în cadrul proiectului |
| `ore_alocate` | INT | DA | Numărul de ore alocate angajatului în proiect |
| `data_start` | DATE | DA | Data de început a alocării |
| `data_sfarsit` | DATE | DA | Data de sfârșit a alocării |

---

### 7. Tabelul `concedii`

Gestionează cererile de concediu ale angajaților, inclusiv tipul, perioada și statusul aprobării.

| Coloană | Tip | Nul? | Descriere |
|---|---|---|---|
| `id_concediu` | INT (PK) | NU | Identificator unic al concediului (auto-increment) |
| `id_angajat` | INT (FK) | NU | Angajatul care solicită concediul |
| `id_aprobator` | INT (FK) | NU | Managerul care aprobă/respinge cererea |
| `tip` | ENUM | NU | Tipul concediului: `odihna` / `boala` / `concediu fara plata` |
| `data_start` | DATE | NU | Data de început a concediului |
| `data_sfarsit` | DATE | NU | Data de sfârșit a concediului |
| `status` | ENUM | NU | Statusul cererii: `aprobat` / `respins` / `in asteptare` (implicit `in asteptare`) |

---

### 8. Tabelul `evaluari`

Stochează evaluările de performanță ale angajaților, cu scoruri pe mai multe criterii și feedback.

| Coloană | Tip | Nul? | Descriere |
|---|---|---|---|
| `id_evaluare` | INT (PK) | NU | Identificator unic al evaluării (auto-increment) |
| `id_angajat` | INT (FK) | NU | Angajatul evaluat |
| `id_evaluator` | INT (FK) | NU | Angajatul care realizează evaluarea (auto-ref. `angajati`) |
| `data_evaluare` | DATE | NU | Data la care s-a efectuat evaluarea |
| `scor_tehnic` | INT | NU | Scorul obținut la competențe tehnice |
| `scor_comunicare` | INT | NU | Scorul obținut la comunicare |
| `scor_leadership` | INT | NU | Scorul obținut la leadership |
| `scor_final` | DECIMAL(5,2) | NU | Scorul final calculat al evaluării |
| `feedback` | TEXT | DA | Observații și feedback narativ |

---

### 9. Tabelul `beneficii`

Definește tipurile de beneficii disponibile angajaților (ex: tichete de masă, asigurare medicală etc.).

| Coloană | Tip | Nul? | Descriere |
|---|---|---|---|
| `id_beneficiu` | INT (PK) | NU | Identificator unic al beneficiului (auto-increment) |
| `nume` | VARCHAR(30) | NU | Denumirea beneficiului |
| `descriere` | TEXT | NU | Descrierea detaliată a beneficiului |
| `valoare` | DECIMAL(10,2) | NU | Valoarea monetară a beneficiului |

---

### 10. Tabelul `beneficii_angajati`

Tabel de legătură care asociază beneficiile acordate fiecărui angajat, cu data acordării.

| Coloană | Tip | Nul? | Descriere |
|---|---|---|---|
| `id_angajat` | INT (PK/FK) | NU | Referință către angajat (parte din cheia primară compusă) |
| `id_beneficiu` | INT (PK/FK) | NU | Referință către beneficiu (parte din cheia primară compusă) |
| `data_acordare` | DATE | NU | Data la care beneficiul a fost acordat angajatului |

---

### 11. Tabelul `istoric_salarial`

Păstrează istoricul modificărilor salariale ale angajaților, inclusiv motivul schimbării.

| Coloană | Tip | Nul? | Descriere |
|---|---|---|---|
| `id_istoric` | INT (PK) | NU | Identificator unic al înregistrării (auto-increment) |
| `id_angajat` | INT (FK) | NU | Angajatul la care se referă modificarea salarială |
| `salariu_vechi` | DECIMAL(7,2) | NU | Salariul înainte de modificare |
| `salariu_nou` | DECIMAL(7,2) | NU | Salariul după modificare |
| `data_modificare` | DATE | NU | Data la care a intrat în vigoare modificarea |
| `motiv` | VARCHAR(200) | DA | Motivul modificării salariale |

---
## Relații între tabele (Chei externe)

| Tabel sursă (FK) | Tabel destinație (PK) | Tip relație | Descriere |
|---|---|---|---|
| `angajati.id_departament` | `departamente.id_departament` | N:1 | Un angajat aparține unui departament |
| `angajati.id_pozitie` | `pozitii.id_pozitie` | N:1 | Un angajat ocupă o poziție |
| `angajati.id_manager` | `manageri.id_manager` | N:1 | Un angajat poate avea un manager (opțional) |
| `departamente.id_manager` | `manageri.id_manager` | N:1 | Un departament are un manager responsabil |
| `manageri.id_angajat` | `angajati.id_angajat` | 1:1 | Un manager este un angajat |
| `manageri.id_departament` | `departamente.id_departament` | N:1 | Un manager este asociat unui departament |
| `alocari_proiecte.id_angajat` | `angajati.id_angajat` | N:1 | O alocare se referă la un angajat |
| `alocari_proiecte.id_proiect` | `proiecte.id_proiect` | N:1 | O alocare se referă la un proiect |
| `concedii.id_angajat` | `angajati.id_angajat` | N:1 | Un concediu aparține unui angajat |
| `concedii.id_aprobator` | `manageri.id_manager` | N:1 | Concediul este aprobat de un manager |
| `evaluari.id_angajat` | `angajati.id_angajat` | N:1 | O evaluare se referă la un angajat |
| `evaluari.id_evaluator` | `angajati.id_angajat` | N:1 | Evaluatorul este tot un angajat (auto-ref) |
| `beneficii_angajati.id_angajat` | `angajati.id_angajat` | N:M | Legătură angajat–beneficiu |
| `beneficii_angajati.id_beneficiu` | `beneficii.id_beneficiu` | N:M | Legătură angajat–beneficiu |
| `istoric_salarial.id_angajat` | `angajati.id_angajat` | N:1 | Istoricul salarial aparține unui angajat |

## Observații tehnice

**Motor de stocare:** Toate tabelele folosesc motorul `InnoDB`, care suportă tranzacții ACID și constrângeri de cheie externă.

**Charset:** `utf8mb4` / `utf8mb4_general_ci` — suportă caractere Unicode complete, inclusiv emoji.

**Auto-increment:** Cheile primare ale majorității tabelelor sunt de tip `INT` cu `AUTO_INCREMENT`, cu excepția tabelului `beneficii_angajati` care folosește o cheie primară compusă (`id_angajat`, `id_beneficiu`).

**Relație circulară:** Există o dependență circulară potențială între `angajati` și `manageri` (un angajat poate fi manager, iar un manager este un angajat). La popularea bazei de date se execută dezactivarea temporară a verificărilor de cheie externă (`SET FOREIGN_KEY_CHECKS=0`).

**Auto-referință:** Tabelul `evaluari` conține o auto-referință la `angajati` prin coloana `id_evaluator`, permițând oricărui angajat să fie evaluator.
