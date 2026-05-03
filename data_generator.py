from faker import Faker
import random
from datetime import date, timedelta
import unicodedata

fake = Faker('ro_RO')
random.seed(42)         # face rezultatele reproductibile
                        # acelasi seed = aceleasi date de fiecare data
NR_ANGAJATI = 2000
OUTPUT_FILE = 'populate_hr.sql'


POZITII = [
    ('Junior Java Developer', 9500.00, 13000.00, 'junior'),
    ('Associate Java Developer', 14500.00, 18000.00, 'associate'),
    ('Intermediate Java Developer', 19500.00, 26000.00, 'intermediate'),
    ('Senior Java Developer', 29000.00, 40000.00, 'senior'),
    ('Consultant Java Developer', 42000.00, 50000.00, 'consultant'),
    ('Principal Java Developer', 55000.00, 80000.00, 'principal'),
    ('Junior .NET Developer', 9500.00, 13000.00, 'junior'),
    ('Associate .NET Developer', 14500.00, 18000.00, 'associate'),
    ('Intermediate .NET Developer', 19500.00, 26000.00, 'intermediate'),
    ('Senior .NET Developer', 29000.00, 40000.00, 'senior'),
    ('Consultant .NET Developer', 42000.00, 50000.00, 'consultant'),
    ('Principal .NET Developer', 55000.00, 80000.00, 'principal'),
    ('Junior Mobile Developer', 9500.00, 13000.00, 'junior'),
    ('Associate Mobile Developer', 14500.00, 18000.00, 'associate'),
    ('Intermediate Mobile Developer', 19500.00, 26000.00, 'intermediate'),
    ('Senior Mobile Developer', 29000.00, 40000.00, 'senior'),
    ('Consultant Mobile Developer', 42000.00, 50000.00, 'consultant'),
    ('Principal Mobile Developer', 55000.00, 80000.00, 'principal'),
    ('Junior Frontend Developer', 9500.00, 13000.00, 'junior'),
    ('Associate Frontend Developer', 14500.00, 18000.00, 'associate'),
    ('Intermediate Frontend Developer', 19500.00, 26000.00, 'intermediate'),
    ('Senior Frontend Developer', 29000.00, 40000.00, 'senior'),
    ('consultant Frontend Developer', 42000.00, 50000.00, 'consultant'),
    ('Principal Frontend Developer', 55000.00, 80000.00, 'principal'),

    ('Junior Test Engineer', 8500.00, 13000.00, 'junior'),
    ('Associate Test Engineer', 13000.00, 16500.00, 'associate'),
    ('Intermediate Test Engineer', 17500.00, 22000.00, 'intermediate'),
    ('Senior Test Engineer', 25000.00, 33000.00, 'senior'),
    ('Consultant Test Engineer', 35000.00, 44000.00, 'consultant'),
    ('Principal Test Engineer', 48000.00, 70000.00, 'principal'),
    ('Junior Automation Test Engineer', 8500.00, 13000.00, 'junior'),
    ('Associate Test Automation Engineer', 13000.00, 16500.00, 'associate'),
    ('Intermediate Test Automation Engineer', 17500.00, 22000.00, 'intermediate'),
    ('Senior Automation Test Engineer', 25000.00, 33000.00, 'senior'),
    ('Consultant Automation Test Engineer', 35000.00, 44000.00, 'consultant'),
    ('Principal Automation Test Engineer', 48000.00, 70000.00, 'principal'),
    ('Junior Performance Test Engineer', 8500.00, 13000.00, 'junior'),
    ('Associate Test Performance Engineer', 13000.00, 16500.00, 'associate'),
    ('Intermediate Test Performance Engineer', 17500.00, 22000.00, 'intermediate'),
    ('Senior Performance Test Engineer', 25000.00, 33000.00, 'senior'),
    ('Consultant Test Performance Engineer', 35000.00, 44000.00, 'consultant'),
    ('Principal Performance Test Engineer', 48000.00, 70000.00, 'principal'),
    ('Junior Security Test Engineer', 8500.00, 13000.00, 'junior'),
    ('Associate Test Security Engineer', 13000.00, 16500.00, 'associate'),
    ('Intermediate Test SecurityEngineer', 17500.00, 22000.00, 'intermediate'),
    ('Senior Security Test Engineer', 25000.00, 33000.00, 'senior'),
    ('Consultant Security Test Engineer', 35000.00, 44000.00, 'consultant'),
    ('Principal Security Test Engineer', 48000.00, 70000.00, 'principal'),

    ('Junior Cloud Engineer', 10000.00, 14000.00, 'junior'),
    ('Associate Cloud Engineer', 15500.00, 19500.00, 'associate'),
    ('Intermediate Cloud Engineer', 21000.00, 28000.00, 'intermediate'),
    ('Senior Cloud Engineer', 32000.00, 43000.00, 'senior'),
    ('Consultant Cloud Engineer', 45000.00, 53000.00, 'consultant'),
    ('Principal Cloud Engineer', 58000.00, 85000.00, 'principal'),
    ('Junior Site Reliability Engineer', 10000.00, 14000.00, 'junior'),
    ('Associate Site Reliability Engineer', 15500.00, 19500.00, 'associate'),
    ('Intermediate Site Reliability Engineer', 21000.00, 28000.00, 'intermediate'),
    ('Senior Site Reliability Engineer', 32000.00, 43000.00, 'senior'),
    ('Consultant Site Reliability Engineer', 45000.00, 53000.00, 'consultant'),
    ('Principal Site Reliability Engineer', 58000.00, 85000.00, 'principal'),
    ('Junior Platform Engineer', 10000.00, 14000.00, 'junior'),
    ('Associate Platform Engineer', 15500.00, 19500.00, 'associate'),
    ('Intermediate Platform Engineer', 21000.00, 28000.00, 'intermediate'),
    ('Senior Platform Engineer', 32000.00, 43000.00, 'senior'),
    ('Consultant Platform Engineer', 45000.00, 53000.00, 'consultant'),
    ('Principal Platform Engineer', 58000.00, 85000.00, 'principal'),
    ('Junior Security Engineer', 10000.00, 14000.00, 'junior'),
    ('Associate Security Engineer', 15500.00, 19500.00, 'associate'),
    ('Intermediate Security Engineer', 21000.00, 28000.00, 'intermediate'),
    ('Senior Security Engineer', 32000.00, 43000.00, 'senior'),
    ('Consultant Security Engineer', 45000.00, 53000.00, 'consultant'),
    ('Principal Security Engineer', 58000.00, 85000.00, 'principal'),

    ('Junior Data Engineer', 11000.00, 15000.00, 'junior'),
    ('Associate Data Engineer', 16500.00, 21000.00, 'associate'),
    ('Intermediate Data Engineer', 23000.00, 30000.00, 'intermediate'),
    ('Senior Data Engineer', 34000.00, 46000.00, 'senior'),
    ('Consultant Data Engineer', 48000.00, 58000.00, 'consultant'),
    ('Principal Data Engineer', 62000.00, 90000.00, 'principal'),
    ('Junior Machine Learning Engineer (MLE)', 11000.00, 15000.00, 'junior'),
    ('Associate Machine Learning Engineer (MLE)', 16500.00, 21000.00, 'associate'),
    ('Intermediate Machine Learning Engineer (MLE)', 23000.00, 30000.00, 'intermediate'),
    ('Senior Machine Learning Engineer (MLE)', 34000.00, 46000.00, 'senior'),
    ('Consultant Machine Learning Engineer (MLE)', 48000.00, 58000.00, 'consultant'),
    ('Principal Machine Learning Engineer (MLE)', 62000.00, 90000.00, 'principal'),
    ('Junior Data Scientist', 11000.00, 15000.00, 'junior'),
    ('Associate Data Scientist', 16500.00, 21000.00, 'associate'),
    ('Intermediate Data Scientist', 23000.00, 30000.00, 'intermediate'),
    ('Senior Data Scientist', 34000.00, 46000.00, 'senior'),
    ('Consultant Data Scientist', 48000.00, 58000.00, 'consultant'),
    ('Principal Data Scientist', 62000.00, 90000.00, 'principal'),
    ('Junior LLM Specialist', 11000.00, 15000.00, 'junior'),
    ('Associate LLM Specialist', 16500.00, 21000.00, 'associate'),
    ('Intermediate LLM Specialist', 23000.00, 30000.00, 'intermediate'),
    ('Senior LLM Specialist', 34000.00, 46000.00, 'senior'),
    ('Consultant LLM Specialist', 48000.00, 58000.00, 'consultant'),
    ('Principal LLM Specialist', 62000.00, 90000.00, 'principal'),
    ('Junior Data Architect', 11000.00, 15000.00, 'junior'),
    ('Associate Data Architect', 16500.00, 21000.00, 'associate'),
    ('Intermediate Data Architect', 23000.00, 30000.00, 'intermediate'),
    ('Senior Data Architect', 34000.00, 46000.00, 'senior'),
    ('Consultant Data Architect', 48000.00, 58000.00, 'consultant'),
    ('Principal Data Architect', 62000.00, 90000.00, 'principal'),
    ('Junior MLOps Engineer', 11000.00, 15000.00, 'junior'),
    ('Associate MLOps Engineer', 16500.00, 21000.00, 'associate'),
    ('Intermediate MLOps Engineer', 23000.00, 30000.00, 'intermediate'),
    ('Senior MLOps Engineer', 34000.00, 46000.00, 'senior'),
    ('Consultant MLOps Engineer', 48000.00, 58000.00, 'consultant'),
    ('Principal MLOps Engineer', 62000.00, 90000.00, 'principal'),

    ('Junior QA Analyst', 7000.00, 9500.00, 'junior'),
    ('Associate QA Analyst', 10500.00, 13500.00, 'associate'),
    ('Intermediate QA Analyst', 14500.00, 18000.00, 'intermediate'),
    ('Senior QA Analyst', 20000.00, 26000.00, 'senior'),
    ('Consultant QA Analyst', 28000.00, 34000.00, 'consultant'),
    ('Principal QA Analyst', 38000.00, 50000.00, 'principal'),
    ('Junior UAT Specialist', 7000.00, 9500.00, 'junior'),
    ('Associate UAT Specialist', 10500.00, 13500.00, 'associate'),
    ('Intermediate UAT Specialist', 14500.00, 18000.00, 'intermediate'),
    ('Senior UAT Specialist', 20000.00, 26000.00, 'senior'),
    ('Consultant UAT Specialist', 28000.00, 34000.00, 'consultant'),
    ('Principal UAT Specialist', 38000.00, 50000.00, 'principal'),
    ('Junior Accessibility (A11y) Tester', 7000.00, 9500.00, 'junior'),
    ('Associate Accessibility (A11y) Tester', 10500.00, 13500.00, 'associate'),
    ('Intermediate Accessibility (A11y) Tester', 14500.00, 18000.00, 'intermediate'),
    ('Senior Accessibility (A11y) Tester', 20000.00, 26000.00, 'senior'),
    ('Consultant Accessibility (A11y) Tester', 28000.00, 34000.00, 'consultant'),
    ('Principal Accessibility (A11y) Tester', 38000.00, 50000.00, 'principal'),
    ('Junior Security/Penetration Tester', 7000.00, 9500.00, 'junior'),
    ('Associate Security/Penetration Tester', 10500.00, 13500.00, 'associate'),
    ('Intermediate Security/Penetration Tester', 14500.00, 18000.00, 'intermediate'),
    ('Senior Security/Penetration Tester', 20000.00, 26000.00, 'senior'),
    ('Consultant Security/Penetration Tester', 28000.00, 34000.00, 'consultant'),
    ('Principal Security/Penetration Tester', 38000.00, 50000.00, 'principal'),

    ('Junior Business Analyst', 8000.00, 11000.00, 'junior'),
    ('Associate Business Analyst', 12000.00, 15500.00, 'associate'),
    ('Intermediate Business Analyst', 17000.00, 22500.00, 'intermediate'),
    ('Senior Business Analyst', 26000.00, 35000.00, 'senior'),
    ('Consultant Business Analyst', 38000.00, 46000.00, 'consultant'),
    ('Principal Business Analyst', 50000.00, 70000.00, 'principal'),
    ('Junior Project Manager', 8000.00, 11000.00, 'junior'),
    ('Associate Project Manager', 12000.00, 15500.00, 'associate'),
    ('Intermediate Project Manager', 17000.00, 22500.00, 'intermediate'),
    ('Senior Project Manager', 26000.00, 35000.00, 'senior'),
    ('Consultant Project Manager', 38000.00, 46000.00, 'consultant'),
    ('Principal Project Manager', 50000.00, 70000.00, 'principal')
]

