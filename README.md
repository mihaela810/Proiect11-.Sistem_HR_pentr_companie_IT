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