DEPARTAMENTE = [
    ('Development', 'Bucuresti'),
    ('Testing (QA Automation)', 'Bucuresti'),
    ('DevOps & Cloud', 'Bucuresti'),
    ('Data & AI Engineering', 'Bucuresti'),
    ('Testing (Manual)', 'Bucuresti'),
    ('Business Analysis / PM', 'Bucuresti'),
    ('Human Resources', 'Bucuresti'),

    ('Development', 'Cluj-Napoca'),
    ('Testing (QA Automation)', 'Cluj-Napoca'),
    ('DevOps & Cloud', 'Cluj-Napoca'),
    ('Data & AI Engineering', 'Cluj-Napoca'),
    ('Testing (Manual)', 'Cluj-Napoca'),
    ('Business Analysis / PM', 'Cluj-Napoca'),
    ('Human Resources', 'Cluj-Napoca'),

    ('Development', 'Timisoara'),
    ('Testing (QA Automation)', 'Timisoara'),
    ('DevOps & Cloud', 'Timisoara'),
    ('Data & AI Engineering', 'Timisoara'),
    ('Testing (Manual)', 'Timisoara'),
    ('Business Analysis / PM', 'Timisoara'),
    ('Human Resources', 'Timisoara'),

    ('Development', 'Brasov'),
    ('Testing (QA Automation)', 'Brasov'),
    ('DevOps & Cloud', 'Brasov'),
    ('Data & AI Engineering', 'Brasov'),
    ('Testing (Manual)', 'Brasov'),
    ('Business Analysis / PM', 'Brasov'),
    ('Human Resources', 'Brasov'),

    ('Development', 'Craiova'),
    ('Testing (QA Automation)', 'Craiova'),
    ('DevOps & Cloud', 'Craiova'),
    ('Data & AI Engineering', 'Craiova'),
    ('Testing (Manual)', 'Craiova'),
    ('Business Analysis / PM', 'Craiova'),
    ('Human Resources', 'Craiova'),

    ('Development', 'Pitesti'),
    ('Testing (QA Automation)', 'Pitesti'),
    ('DevOps & Cloud', 'Pitesti'),
    ('Data & AI Engineering', 'Pitesti'),
    ('Testing (Manual)', 'Pitesti'),
    ('Business Analysis / PM', 'Pitesti'),
    ('Human Resources', 'Pitesti'),

    ('Development', 'Sibiu'),
    ('Testing (QA Automation)', 'Sibiu'),
    ('DevOps & Cloud', 'Sibiu'),
    ('Data & AI Engineering', 'Sibiu'),
    ('Testing (Manual)', 'Sibiu'),
    ('Business Analysis / PM', 'Sibiu'),
    ('Human Resources', 'Sibiu'),

    ('Development', 'Suceava'),
    ('Testing (QA Automation)', 'Suceava'),
    ('DevOps & Cloud', 'Suceava'),
    ('Data & AI Engineering', 'Suceava'),
    ('Testing (Manual)', 'Suceava'),
    ('Business Analysis / PM', 'Suceava'),
    ('Human Resources', 'Suceava'),

    ('Development', 'Iasi'),
    ('Testing (QA Automation)', 'Iasi'),
    ('DevOps & Cloud', 'Iasi'),
    ('Data & AI Engineering', 'Iasi'),
    ('Testing (Manual)', 'Iasi'),
    ('Business Analysis / PM', 'Iasi'),
    ('Human Resources', 'Iasi')
]

BENEFICII = [
    ('Tichete de masa', 'Card Edenred/Sodexo', 840.00),
    ('Abonament Medical', 'Regina Maria/ MedLife', 350.00),
    ('Abonament Sport', 'Co-plata 7Card sau WorldClass', 150.00),
    ('Asigurare de viata', 'Polita de grup', 100.00),
    ('Buget de Well-being', 'Platforme tip Benefit/MyBenefit', 250.00),
    ('Echipament & Tehnologie', 'Amortizarea lunara a laptopului/echipamentului', 200.00),
    ('Platforme Learning', 'Acces Udemy Business, Pluralsight, LinkedIn Learning', 150.00),
    ('Concediu Suplimentar', 'Valoarea zilelor extra (peste 21) impartita la 12 luni', 400.00),
    ('Bonus de performanta', 'Proportia lunara dintr-un bonus anul mediu (estimat)', 1200.00)
]

PROIECTE = [
    ('Worldpay Integration', 'Integrare API pentru procesare plati globale', 'in desfasurare', 850000),
    ('Mastercard Gateway', 'Modernizare sistem de autorizare tranzactii', 'finalizat', 1200000),
    ('Paysafe Wallet Redesign', 'Refacere interfata si backend portofel electronic', 'in desfasurare', 450000),
    ('ClearBank Connectivity', 'Sistem de plati in timp real pentru UK', 'finalizat', 980000),
    ('CryptoBridge', 'Platforma de schimb valute digitale si fiat', 'planificat', 600000),
    
    ('BankingCore NextGen', 'Migrare sistem core banking catre microservicii', 'in desfasurare', 2500000),
    ('FraudDetect AI', 'Sistem de detectie a fraudelor bancare bazat pe ML', 'in desfasurare', 720000),
    ('Mortgage Direct', 'Automatizare flux aprobare credite ipotecare', 'finalizat', 550000),
    ('WealthManager Tool', 'Dashboard pentru consultanti investitii', 'planificat', 400000),
    ('OpenBanking API Hub', 'Dezvoltare gateway conform normelor PSD2', 'finalizat', 1100000),

    ('RetailNext Analytics', 'Analiza comportament cumparatori in magazine fizice', 'in desfasurare', 320000),
    ('LogiTrack Global', 'Sistem de urmarire a flotelor de transport cargo', 'finalizat', 1500000),
    ('AutoInventory', 'Gestionare automata a stocurilor cu senzori IoT', 'planificat', 480000),
    ('SelfCheckout 2.0', 'Software pentru terminale de plata fara casier', 'in desfasurare', 900000),
    ('LoyaltyRewards App', 'Platforma de fidelizare pentru lanturi de retail', 'finalizat', 250000),

    ('TMT Dashboard', 'Sistem de monitorizare infrastructura retele 5G', 'in desfasurare', 1350000),
    ('SkyStream Engine', 'Optimizare algoritm livrare continut video 4K', 'finalizat', 670000),
    ('TelcoBilling SaaS', 'Platforma de facturare pentru operatori telecom', 'planificat', 2100000),
    ('MetaAd Engine', 'Sistem de targetare reclame in medii virtuale', 'in desfasurare', 800000),
    ('NewsCycle CMS', 'Sistem de management continut pentru agentii de stiri', 'finalizat', 300000),

    ('HealthSync Cloud', 'Stocare securizata a dosarelor medicale in cloud', 'in desfasurare', 1800000),
    ('BioPharma Research', 'Analiza date pentru studii clinice', 'finalizat', 1200000),
    ('TeleMed Connect', 'Platforma pentru consultatii medicale la distanta', 'planificat', 500000),
    ('PatientMonitor IoT', 'Integrare date de la dispozitive purtabile', 'in desfasurare', 420000),
    ('PharmaSupply Chain', 'Trasabilitate medicamente pe baza de blockchain', 'finalizat', 950000),

    ('GovCloud Romania', 'Infrastructura cloud pentru servicii publice', 'in desfasurare', 5000000),
    ('eCitizen Portal', 'Platforma unica pentru interactiunea cetatenilor cu statul', 'planificat', 3500000),
    ('TaxAutoFill', 'Sistem de completare automata a declaratiilor fiscale', 'finalizat', 1400000),
    ('DigitalArchives', 'Digitalizarea registrelor de stare civila', 'in desfasurare', 750000),
    ('SmartCity Traffic', 'Sistem de management inteligent al traficului urban', 'planificat', 1100000),

    ('InCar Infotainment', 'Dezvoltare interfata sistem navigatie si divertisment', 'in desfasurare', 2200000),
    ('EV ChargeNet', 'Retea de gestionare a statiilor de incarcare electrica', 'finalizat', 880000),
    ('DriverAssist AI', 'Sistem de asistenta bazat pe recunoastere video', 'in desfasurare', 1600000),
    ('FleetMaintenance', 'Predictie mentenanta pentru flote auto', 'planificat', 550000),
    ('ConnectedCar Security', 'Securizarea comunicatiilor V2X (Vehicle-to-Everything)', 'finalizat', 1300000),

    ('GenAI Customer Support', 'Implementare LLM custom pentru automatizarea tichetelor de suport', 'in desfasurare', 1200000),
    ('Predictive Maintenance ML', 'Model de predictie a defectiunilor pentru senzori industriali', 'finalizat', 850000),
    ('DataLake Migration', 'Migrare de la on-premise Hadoop la Snowflake Cloud Data Warehouse', 'in desfasurare', 1500000),
    ('RealTime Fraud Detection', 'Pipeline Spark pentru analiza tranzactiilor in milisecunde', 'finalizat', 2100000),
    ('Healthcare Vision AI', 'Sistem de analiza a radiografiilor folosind Computer Vision', 'planificat', 950000),
    ('Retail Demand Forecast', 'Algoritm de prognoza a stocurilor bazat pe serii temporale', 'in desfasurare', 600000),
    ('Ethical AI Guardrails', 'Sistem de monitorizare a bias-ului in deciziile automate de creditare', 'planificat', 450000),

    ('MultiCloud Orchestration', 'Gestionare clusterelor Kubernetes pe AWS si Azure simultan', 'in desfasurare', 1800000),
    ('Zero Trust Security', 'Implementare arhitectura de securitate fara perimetru fix', 'finalizat', 1100000),
    ('FinOps Optimizer', 'Automatizarea scalarii resurselor cloud pentru reducerea costurilor', 'in desfasurare', 550000),
    ('Serverless Backend Refactor', 'Migrarea functiilor monolit catre AWS Lambda / Azure Functions', 'finalizat', 700000),
    ('Disaster Recovery 2.0', 'Sistem de replicare automata a datelor in regiuni geografice diferite', 'planificat', 1300000),
    ('GitOps Pipeline Standard', 'Standardizarea livrarii codului folosind ArgoCD si Terraform', 'in desfasurare', 400000),
    ('Edge Computing Setup', 'Configurare noduri de procesare locala pentru dispozitive IoT', 'planificat', 900000),

    ('Self-Healing Test Suite', 'Scripturi de testare care se repara automat la schimbari de UI', 'in desfasurare', 350000),
    ('Performance Stress Lab', 'Simulare a 1 milion de utilizatori simultani pentru aplicatie banking', 'finalizat', 650000),
    ('Mobile Device Farm', 'Automatizare teste pe 500+ combinatii de dispozitive mobile', 'in desfasurare', 800000),
    ('API Security Testing', 'Automatizarea testelor de penetrare pentru endpoint-uri REST/GraphQL', 'finalizat', 420000),
    ('Visual Regression Bot', 'Detectie automata a schimbarilor de design pixel-cu-pixel', 'planificat', 280000),
    ('CI/CD Integrated Testing', 'Sistem de "quality gates" care blocheaza deploy-ul la esecuri QA', 'in desfasurare', 500000),
    ('Chaos Engineering Tests', 'Injectare automata de erori in productie pentru testarea rezilientei', 'planificat', 750000)
]



def gen_pozitii():
    sql = []
    ids = []

    sql.append("-- POZITII")

    for i, (titlu, sal_min, sal_max, nivel) in enumerate(POZITII, start=1):
        titlu_escaped = titlu.replace("'", "''")
        linie = (
            f"INSERT INTO `pozitii` (`titlu`, `salariu_min`, `salariu_max`, `nivel`) "
            f"VALUES ('{titlu_escaped}', {sal_min:.2f}, {sal_max:.2f}, '{nivel}');"
        )
        sql.append(linie)
        ids.append(i)
        pass

    return {'sql': sql, 'ids': ids, 'data': POZITII}



def gen_beneficii():
    sql = []
    ids = []

    sql.append("-- BENEFICII")

    for i, (nume, descriere, valoare) in enumerate(BENEFICII, start=1):
        nume_escaped = nume.replace("'", "''")
        descriere_escaped = descriere.replace("'", "''")

        linie = (
            f"INSERT INTO `beneficii` (`nume`, `descriere`, `valoare`) "
            f"VALUES ('{nume_escaped}', '{descriere_escaped}', {valoare:.2f});"
        )
        sql.append(linie)
        ids.append(i)
        pass
    return {'sql': sql, 'ids': ids}



def gen_proiecte():
    sql = []
    ids = []

    sql.append("-- PROIECTE")

    azi = date.today()

    for i, (nume, descriere, status, buget) in enumerate(PROIECTE, start=1):
        nume_escaped = nume.replace("'", "''")
        descriere_escaped = descriere.replace("'", "''")

        if status == 'finalizat':
            data_start = azi - timedelta(days=random.randint(730, 1825))
            data_sfarsit = data_start + timedelta(days=random.randint(180, 540))
        elif status == 'in desfasurare':
            data_start = azi - timedelta(days=random.randint(180, 730))
            data_sfarsit = azi + timedelta(days=random.randint(90, 730))
        else:
            data_start = azi + timedelta(days=random.randint(30, 365))
            data_sfarsit = data_start + timedelta(days=random.randint(180, 730))

        data_start_str = data_start.strftime('%Y-%m-%d')
        data_sfarsit_str = data_sfarsit.strftime('%Y-%m-%d')

        linie = (
            f"INSERT INTO `proiecte` (`nume`, `descriere`, `data_start`, `data_sfarsit`, `status`, `buget`) "
            f"VALUES ('{nume_escaped}', '{descriere_escaped}', '{data_start_str}', '{data_sfarsit_str}', '{status}', {buget});"
        )
        sql.append(linie)
        ids.append(i)
        pass
    return {'sql': sql, 'ids': ids}



def gen_departamente():
    sql = []
    ids = []

    sql.append("-- DEPARTAMENTE ({} inregistrari)".format(len(DEPARTAMENTE)))

    for i, (nume, locatie) in enumerate(DEPARTAMENTE, start=1):
        nume_escaped = nume.replace("'", "''")
        locatie_escaped = locatie.replace("'", "''")

        # id_manager = 1 este un placeholder temporar care va fi actualizat in gen_update_legaturi()
        linie = (
            f"INSERT INTO `departamente` (`nume`, `locatie`, `id_manager`) "
            f"VALUES ('{nume_escaped}', '{locatie_escaped}', 1);"
        )
        sql.append(linie)
        ids.append(i)
    return {'sql': sql, 'ids': ids}



def normalizeaza_text(text):
    nfkd = unicodedata.normalize('NFKD', text)
    return ''.join(c for c in nfkd if not unicodedata.combining(c)).lower()

def genereaza_cnp(data_nastere, sex):
    s = '1' if sex == 'M' else '2'
    an = data_nastere.strftime('%y')
    luna = data_nastere.strftime('%m')
    zi = data_nastere.strftime('%d')
    judet = str(random.randint(1, 46)).zfill(2)
    secvential = str(random.randint(1, 999)).zfill(3)
    control = str(random.randint(0, 9))
    return f"{s}{an}{luna}{zi}{judet}{secvential}{control}"

def gen_angajati(pozitii, departamente):
    sql = []
    angajati = [] 

    sql.append("-- ANGAJATI ({} inregistrari)".format(NR_ANGAJATI))

    azi = date.today()
    emailuri_folosite = set() 
    cnp_folosite = set()

    for i in range(1, NR_ANGAJATI + 1):
        sex = random.choice(['M', 'F'])
        if sex == 'M':
            prenume = fake.first_name_male()
            nume = fake.last_name_male()
        else:
            prenume = fake.first_name_female()
            nume = fake.last_name_female()
    
    for i in range(1, NR_ANGAJATI + 1):
        data_nastere = azi - timedelta(days=random.randint(23*365, 55*365))
        cnp = genereaza_cnp(data_nastere, sex)
        while cnp in cnp_folosite:
            data_nastere = azi - timedelta(days=random.randint(23*365, 55*365))
            cnp = genereaza_cnp(data_nastere, sex)
        cnp_folosite.add(cnp)

        baza_email = f"{normalizeaza_text(prenume)}.{normalizeaza_text(nume)}"
        email = f"{baza_email}@endava.com"
        contor = 1
        while email in emailuri_folosite:
            email = f"{baza_email}{contor}@endava.com"
            contor += 1
        emailuri_folosite.add(email)
        telefon = fake.phone_number()
        data_angajare = azi - timedelta(days=random.randint(30, 8*365))
        data_angajare_str = data_angajare.strftime('%Y-%m-%d')
        id_pozitie = random.choice(pozitii['ids'])
        pozitie_data = pozitii['data'][id_pozitie - 1]
        salariu = round(random.uniform(pozitie_data[1], pozitie_data[2]), 2)
        id_departament = random.choice(departamente['ids'])
        status = 'activ' if random.random() < 0.9 else 'inactiv'
        nume_escaped = nume.replace("'", "''")
        prenume_escaped = prenume.replace("'", "''")
        telefon_escaped = telefon.replace("'", "''")

        linie = (
            f"INSERT INTO `angajati` (`nume`, `prenume`, `cnp`, `email`, `telefon`, "
            f"`data_angajare`, `id_departament`, `id_pozitie`, `id_manager`, `status`, `salariu_curent`) "
            f"VALUES ('{nume_escaped}', '{prenume_escaped}', '{cnp}', '{email}', '{telefon_escaped}', "
            f"'{data_angajare_str}', {id_departament}, {id_pozitie}, NULL, '{status}', {salariu});"
        )
        sql.append(linie)
        angajati.append({
            'id': i,
            'nume': nume,
            'prenume': prenume,
            'email': email,
            'id_departament': id_departament,
            'id_pozitie': id_pozitie,
            'salariu': salariu,
            'status': status,
            'data_angajare': data_angajare
        })

    return {'sql': sql, 'ids': [a['id'] for a in angajati], 'data': angajati}



def gen_manageri(angajati, departamente):
    sql = []
    manageri = []

    sql.append("-- MANAGERI ({} inregistrari)".format(len(departamente['ids'])))

    azi = date.today()
    activi = [a for a in angajati['data'] if a['status'] == 'activ']
    angajati_folositi = set() 

    TIPURI_MANAGER = ['team_leader', 'project_manager', 'director']

    for i, id_dept in enumerate(departamente['ids'], start=1):
        disponibili = [a for a in activi if a['id'] not in angajati_folositi]
        if not disponibili:
            disponibili = activi

        angajat = random.choice(disponibili)
        angajati_folositi.add(angajat['id'])

        zile_de_la_angajare = (azi - angajat['data_angajare']).days
        if zile_de_la_angajare > 30:
            data_numire = angajat['data_angajare'] + timedelta(
                days=random.randint(30, zile_de_la_angajare)
            )
        else:
            data_numire = angajat['data_angajare']
        
        data_numire_str = data_numire.strftime('%Y-%m-%d')
        bonus = round(random.uniform(500, 3000), 2)
        tip = random.choice(TIPURI_MANAGER)

        linie = (
            f"INSERT INTO `manageri` (`id_angajat`, `id_departament`, `data_numire`, "
            f"`bonus_management`, `tip`) "
            f"VALUES ({angajat['id']}, {id_dept}, '{data_numire_str}', {bonus}, '{tip}');"
        )
        sql.append(linie)

        manageri.append({
            'id': i,
            'id_angajat': angajat['id'],
            'id_departament': id_dept,
            'data_numire': data_numire
        })

    return {'sql': sql, 'ids': [m['id'] for m in manageri], 'data': manageri}



def gen_update_legaturi(manageri, departamente, angajati):
    sql = []
    sql.append("-- UPDATE LEGATURI CIRCULARE")
    sql.append("\n-- Setare manageri reali in departamente")

    for manager in manageri['data']:
        linie = (
            f"UPDATE `departamente` "
            f"SET `id_manager` = {manager['id']} "
            f"WHERE `id_departament` = {manager['id_departament']};"
        )
        sql.append(linie)

    sql.append("\n-- Setare manager pentru fiecare angajat")
    dept_to_manager = {
        m['id_departament']: m['id']
        for m in manageri['data']
    }

    for angajat in angajati['data']:
        id_dept = angajat['id_departament']
        if id_dept in dept_to_manager:
            id_manager = dept_to_manager[id_dept]
        else:
            id_manager = random.choice(manageri['ids'])

        linie = (
            f"UPDATE `angajati` "
            f"SET `id_manager` = {id_manager} "
            f"WHERE `id_angajat` = {angajat['id']};"
        )
        sql.append(linie)

    return {'sql': sql}



def gen_alocari(angajati, proiecte):
    sql = []
    sql.append("-- ALOCARI PROIECTE")

    ROLURI = ['Developer', 'Tech Lead', 'QA Engineer',
              'Business Analyst', 'DevOps Engineer', 'Scrum Master']
    azi = date.today()
    id_alocare = 1

    for angajat in angajati['data']:
        if angajat['status'] != 'activ':
            continue
        if random.random() > 0.8:
            continue
        nr_proiecte = random.randint(1, 3)
        proiecte_alese = random.sample(proiecte['ids'], min(nr_proiecte, len(proiecte['ids'])))
        ore_totale = 0

        for id_proiect in proiecte_alese:
            ore_ramase = 40 - ore_totale
            if ore_ramase < 8:  # daca nu mai sunt destule ore, oprim
                break
            ore = random.randint(8, min(32, ore_ramase))
            ore_totale += ore

            rol = random.choice(ROLURI)
            zile_de_la_angajare = (azi - angajat['data_angajare']).days
            if zile_de_la_angajare > 30:
                data_start = angajat['data_angajare'] + timedelta(
                    days=random.randint(0, zile_de_la_angajare - 30)
                )
            else:
                data_start = angajat['data_angajare']
            if random.random() < 0.3:
                data_sfarsit = data_start + timedelta(days=random.randint(90, 540))
                data_sfarsit_str = f"'{data_sfarsit.strftime('%Y-%m-%d')}'"
            else:
                data_sfarsit_str = "NULL"

            data_start_str = data_start.strftime('%Y-%m-%d')
            rol_escaped = rol.replace("'", "''")

            linie = (
                f"INSERT INTO `alocari_proiecte` (`id_angajat`, `id_proiect`, `rol_proiect`, "
                f"`ore_alocate`, `data_start`, `data_sfarsit`) "
                f"VALUES ({angajat['id']}, {id_proiect}, '{rol_escaped}', "
                f"{ore}, '{data_start_str}', {data_sfarsit_str});"
            )
            sql.append(linie)
            id_alocare += 1

    return {'sql': sql}



def gen_evaluari(angajati):
    sql = []
    sql.append("-- EVALUARI")

    azi = date.today()
    activi = [a for a in angajati['data'] if a['status'] == 'activ']

    FEEDBACK_POZITIV = [
        'Performanta excelenta, depaseste asteptarile echipei.',
        'Comunicare foarte buna, colaboreaza eficient cu colegii.',
        'Livreaza constant la timp si la calitate ridicata.',
        'Initiativa remarcabila in rezolvarea problemelor complexe.',
        'Contributie semnificativa la succesul proiectului.',
    ]
    FEEDBACK_NEUTRU = [
        'Performanta in linie cu asteptarile pentru nivelul sau.',
        'Are potential de crestere, necesita mai multa initiativa.',
        'Rezultate bune, cu mici imbunatatiri necesare in comunicare.',
        'Se descurca bine in taskurile de rutina.',
    ]
    FEEDBACK_NEGATIV = [
        'Necesita imbunatatiri semnificative in livrare.',
        'Comunicarea cu echipa trebuie imbunatatita.',
        'Intarzieri repetate in livrarea taskurilor asumate.',
        'Scor tehnic sub asteptari, se recomanda training suplimentar.',
    ]

    for angajat in angajati['data']:
        zile_vechime = (azi - angajat['data_angajare']).days
        ani_vechime = zile_vechime // 365
        nr_evaluari = min(max(1, ani_vechime), 5)

        for j in range(nr_evaluari):
            alti_activi = [a for a in activi if a['id'] != angajat['id']]
            if not alti_activi:
                continue
            evaluator = random.choice(alti_activi)
            ani_in_urma = nr_evaluari - j
            data_evaluare = azi - timedelta(days=ani_in_urma * 365 - random.randint(0, 30))
            if data_evaluare < angajat['data_angajare']:
                data_evaluare = angajat['data_angajare'] + timedelta(days=30)
            data_evaluare_str = data_evaluare.strftime('%Y-%m-%d')
            scor_tehnic = random.randint(1, 10)
            scor_comunicare = random.randint(1, 10)
            scor_leadership = random.randint(1, 10)
            scor_final = round(
                scor_tehnic * 0.5 +
                scor_comunicare * 0.3 +
                scor_leadership * 0.2,
                2
            )
            if scor_final >= 7.5:
                feedback = random.choice(FEEDBACK_POZITIV)
            elif scor_final >= 5:
                feedback = random.choice(FEEDBACK_NEUTRU)
            else:
                feedback = random.choice(FEEDBACK_NEGATIV)

            feedback_escaped = feedback.replace("'", "''")
            linie = (
                f"INSERT INTO `evaluari` (`id_angajat`, `id_evaluator`, `data_evaluare`, "
                f"`scor_tehnic`, `scor_comunicare`, `scor_leadership`, `scor_final`, `feedback`) "
                f"VALUES ({angajat['id']}, {evaluator['id']}, '{data_evaluare_str}', "
                f"{scor_tehnic}, {scor_comunicare}, {scor_leadership}, {scor_final}, '{feedback_escaped}');"
            )
            sql.append(linie)

    return {'sql': sql}



def gen_concedii(angajati, manageri):
    sql = []
    sql.append("-- CONCEDII")

    azi = date.today()

    for angajat in angajati['data']:
        nr_concedii = random.randint(1, 4)
        for _ in range(nr_concedii):
            id_aprobator = random.choice(manageri['ids'])
            tip = random.choices(
                ['odihna', 'boala', 'concediu fara plata'],
                weights=[70, 20, 10]
            )[0]
            if tip == 'odihna':
                durata = random.randint(3, 21)
            elif tip == 'boala':
                durata = random.randint(1, 10)
            else:
                durata = random.randint(1, 30)
            zile_disponibile = (azi + timedelta(days=365) - angajat['data_angajare']).days

            if zile_disponibile <= 0:
                continue

            data_start = angajat['data_angajare'] + timedelta(
                days=random.randint(0, zile_disponibile)
            )
            data_sfarsit = data_start + timedelta(days=durata)
            data_start_str = data_start.strftime('%Y-%m-%d')
            data_sfarsit_str = data_sfarsit.strftime('%Y-%m-%d')

            if data_sfarsit < azi:
                status = random.choices(
                    ['aprobat', 'respins'],
                    weights=[85, 15]
                )[0]
            else:
                status = 'in asteptare'

            linie = (
                f"INSERT INTO `concedii` (`id_angajat`, `id_aprobator`, `tip`, "
                f"`data_start`, `data_sfarsit`, `status`) "
                f"VALUES ({angajat['id']}, {id_aprobator}, '{tip}', "
                f"'{data_start_str}', '{data_sfarsit_str}', '{status}');"
            )
            sql.append(linie)

    return {'sql': sql}



def gen_utilizatori(angajati, manageri):
    sql = []
    sql.append("-- UTILIZATORI")

    TIP_TO_ROL = {
        'team_leader':     'team_leader',
        'project_manager': 'project_manager',
        'director':        'director'
    }

    PAROLA_HASH = '$2b$12$KIXsNpPFCuRcHDQTpDIBOeHGvMFpEqvLu5QXqKZ8mFhL3oWnRvGXm'
    username_folosite = set()

    def genereaza_username(prenume, nume):
        baza = f"{normalizeaza_text(prenume[0])}.{normalizeaza_text(nume)}"
        username = baza
        contor = 1
        while username in username_folosite:
            username = f"{baza}{contor}"
            contor += 1
        username_folosite.add(username)
        return username
    
    sql.append("\n-- Conturi manageri")

    angajat_by_id = {a['id']: a for a in angajati['data']}

    for manager in manageri['data']:
        angajat = angajat_by_id.get(manager['id_angajat'])
        if not angajat:
            continue
        username = genereaza_username(angajat['prenume'], angajat['nume'])
        rol = TIP_TO_ROL.get(manager.get('tip', 'team_leader'), 'team_leader')
        linie = (
            f"INSERT INTO `utilizatori` (`id_angajat`, `username`, `parola_hash`, `rol`, `activ`) "
            f"VALUES ({angajat['id']}, '{username}', '{PAROLA_HASH}', '{rol}', 1);"
        )
        sql.append(linie)

    sql.append("\n-- Conturi HR")

    for angajat in angajati['data']:
        id_dept = angajat['id_departament']
        if id_dept - 1 < len(DEPARTAMENTE):
            nume_dept = DEPARTAMENTE[id_dept - 1][0]
        else:
            continue
        if 'Human Resources' not in nume_dept:
            continue
        manageri_ids_angajati = {m['id_angajat'] for m in manageri['data']}
        if angajat['id'] in manageri_ids_angajati:
            continue
        username = genereaza_username(angajat['prenume'], angajat['nume'])
        rol = random.choices(
            ['hr_specialist', 'hr_manager'],
            weights=[80, 20]
        )[0]

        linie = (
            f"INSERT INTO `utilizatori` (`id_angajat`, `username`, `parola_hash`, `rol`, `activ`) "
            f"VALUES ({angajat['id']}, '{username}', '{PAROLA_HASH}', '{rol}', 1);"
        )
        sql.append(linie)

    return {'sql': sql}



def gen_beneficii_angajati(angajati, beneficii):
    sql = []
    sql.append("-- BENEFICII ANGAJATI")

    azi = date.today()

    for angajat in angajati['data']:
        nr_beneficii = random.randint(2, min(5, len(beneficii['ids'])))
        beneficii_alese = random.sample(beneficii['ids'], nr_beneficii)

        for id_beneficiu in beneficii_alese:
            zile_de_la_angajare = (azi - angajat['data_angajare']).days
            if zile_de_la_angajare > 0:
                data_acordare = angajat['data_angajare'] + timedelta(
                    days=random.randint(0, zile_de_la_angajare)
                )
            else:
                data_acordare = angajat['data_angajare']

            data_acordare_str = data_acordare.strftime('%Y-%m-%d')

            linie = (
                f"INSERT INTO `beneficii_angajati` (`id_angajat`, `id_beneficiu`, `data_acordare`) "
                f"VALUES ({angajat['id']}, {id_beneficiu}, '{data_acordare_str}');"
            )
            sql.append(linie)

    return {'sql': sql}





def main():
    sql_parts = []

    sql_parts.append("-- Script populare baza de date HR - Endava")
    sql_parts.append("-- Generat automat cu Python + Faker")
    sql_parts.append("")
    sql_parts.append("SET FOREIGN_KEY_CHECKS = 0;")
    sql_parts.append("SET NAMES utf8mb4;")
    sql_parts.append("")

    print("Generez pozitii...")
    pozitii = gen_pozitii()

    print("Generez beneficii...")
    beneficii = gen_beneficii()

    print("Generez proiecte...")
    proiecte = gen_proiecte()

    print("Generez departamente...")
    departamente = gen_departamente()

    print("Generez angajati...")
    angajati = gen_angajati(pozitii, departamente)

    print("Generez manageri...")
    manageri = gen_manageri(angajati, departamente)

    print("Generez update legaturi circulare...")
    legaturi = gen_update_legaturi(manageri, departamente, angajati)

    print("Generez alocari proiecte...")
    alocari = gen_alocari(angajati, proiecte)

    print("Generez evaluari...")
    evaluari = gen_evaluari(angajati)

    print("Generez concedii...")
    concedii = gen_concedii(angajati, manageri)

    print("Generez beneficii angajati...")
    beneficii_ang = gen_beneficii_angajati(angajati, beneficii)

    print("Generez utilizatori...")
    utilizatori = gen_utilizatori(angajati, manageri)

    for parte in [
        pozitii, beneficii, proiecte, departamente,
        angajati, manageri, legaturi, alocari,
        evaluari, concedii, beneficii_ang, utilizatori
    ]:
        sql_parts.extend(parte['sql'])

    sql_parts.append("")
    sql_parts.append("SET FOREIGN_KEY_CHECKS = 1;")
    sql_parts.append("")
    sql_parts.append("-- Populare finalizata cu succes!")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_parts))

    print("\n✓ Fisier generat: {}".format(OUTPUT_FILE))
    print("✓ Pozitii:        {}".format(len(pozitii['ids'])))
    print("✓ Beneficii:      {}".format(len(beneficii['ids'])))
    print("✓ Proiecte:       {}".format(len(proiecte['ids'])))
    print("✓ Departamente:   {}".format(len(departamente['ids'])))
    print("✓ Angajati:       {}".format(len(angajati['ids'])))
    print("✓ Manageri:       {}".format(len(manageri['ids'])))


if __name__ == '__main__':
    main()