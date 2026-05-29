from flask import Flask, jsonify, request
from flask_cors import CORS
import re
import os
import mysql.connector
from datetime import datetime
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from functools import wraps

app = Flask(__name__)
CORS(app)
app.config["JWT_SECRET_KEY"] = "super-secret-roz-albastru"
jwt = JWTManager(app)
regex_email = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

# ── CONEXIUNE DB — variabila de mediu (corecta pt Docker) ────────────────────
db_config = {
    'host':     os.getenv('DB_HOST', 'localhost'),
    'user':     os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'my_database')
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

def get_rol_si_locatie(identity):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT u.rol, d.locatie
        FROM utilizatori u
        JOIN angajati a ON u.id_angajat = a.id_angajat
        JOIN departamente d ON a.id_departament = d.id_departament
        WHERE u.id_utilizator = %s
    """, (identity,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return result  # {'rol': 'director', 'locatie': 'Cluj-Napoca'}

def rol_required(*roluri_permise):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            identity = get_jwt_identity()
            info = get_rol_si_locatie(identity) 
            if not info or info['rol'] not in roluri_permise:
                return jsonify({
                    "status": "eroare_acces",
                    "mesaj": f"Acces interzis. Roluri permise: {', '.join(roluri_permise)}"
                }), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

# ── ANGAJATI ─────────────────────────────────────────────────────────────────

@app.route('/api/angajati', methods=['POST'])
@jwt_required()
@rol_required('hr_manager', 'ceo')
def adauga_angajat():
    date_noi = request.get_json()
    erori = []

    campuri_obligatorii = [
        'nume', 'prenume', 'cnp', 'email', 'telefon',
        'an_angajare', 'luna_angajare', 'id_pozitie', 'id_departament', 'salariu_curent'
    ]
    for camp in campuri_obligatorii:
        if camp not in date_noi or str(date_noi[camp]).strip() == "":
            erori.append(f"Campul '{camp}' lipseste.")

    email = date_noi.get('email', '')
    if email and not re.fullmatch(regex_email, email):
        erori.append("Email invalid.")

    cnp = str(date_noi.get('cnp', ''))
    if cnp and (not cnp.isdigit() or len(cnp) != 13):
        erori.append("CNP-ul trebuie sa aiba exact 13 cifre.")

    tel = str(date_noi.get('telefon', '')).replace(" ", "")
    if tel and (len(tel) < 7 or len(tel) > 17):
        erori.append("Telefonul trebuie sa aiba intre 7 si 17 cifre.")

    an   = date_noi.get('an_angajare')
    luna = date_noi.get('luna_angajare')
    try:
        if an and not (1900 <= int(an) <= 2026):
            erori.append("Anul trebuie sa fie intre 1900 si 2026.")
        if luna and not (1 <= int(luna) <= 12):
            erori.append("Luna trebuie sa fie intre 1 si 12.")
    except ValueError:
        erori.append("Anul si luna trebuie sa fie numere.")

    if erori:
        return jsonify({"status": "eroare", "mesaje": erori}), 400

    nume_final    = date_noi['nume'].strip().capitalize()
    prenume_final = date_noi['prenume'].strip().capitalize()

    try:
        data_sql = f"{an}-{int(luna):02d}-01"
        conn   = get_db_connection()
        cursor = conn.cursor()
        sql = """INSERT INTO angajati
                 (nume, prenume, cnp, email, telefon, data_angajare, id_departament, id_pozitie, salariu_curent)
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        cursor.execute(sql, (
            nume_final, prenume_final, cnp,
            email, tel, data_sql,
            date_noi['id_departament'], date_noi['id_pozitie'], date_noi['salariu_curent']
        ))
        conn.commit()
        return jsonify({"status": "succes", "mesaj": "Angajat salvat in baza de date!"}), 201

    except mysql.connector.Error as err: 
        if err.errno == 1062:
            err_str = str(err).lower()
            if "email" in err_str:
                return jsonify({"status": "eroare", "mesaj": "Acest email este deja utilizat."}), 400
            elif "cnp" in err_str:
                return jsonify({"status": "eroare", "mesaj": "Acest CNP este deja inregistrat."}), 400
            return jsonify({"status": "eroare", "mesaj": "CNP-ul sau Email-ul exista deja."}), 400
        if err.sqlstate == '45000':
            return jsonify({"status": "eroare_logica", "mesaj": err.msg}), 400
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()


@app.route('/api/angajati', methods=['GET'])
@jwt_required()
@rol_required('hr_specialist', 'hr_manager', 'director', 'ceo')
def toti_angajatii():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT a.*, d.nume AS nume_departament, p.titlu AS titlu_pozitie
            FROM angajati a
            LEFT JOIN departamente d ON a.id_departament = d.id_departament
            LEFT JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
        """)
        return jsonify(cursor.fetchall()), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected(): 
            cursor.close(); conn.close()


@app.route('/api/angajati/cauta', methods=['GET'])
@jwt_required()
@rol_required('hr_specialist', 'hr_manager', 'director', 'ceo')
def cauta_angajati():
    termen = request.args.get('termen', '').strip()
    if not termen:
        return jsonify({"status": "eroare", "mesaj": "Introdu un nume sau un ID."}), 400
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        if termen.isdigit():
            cursor.execute("""
                SELECT a.*, d.nume AS nume_departament, p.titlu AS titlu_pozitie
                FROM angajati a
                LEFT JOIN departamente d ON a.id_departament = d.id_departament
                LEFT JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
                WHERE a.id_angajat = %s
            """, (termen,))
        else:
            val = f"%{termen}%"
            cursor.execute("""
                SELECT a.*, d.nume AS nume_departament, p.titlu AS titlu_pozitie
                FROM angajati a
                LEFT JOIN departamente d ON a.id_departament = d.id_departament
                LEFT JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
                WHERE a.nume LIKE %s OR a.prenume LIKE %s OR a.email LIKE %s
            """, (val, val, val))
        return jsonify({"status": "succes", "rezultate": cursor.fetchall()}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()


@app.route('/api/angajati/arhiva', methods=['GET'])
@jwt_required()
@rol_required('hr_manager', 'ceo')
def get_arhiva_angajati():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT a.*, d.nume AS nume_departament, p.titlu AS titlu_pozitie
            FROM angajati a
            LEFT JOIN departamente d ON a.id_departament = d.id_departament
            LEFT JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
            WHERE a.status = 'inactiv'
            ORDER BY a.nume ASC
        """)
        arhiva = cursor.fetchall()
        return jsonify({"status": "succes", "numar_fosti_angajati": len(arhiva), "date": arhiva}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()

@app.route('/api/director/arhiva', methods=['GET'])
@jwt_required()
def get_arhiva_director():
    """Angajatii inactivi din orasul directorului"""
    id_utilizator = get_jwt_identity()
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # gasim orasul directorului
        cursor.execute("""
            SELECT d.locatie FROM utilizatori u
            JOIN angajati a     ON u.id_angajat     = a.id_angajat
            JOIN departamente d ON a.id_departament = d.id_departament
            WHERE u.id_utilizator = %s
        """, (id_utilizator,))
        row = cursor.fetchone()
        if not row:
            return jsonify([]), 200
        oras = row['locatie']
        cursor.execute("""
            SELECT a.*, d.nume AS nume_departament,
                   p.titlu AS titlu_pozitie
            FROM angajati a
            JOIN departamente d ON a.id_departament = d.id_departament
            JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
            WHERE a.status = 'inactiv'
              AND d.locatie = %s
            ORDER BY a.nume ASC
        """, (oras,))
        arhiva = cursor.fetchall()
        return jsonify({
            "status": "succes",
            "numar_fosti_angajati": len(arhiva),
            "date": arhiva
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals(): conn.close() 

@app.route('/api/angajati/filtrare', methods=['GET'])
@jwt_required()
@rol_required('hr_specialist', 'hr_manager', 'director', 'ceo')
def get_angajati_filtrati():
    try:
        departament = request.args.get('departament')
        pozitie     = request.args.get('pozitie')
        status      = request.args.get('status')
        sortare     = request.args.get('sortare', 'nume_asc')

        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT a.id_angajat, a.nume, a.prenume, a.email,
                   a.telefon, a.salariu_curent, a.status,
                   d.nume AS nume_departament,
                   p.titlu AS titlu_pozitie
            FROM angajati a
            JOIN departamente d ON a.id_departament = d.id_departament
            JOIN pozitii p ON a.id_pozitie = p.id_pozitie
            WHERE 1=1
        """
        params = []

        if departament:
            query += " AND a.id_departament = %s"
            params.append(departament)
        if pozitie:
            query += " AND a.id_pozitie = %s"
            params.append(pozitie)
        if status:
            query += " AND a.status = %s"
            params.append(status)

        order_map = {
            'nume_asc':    " ORDER BY a.nume ASC, a.prenume ASC",
            'nume_desc':   " ORDER BY a.nume DESC, a.prenume DESC",
            'departament': " ORDER BY d.nume ASC",
            'pozitie':     " ORDER BY p.titlu ASC",
        }
        query += order_map.get(sortare, " ORDER BY a.nume ASC")

        cursor.execute(query, tuple(params))
        rezultate = cursor.fetchall()
        return jsonify({"status": "succes", "total": len(rezultate), "angajati": rezultate}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()

@app.route('/api/angajati/marire', methods=['POST'])
@jwt_required()
@rol_required('hr_manager', 'ceo')
def acorda_marire():
    date      = request.get_json()
    id_angajat = date.get('id_angajat')
    procent   = date.get('procent')
    motiv     = date.get('motiv', 'Marire salariala curenta')

    if id_angajat is None or procent is None:
        return jsonify({"status": "eroare", "mesaj": "Lipsesc id_angajat sau procent."}), 400
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.callproc('proc_marire_salariu', [int(id_angajat), float(procent), motiv])
        conn.commit()
        return jsonify({"status": "succes", "mesaj": f"Marire de {procent}% aplicata."}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()


@app.route('/api/angajati/profil/<int:id>', methods=['GET'])
@jwt_required()
def get_profil_complet(id):
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        #Extragere date de bază profil
        cursor.execute("""
            SELECT a.*, d.nume as departament, p.titlu as functie,
                   p.salariu_min, p.salariu_max,
                   CONCAT(m.nume, ' ', m.prenume) as nume_manager
            FROM angajati a
            JOIN departamente d ON a.id_departament = d.id_departament
            JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
            LEFT JOIN angajati m ON a.id_manager = m.id_angajat
            WHERE a.id_angajat = %s
        """, (id,))
        profil = cursor.fetchone()
        
        if not profil:
            return jsonify({"status": "eroare", "mesaj": "Angajat negasit"}), 404

        #Calcul Compa-Ratio (Analiză piață)
        salariu       = float(profil['salariu_curent'])
        medie         = (float(profil['salariu_min']) + float(profil['salariu_max'])) / 2
        compa_procent = (salariu / medie) * 100

        if compa_procent < 80:
            status_grila = "Subdeplătit (Risc churn mare)"
        elif 80 <= compa_procent <= 120:
            status_grila = "În grilă"
        else:
            status_grila = "Peste grilă"

        #Calcul salarii prin procedura stocată
        cursor.callproc('proc_calcul_salariu_net', [id])
        
        date_salariu = {}
        for result in cursor.stored_results():
            row = result.fetchone()
            if row:
                date_salariu = row 

        #Adăugăm obiectul de analiză a pieței în dicționarul profilului
        profil['analiza_piata'] = {
            "compa_ratio": f"{round(compa_procent, 2)}%",
            "pozitie_grila": status_grila,
            "salariu_brut": date_salariu.get('salariu_brut'),
            "retinere_cas": date_salariu.get('retinere_cas'),
            "retinere_cass": date_salariu.get('retinere_cass'),
            "retinere_impozit": date_salariu.get('retinere_impozit'),
            "total_beneficii": date_salariu.get('total_beneficii'),
            "salariu_net_calculat": date_salariu.get('salariu_net')
        }

        while cursor.nextset():
            pass

        #Extragere istoric salarial
        cursor.execute("SELECT * FROM istoric_salarial WHERE id_angajat = %s ORDER BY data_modificare DESC", (id,))
        profil['istoric_salarii'] = cursor.fetchall()

        #Extragere evaluări profesionale
        cursor.execute("""
            SELECT id_evaluare, id_evaluator, data_evaluare,
                   scor_tehnic, scor_comunicare, scor_leadership, scor_final, feedback
            FROM evaluari WHERE id_angajat = %s ORDER BY data_evaluare DESC
        """, (id,))
        profil['evaluari'] = cursor.fetchall()

        #Extragere proiecte active
        cursor.execute("""
            SELECT DISTINCT p.id_proiect, p.nume, ap.rol_proiect, ap.ore_alocate
            FROM alocari_proiecte ap
            JOIN proiecte p ON ap.id_proiect = p.id_proiect
            WHERE ap.id_angajat = %s AND p.status = 'in desfasurare'
        """, (id,))
        profil['proiecte'] = cursor.fetchall()

        return jsonify(profil), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        
    finally:
        if 'conn' in locals(): 
            conn.close()


@app.route('/api/angajati/<int:id>', methods=['PUT'])
@jwt_required()
@rol_required('hr_manager', 'ceo')
def actualizeaza_angajat(id):
    date_update = request.get_json()
    if not date_update:
        return jsonify({"status": "eroare", "mesaj": "Nu s-au trimis date."}), 400
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id_angajat FROM angajati WHERE id_angajat = %s", (id,))
        if not cursor.fetchone():
            return jsonify({"status": "eroare", "mesaj": "Angajatul nu a fost gasit."}), 404

        campuri_permise = ['nume', 'prenume', 'email', 'telefon', 'salariu_curent', 'id_departament', 'id_pozitie']
        campuri = []; valori = []
        for cheie, valoare in date_update.items():
            if cheie in campuri_permise:
                if cheie in ['nume', 'prenume']:
                    valoare = str(valoare).strip().capitalize()
                elif cheie == 'email':
                    valoare = str(valoare).strip().lower()
                campuri.append(f"{cheie} = %s")
                valori.append(valoare)

        if not campuri:
            return jsonify({"status": "eroare", "mesaj": "Niciun camp valid."}), 400

        valori.append(id)
        cursor.execute(f"UPDATE angajati SET {', '.join(campuri)} WHERE id_angajat = %s", tuple(valori))
        conn.commit()
        return jsonify({"status": "succes", "mesaj": f"Angajat {id} actualizat."}), 200
    except mysql.connector.Error as err:
        if err.sqlstate == '45000':
            return jsonify({"status": "eroare_logica_db", "mesaj": err.msg}), 400
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()


@app.route('/api/angajati/<int:id>', methods=['DELETE'])
@jwt_required()
@rol_required('hr_manager', 'ceo')
def sterge_angajat(id):
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("UPDATE angajati SET status = 'inactiv' WHERE id_angajat = %s", (id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"status": "eroare", "mesaj": "Angajatul nu a fost gasit."}), 404
        return jsonify({"status": "succes", "mesaj": f"Angajat {id} trecut in inactiv."}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()


@app.route('/api/angajati/beneficii', methods=['GET'])
@jwt_required()
@rol_required('hr_specialist', 'hr_manager', 'ceo')
def get_beneficii_angajati():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT ba.id_angajat, a.nume AS nume_angajat, a.prenume AS prenume_angajat,
                   b.id_beneficiu, b.nume AS nume_beneficiu, b.descriere AS descriere_beneficiu,
                   b.valoare AS valoare_beneficiu, ba.data_acordare
            FROM beneficii_angajati ba
            JOIN angajati a  ON ba.id_angajat  = a.id_angajat
            JOIN beneficii b ON ba.id_beneficiu = b.id_beneficiu
            ORDER BY a.nume ASC, b.nume ASC
        """)
        lista = cursor.fetchall()
        return jsonify({"status": "succes", "total_beneficii_alocate": len(lista), "date_beneficii": lista}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


# ── STATISTICI ───────────────────────────────────────────────────────────────

@app.route('/api/statistici', methods=['GET'])
@jwt_required()
@rol_required('hr_manager', 'director', 'ceo')
def get_stats():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT COUNT(*) as total_angajati,
                   ROUND(AVG(salariu_curent), 2) as salariu_mediu,
                   SUM(salariu_curent) as buget_total_salarii,
                   MAX(salariu_curent) as salariu_maxim,
                   MIN(salariu_curent) as salariu_minim
            FROM angajati WHERE status = 'activ'
        """)
        return jsonify({"status": "succes", "date_statistice": cursor.fetchone()}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


@app.route('/api/statistici/departament/<int:id_dept>', methods=['GET'])
@jwt_required()
@rol_required('hr_manager', 'director', 'ceo')
def get_raport_departament(id_dept):
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.callproc('proc_raport_salarii_departament', [id_dept])
        date_raport = []
        for result in cursor.stored_results():
            date_raport.extend(result.fetchall())
        while cursor.nextset():
            pass
        return jsonify({"status": "succes", "id_departament": id_dept, "date_raport": date_raport}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


# ── CONCEDII ─────────────────────────────────────────────────────────────────

@app.route('/api/concedii', methods=['GET'])
@jwt_required()
@rol_required('hr_manager', 'team_leader', 'director', 'ceo')
def get_concedii_in_asteptare():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.id_concediu, c.id_angajat,
                   a.nume AS nume_angajat, a.prenume AS prenume_angajat,
                   a.email AS email_angajat, c.tip AS tip_concediu,
                   c.data_start, c.data_sfarsit,
                   DATEDIFF(c.data_sfarsit, c.data_start) + 1 AS numar_zile,
                   c.status, c.id_aprobator,
                   m.nume AS nume_aprobator, m.prenume AS prenume_aprobator
            FROM concedii c
            JOIN angajati a   ON c.id_angajat  = a.id_angajat
            LEFT JOIN angajati m ON c.id_aprobator = m.id_angajat
            WHERE c.status = 'in asteptare'
            ORDER BY c.data_start ASC
        """)
        cereri = cursor.fetchall()
        return jsonify({"status": "succes", "total_cereri_in_asteptare": len(cereri), "date_concedii": cereri}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()

@app.route('/api/angajati/schimbare-parola', methods=['POST'])
@jwt_required()
def schimbare_parola():
    date = request.get_json()
    id_utilizator = date.get('id_angajat')  # ID-ul angajatului/utilizatorului
    parola_veche = date.get('parola_veche')
    parola_noua = date.get('parola_noua')

    # Verificăm ca toate cele 3 elemente necesare procedurii să fie prezente
    if id_utilizator is None or not parola_veche or not parola_noua:
        return jsonify({
            "status": "eroare", 
            "mesaj": "Lipsesc date esentiale (id_angajat, parola_veche sau parola_noua)."
        }), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Aliniere perfectă la argumentele din baza
        cursor.callproc('proc_schimbare_parola', [int(id_utilizator), str(parola_veche), str(parola_noua)])
        conn.commit()

        return jsonify({
            "status": "succes", 
            "mesaj": f"Parola pentru utilizatorul cu ID {id_utilizator} a fost modificată cu succes."
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()

@app.route('/api/angajati/dezactivare', methods=['POST'])
@jwt_required()
@rol_required('hr_manager', 'ceo')
def dezactivare_cont():
    date = request.get_json()
    id_angajat = date.get('id_angajat')
    
    motiv = date.get('motiv', 'Dezactivare administrativa cont')

    if id_angajat is None:
        return jsonify({"status": "eroare", "mesaj": "Lipseste ID-ul angajatului (id_angajat)."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.callproc('proc_dezactivare_cont', [int(id_angajat), str(motiv)])
        conn.commit()

        return jsonify({
            "status": "succes", 
            "mesaj": f"Contul angajatului cu ID {id_angajat} a fost dezactivat. Motiv: {motiv}"
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()

@app.route('/api/concedii/istoric', methods=['GET'])
@jwt_required()
@rol_required('hr_specialist', 'hr_manager', 'team_leader', 'director', 'ceo')
def get_istoric_concedii():
    identity = get_jwt_identity()
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Luăm mai întâi id_angajat pe baza tokenului
        cursor.execute("SELECT id_angajat FROM utilizatori WHERE id_utilizator = %s", (identity,))
        user_row = cursor.fetchone()
        if not user_row:
            return jsonify({"status": "eroare", "mesaj": "Angajat negasit."}), 404
            
        id_angajat = user_row['id_angajat']

        # Selectăm istoricul cererilor de concediu
        cursor.execute("""
            SELECT id_concediu, tip_concediu, data_inceput, data_sfarsit, status, comentarii
            FROM concedii 
            WHERE id_angajat = %s 
            ORDER BY data_inceput DESC
        """, (id_angajat,))
        
        concedii = cursor.fetchall()
        return jsonify(concedii), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/concedii/cerere', methods=['POST'])
@jwt_required()
def adauga_concediu():
    identity = get_jwt_identity()
    data = request.get_json()
    
    tip_concediu = data.get('tip_concediu')
    data_inceput = data.get('data_inceput')
    data_sfarsit = data.get('data_sfarsit')
    comentarii   = data.get('comentarii', '')

    if not tip_concediu or not data_inceput or not data_sfarsit:
        return jsonify({"status": "eroare", "mesaj": "Campuri obligatorii lipsa."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Aflăm id_angajat ȘI id_manager-ul lui direct din baza de date
        cursor.execute("""
            SELECT id_angajat, id_manager 
            FROM angajati 
            WHERE id_angajat = (SELECT id_angajat FROM utilizatori WHERE id_utilizator = %s)
        """, (identity,))
        user_data = cursor.fetchone()

        if not user_data:
            return jsonify({"status": "eroare", "mesaj": "Utilizator sau angajat negasit."}), 404

        id_angajat = user_data['id_angajat']
        id_manager_aprobator = user_data['id_manager'] # Backend-ul îl preia automat!

        # Dacă angajatul nu are manager (e CEO-ul / directorul general), aprobatorul este el însuși
        if not id_manager_aprobator:
            id_manager_aprobator = id_angajat

        # Inserăm cererea de concediu cu managerul corect setat în siguranță
        cursor.execute("""
            INSERT INTO concedii (id_angajat, tip_concediu, data_inceput, data_sfarsit, status, id_manager_aprobator, comentarii)
            VALUES (%s, %s, %s, %s, 'in_asteptare', %s, %s)
        """, (id_angajat, tip_concediu, data_inceput, data_sfarsit, id_manager_aprobator, comentarii))
        
        conn.commit()
        return jsonify({"status": "succes", "mesaj": "Cererea de concediu a fost inregistrata."}), 201

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/concedii/decizie/<int:id_concediu>', methods=['PUT'])
@jwt_required()
@rol_required('hr_manager', 'team_leader', 'ceo', 'director')
def decide_concediu(id_concediu):
    date                   = request.get_json()
    nou_status             = date.get('status')
    id_manager_care_aproba = date.get('id_manager')

    if nou_status not in ['aprobat', 'respins']:
        return jsonify({"status": "eroare", "mesaj": "Status invalid. Folositi 'aprobat' sau 'respins'."}), 400
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT id_aprobator, status FROM concedii WHERE id_concediu = %s", (id_concediu,))
        concediu = cursor.fetchone()
        if not concediu:
            return jsonify({"status": "eroare", "mesaj": "Cererea nu a fost gasita."}), 404
        if concediu['id_aprobator'] != id_manager_care_aproba:
            return jsonify({"status": "eroare", "mesaj": "Nu aveti permisiunea de a aproba aceasta cerere."}), 403

        cursor.execute("UPDATE concedii SET status = %s WHERE id_concediu = %s", (nou_status, id_concediu))
        cursor.execute("SELECT id_angajat FROM concedii WHERE id_concediu = %s", (id_concediu,))
        id_ang = cursor.fetchone()['id_angajat']
        cursor.execute(
            "INSERT INTO notificari (id_angajat, tip, mesaj) VALUES (%s, 'concediu', %s)",
            (id_ang, f"Cererea ta de concediu a fost {nou_status}.")
        )
        conn.commit()
        return jsonify({"status": "succes", "mesaj": f"Concediul a fost {nou_status}."}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()


@app.route('/api/concedii/istoric-grupare', methods=['GET'])
@jwt_required()
@rol_required('hr_specialist', 'hr_manager', 'team_leader', 'director', 'ceo')
def get_istoric_concedii_avansat():
    try:
        id_angajat     = request.args.get('id_angajat')
        id_departament = request.args.get('id_departament')
        id_manager     = request.args.get('id_manager')

        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query  = """
            SELECT c.*, a.nume, a.prenume, a.id_departament, c.id_aprobator
            FROM concedii c JOIN angajati a ON c.id_angajat = a.id_angajat WHERE 1=1
        """
        params = []
        if id_angajat:     query += " AND c.id_angajat = %s";     params.append(id_angajat)
        if id_departament: query += " AND a.id_departament = %s"; params.append(id_departament)
        if id_manager:     query += " AND c.id_aprobator = %s";   params.append(id_manager)
        query += " ORDER BY c.data_start DESC"
        cursor.execute(query, tuple(params))
        return jsonify({"status": "succes", "date_concedii": cursor.fetchall()}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


# ── EVALUARI ─────────────────────────────────────────────────────────────────

@app.route('/api/evaluari', methods=['POST'])
@jwt_required()
@rol_required('team_leader', 'project_manager', 'hr_manager', 'ceo')
def adauga_evaluare():
    identity = get_jwt_identity() 
    data = request.get_json()

    id_angajat      = data.get('id_angajat') 
    scor_tehnic     = data.get('scor_tehnic')
    scor_comunicare = data.get('scor_comunicare')
    scor_leadership = data.get('scor_leadership')
    feedback        = data.get('feedback', '')

    # Validare simplă a câmpurilor obligatorii
    if not id_angajat or scor_tehnic is None or scor_comunicare is None or scor_leadership is None:
        return jsonify({"status": "eroare", "mesaj": "Toate scorurile si id_angajat sunt obligatorii."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 1. Aflăm id_angajat-ul MANAGERULUI (cel care evaluează) din tabela utilizatori
        cursor.execute("SELECT id_angajat FROM utilizatori WHERE id_utilizator = %s", (identity,))
        evaluator_row = cursor.fetchone()
        
        if not evaluator_row:
            return jsonify({"status": "eroare", "mesaj": "Contul evaluatorului nu a fost gasit."}), 404
            
        id_evaluator = evaluator_row['id_angajat']

        # 2. Calculăm scorul final ca medie aritmetică simplă a celor 3 note
        scor_final = round((float(scor_tehnic) + float(scor_comunicare) + float(scor_leadership)) / 3, 2)

        # 3. Inserăm evaluarea în baza de date cu data curentă automată
        cursor.execute("""
            INSERT INTO evaluari (id_angajat, id_evaluator, data_evaluare, scor_tehnic, scor_comunicare, scor_leadership, scor_final, feedback)
            VALUES (%s, %s, NOW(), %s, %s, %s, %s, %s)
        """, (id_angajat, id_evaluator, scor_tehnic, scor_comunicare, scor_leadership, scor_final, feedback))
        
        conn.commit()
        return jsonify({
            "status": "succes", 
            "mesaj": "Evaluarea a fost salvata cu succes.",
            "scor_final": scor_final
        }), 201

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    except ValueError:
        return jsonify({"status": "eroare", "mesaj": "Scorurile trebuie să fie numere valide."}), 400
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/evaluari', methods=['GET'])
@jwt_required()
def get_evaluari():
    id_utilizator = get_jwt_identity()
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id_angajat FROM utilizatori WHERE id_utilizator = %s", (id_utilizator,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Angajat negasit"}), 404
        cursor.execute("""
            SELECT data_evaluare, scor_tehnic, scor_comunicare, scor_leadership, scor_final, feedback
            FROM evaluari WHERE id_angajat = %s ORDER BY data_evaluare DESC
        """, (row['id_angajat'],))
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals(): conn.close()

@app.route('/api/management/arhiva-evaluari', methods=['GET'])
@jwt_required()
@rol_required('hr_manager', 'director', 'ceo')
def get_arhiva_evaluari():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT e.id_evaluare, e.id_angajat,
                   a.nume AS nume_angajat, a.prenume AS prenume_angajat,
                   e.data_evaluare, e.scor_tehnic, e.scor_comunicare,
                   e.scor_leadership, e.scor_final, e.feedback, e.id_evaluator,
                   m.nume AS nume_evaluator, m.prenume AS prenume_evaluator
            FROM evaluari e
            JOIN angajati a     ON e.id_angajat  = a.id_angajat
            LEFT JOIN angajati m ON e.id_evaluator = m.id_angajat 
            ORDER BY e.data_evaluare DESC
            LIMIT 500
        """)
        arhiva = cursor.fetchall()
        return jsonify({"status": "succes", "total_evaluari": len(arhiva), "date_evaluari": arhiva}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


# ── DEPARTAMENTE ─────────────────────────────────────────────────────────────

@app.route('/api/departamente', methods=['GET', 'POST'])
@jwt_required()
def gestionare_departamente():
    identity = get_jwt_identity()
    info = get_rol_si_locatie(identity)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'GET':
        # app_readonly si team_leader vad doar departamentul lor
        if info['rol'] in ('app_readonly', 'team_leader'):
            cursor.execute("""
                SELECT d.* FROM departamente d
                JOIN angajati a ON a.id_departament = d.id_departament
                JOIN utilizatori u ON u.id_angajat = a.id_angajat
                WHERE u.id_utilizator = %s
            """, (identity,))
        else:
            cursor.execute("SELECT * FROM departamente ORDER BY nume")
        
        departamente = cursor.fetchall()
        conn.close()
        return jsonify(departamente), 200

    if request.method == 'POST':
        # Doar hr_manager si ceo pot crea
        if info['rol'] not in ('hr_manager', 'ceo'):
            return jsonify({"status": "eroare_acces", "mesaj": "Nu aveti permisiunea de a crea departamente."}), 403
        
        date = request.get_json()
        nume = date.get('nume')
        if not nume:
            return jsonify({"status": "eroare", "mesaj": "Numele departamentului este obligatoriu"}), 400

        try:
            cursor.execute("INSERT INTO departamente (nume, descriere) VALUES (%s, %s)", 
                         (nume, date.get('descriere', '')))
            conn.commit()
            return jsonify({"status": "succes", "mesaj": "Departament creat"}), 201
        except mysql.connector.Error as err:
            return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        finally:
            conn.close()

@app.route('/api/departamente/sinteza', methods=['GET'])
@jwt_required()
@rol_required('hr_specialist', 'hr_manager', 'director', 'ceo')
def get_sinteza_departamente():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT d.id_departament, d.nume AS nume_departament, 
                   d.locatie,
                   COUNT(a.id_angajat) AS numar_angajati
            FROM departamente d 
            LEFT JOIN angajati a ON d.id_departament = a.id_departament
            GROUP BY d.id_departament
            ORDER BY d.nume ASC
        """)
        departamente = cursor.fetchall()

        for dep in departamente:
            # Angajati cu nume pozitie
            cursor.execute("""
                SELECT a.id_angajat, a.nume, a.prenume, 
                       p.titlu AS pozitie, a.status
                FROM angajati a
                JOIN pozitii p ON a.id_pozitie = p.id_pozitie
                WHERE a.id_departament = %s
                ORDER BY a.nume ASC
            """, (dep['id_departament'],))
            angajati = cursor.fetchall()
            dep['angajati'] = angajati

            # Sinteza pozitii
            cursor.execute("""
                SELECT p.titlu AS pozitie, COUNT(*) AS nr_angajati
                FROM angajati a
                JOIN pozitii p ON a.id_pozitie = p.id_pozitie
                WHERE a.id_departament = %s
                GROUP BY p.titlu
                ORDER BY nr_angajati DESC
            """, (dep['id_departament'],))
            dep['pozitii_sinteza'] = cursor.fetchall()

            dep['numar_angajati_activi']  = len([a for a in angajati if a['status'] == 'activ'])
            dep['numar_angajati_inactivi'] = len([a for a in angajati if a['status'] == 'inactiv'])

        return jsonify({
            "status": "succes",
            "total_departamente": len(departamente),
            "departamente": departamente
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()

@app.route('/api/departamente/<int:id_departament>', methods=['GET'])
@jwt_required()
def get_departament(id_departament):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT d.*, 
                   a.nume AS nume_manager, 
                   a.prenume AS prenume_manager
            FROM departamente d
            LEFT JOIN manageri m ON d.id_manager = m.id_manager
            LEFT JOIN angajati a ON m.id_angajat = a.id_angajat
            WHERE d.id_departament = %s
        """, (id_departament,))
        departament = cursor.fetchone()

        if not departament:
            return jsonify({"status": "eroare", "mesaj": "Departamentul nu a fost gasit."}), 404

        cursor.execute("""
            SELECT a.id_angajat, a.nume, a.prenume, 
                   a.email, p.titlu AS pozitie, a.status
            FROM angajati a
            JOIN pozitii p ON a.id_pozitie = p.id_pozitie
            WHERE a.id_departament = %s
            ORDER BY a.nume ASC
        """, (id_departament,))
        departament['angajati'] = cursor.fetchall()
        departament['total_angajati'] = len(departament['angajati'])

        return jsonify(departament), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()


# ── POZITII ──────────────────────────────────────────────────────────────────

@app.route('/api/pozitii', methods=['GET', 'POST'])
@jwt_required()
@rol_required('hr_specialist', 'hr_manager', 'director', 'ceo', 'project_manager')
def gestionare_pozitii():
    identity = get_jwt_identity()
    info = get_rol_si_locatie(identity)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'GET':
        cursor.execute("SELECT * FROM pozitii")
        pozitii = cursor.fetchall()
        conn.close()
        return jsonify(pozitii), 200

    if request.method == 'POST':
        if info['rol'] not in ('hr_manager', 'director', 'ceo'):
            return jsonify({"status": "eroare_acces", "mesaj": "Nu aveti permisiunea de a crea pozitii."}), 403

        date = request.get_json()
        titlu = date.get('titlu')
        id_dept = date.get('id_departament')
        s_min = float(date.get('salariu_min', 0))
        s_max = float(date.get('salariu_max', 0))

        if s_min >= s_max:
            return jsonify({
                "status": "eroare",
                "mesaj": "Salariul minim trebuie sa fie mai mic decat cel maxim."
            }), 400

        try:
            cursor.execute(
                "INSERT INTO pozitii (titlu, id_departament, salariu_min, salariu_max) VALUES (%s, %s, %s, %s)",
                (titlu, id_dept, s_min, s_max)
            )
            conn.commit()
            return jsonify({"status": "succes", "mesaj": "Pozitie adaugata in grila salariala"}), 201
        except mysql.connector.Error as err:
            return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        finally:
            conn.close()

# ── PROIECTE ─────────────────────────────────────────────────────────────────

@app.route('/api/proiecte', methods=['GET', 'POST'])
@jwt_required()
def gestionare_proiecte():
    identity = get_jwt_identity()
    info = get_rol_si_locatie(identity)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'GET':
        # app_readonly si team_leader: proiectele din departamentul lor, fara buget
        if info['rol'] in ('app_readonly', 'team_leader'):
            cursor.execute("""
                SELECT DISTINCT p.id_proiect, p.nume, p.descriere, 
                       p.data_start, p.data_sfarsit, p.status
                FROM proiecte p
                JOIN alocari_proiecte ap ON ap.id_proiect = p.id_proiect
                JOIN angajati a ON ap.id_angajat = a.id_angajat
                JOIN utilizatori u ON u.id_angajat = a.id_angajat
                WHERE a.id_departament = (
                    SELECT a2.id_departament FROM angajati a2
                    JOIN utilizatori u2 ON u2.id_angajat = a2.id_angajat
                    WHERE u2.id_utilizator = %s
                )
            """, (identity,))

        # director: proiectele din orasul lui, fara buget
        elif info['rol'] == 'director':
            cursor.execute("""
                SELECT DISTINCT p.id_proiect, p.nume, p.descriere,
                       p.data_start, p.data_sfarsit, p.status
                FROM proiecte p
                JOIN alocari_proiecte ap ON ap.id_proiect = p.id_proiect
                JOIN angajati a ON ap.id_angajat = a.id_angajat
                JOIN departamente d ON a.id_departament = d.id_departament
                WHERE d.locatie = %s
            """, (info['locatie'],))

        else:
            cursor.execute("SELECT * FROM proiecte ORDER BY data_start DESC")

        proiecte = cursor.fetchall()
        conn.close()
        return jsonify(proiecte), 200

    if request.method == 'POST':
        if info['rol'] not in ('project_manager', 'hr_manager', 'ceo'):
            return jsonify({"status": "eroare_acces", "mesaj": "Nu aveti permisiunea de a crea proiecte."}), 403

        date = request.get_json()
        try:
            cursor.execute("""
                INSERT INTO proiecte (nume, descriere, data_start, data_sfarsit, status, buget)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (date['nume'], date['descriere'], date['data_start'],
                  date['data_sfarsit'], date['status'], date['buget']))
            conn.commit()
            return jsonify({"status": "succes", "mesaj": "Proiect creat cu succes"}), 201
        except Exception as e:
            return jsonify({"status": "eroare", "detalii": str(e)}), 400
        finally:
            conn.close()

@app.route('/api/proiecte/<int:id_proiect>', methods=['GET'])
@jwt_required()
def get_proiect(id_proiect):
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM proiecte WHERE id_proiect = %s", (id_proiect,))
        proiect = cursor.fetchone()
        if not proiect:
            return jsonify({"status": "eroare", "mesaj": "Proiectul nu a fost gasit."}), 404

        cursor.execute("""
            SELECT a.id_angajat, a.nume, a.prenume, 
                   p.titlu AS pozitie,
                   ap.rol_proiect, ap.ore_alocate
            FROM alocari_proiecte ap
            JOIN angajati a ON ap.id_angajat = a.id_angajat
            JOIN pozitii p ON a.id_pozitie = p.id_pozitie
            WHERE ap.id_proiect = %s
            ORDER BY a.nume ASC
        """, (id_proiect,))
        proiect['angajati'] = cursor.fetchall()
        proiect['total_angajati'] = len(proiect['angajati'])

        return jsonify(proiect), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()


@app.route('/api/proiecte/ale-mele', methods=['GET'])
@jwt_required()
def get_proiectele_mele():
    id_utilizator = get_jwt_identity()
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id_angajat FROM utilizatori WHERE id_utilizator = %s", (id_utilizator,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Angajat negasit"}), 404
        cursor.execute("""
            SELECT p.id_proiect, p.nume, p.descriere, p.status,
                   p.data_start, p.data_sfarsit, p.buget, ap.rol_proiect, ap.ore_alocate
            FROM alocari_proiecte ap JOIN proiecte p ON ap.id_proiect = p.id_proiect
            WHERE ap.id_angajat = %s ORDER BY p.data_start DESC
        """, (row['id_angajat'],))
        return jsonify({"status": "succes", "proiecte": cursor.fetchall()}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()


# ── ALOCARI PROIECTE ─────────────────────────────────────────────────────────

@app.route('/api/alocari-proiecte/<int:id_angajat>', methods=['GET'])
@jwt_required()
@rol_required('project_manager', 'hr_manager', 'ceo')
def get_alocari_angajat(id_angajat):
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT ap.id_alocare, ap.id_angajat, ap.id_proiect,
                   p.nume AS nume_proiect, ap.rol_proiect, ap.ore_alocate,
                   ap.data_start AS data_start_alocare,
                   ap.data_sfarsit AS data_sfarsit_alocare,
                   p.buget AS buget_proiect
            FROM alocari_proiecte ap JOIN proiecte p ON ap.id_proiect = p.id_proiect
            WHERE ap.id_angajat = %s ORDER BY ap.data_start DESC
        """, (id_angajat,))
        alocari = cursor.fetchall()
        return jsonify({"status": "succes", "total_alocari": len(alocari), "date_alocari": alocari}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


@app.route('/api/alocari-proiecte', methods=['POST'])
@jwt_required()
@rol_required('project_manager', 'hr_manager', 'ceo')
def adauga_alocare_proiect():
    try:
        data       = request.get_json()
        id_angajat = data.get('id_angajat')
        id_proiect = data.get('id_proiect')
        if not id_angajat or not id_proiect:
            return jsonify({"status": "eroare", "mesaj": "Lipsesc id_angajat sau id_proiect."}), 400
        conn   = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO alocari_proiecte (id_angajat, id_proiect, rol_proiect, ore_alocate, data_start, data_sfarsit)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (id_angajat, id_proiect, data.get('rol_proiect', 'Membru Echipa'),
              data.get('ore_alocate', 8), data.get('data_start'), data.get('data_sfarsit')))
        conn.commit()
        return jsonify({"status": "succes", "mesaj": "Alocare creata.", "id_alocare_generat": cursor.lastrowid}), 201
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()

@app.route('/api/alocari-proiecte/<int:id_alocare>', methods=['DELETE'])
@jwt_required()
@rol_required('project_manager', 'hr_manager', 'ceo')
def sterge_alocare_proiect(id_alocare):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "DELETE FROM alocari_proiecte WHERE id_alocare = %s"
        cursor.execute(query, (id_alocare,))
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"status": "eroare", "mesaj": f"Alocarea cu ID {id_alocare} nu a fost gasita."}), 404
            
        return jsonify({
            "status": "succes", 
            "mesaj": f"Alocarea cu ID {id_alocare} a fost eliminata cu succes."
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()


# ── BENEFICII ────────────────────────────────────────────────────────────────

@app.route('/api/beneficii', methods=['GET', 'POST'])
@jwt_required()
def gestionare_beneficii():
    identity = get_jwt_identity()
    info = get_rol_si_locatie(identity)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'GET':
        # Toți utilizatorii logați pot vedea lista de beneficii
        try:
            cursor.execute("SELECT * FROM beneficii ORDER BY nume")
            beneficii = cursor.fetchall()
            return jsonify(beneficii), 200
        except mysql.connector.Error as err:
            return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        finally:
            conn.close()

    if request.method == 'POST':
        # Doar hr_manager și ceo pot adăuga beneficii noi
        if info['rol'] not in ('hr_manager', 'ceo'):
            conn.close()
            return jsonify({
                "status": "eroare_acces",
                "mesaj": "Nu aveti permisiunea de a adauga beneficii."
            }), 403

        date = request.get_json()
        nume = date.get('nume')
        descriere = date.get('descriere', '')
        valoare = date.get('valoare')

        if not nume or not valoare:
            conn.close()
            return jsonify({
                "status": "eroare",
                "mesaj": "Numele si valoarea beneficiului sunt obligatorii."
            }), 400

        try:
            cursor.execute(
                "INSERT INTO beneficii (nume, descriere, valoare) VALUES (%s, %s, %s)",
                (nume, descriere, valoare)
            )
            conn.commit()
            return jsonify({"status": "succes", "mesaj": "Beneficiu adaugat cu succes"}), 201
        except mysql.connector.Error as err:
            return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        finally:
            conn.close()

@app.route('/api/beneficii/statistici', methods=['GET'])
@jwt_required()
@rol_required('hr_specialist', 'hr_manager', 'ceo')
def get_beneficii_cu_statistici():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT b.id_beneficiu, b.nume, b.descriere, b.valoare,
                   COUNT(ba.id_angajat) AS total_angajati_beneficiari
            FROM beneficii b LEFT JOIN beneficii_angajati ba ON b.id_beneficiu = ba.id_beneficiu
            GROUP BY b.id_beneficiu
        """)
        return jsonify({"status": "succes", "beneficii": cursor.fetchall()}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


@app.route('/api/beneficii/acorda', methods=['POST'])
@jwt_required()
@rol_required('hr_manager', 'ceo')
def acorda_beneficiu_angajat():
    try:
        current_username = get_jwt_identity()
        data             = request.get_json()
        id_angajat       = data.get('id_angajat')
        id_beneficiu     = data.get('id_beneficiu')
        data_acordare    = data.get('data_acordare', '2026-05-19')

        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT rol FROM utilizatori WHERE username = %s OR id_utilizator = %s",
                       (current_username, current_username))
        user_cont = cursor.fetchone()
        if user_cont and user_cont['rol'] == 'user':
            return jsonify({"status": "eroare_privilegii", "mesaj": "Nu aveti permisiunea."}), 403
        if not id_angajat or not id_beneficiu:
            return jsonify({"status": "eroare", "mesaj": "Lipsesc id_angajat sau id_beneficiu."}), 400
        cursor.execute("INSERT INTO beneficii_angajati (id_angajat, id_beneficiu, data_acordare) VALUES (%s, %s, %s)",
                       (id_angajat, id_beneficiu, data_acordare))
        conn.commit()
        return jsonify({"status": "succes", "mesaj": "Beneficiu alocat."}), 201
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


# ── VIEWS PE ROL ─────────────────────────────────────────────────────────────

@app.route('/api/hr/angajati-view', methods=['GET'])
@jwt_required()
@rol_required('hr_specialist', 'hr_manager', 'ceo')
def get_angajati_hr_view():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM view_angajati_hr_specialist")
        lista = cursor.fetchall()
        return jsonify({"status": "succes", "total_inregistrari": len(lista), "date_angajati": lista}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


@app.route('/api/proiecte/angajati-view', methods=['GET'])
@jwt_required()
@rol_required('project_manager', 'hr_manager', 'ceo')
def get_angajati_proiecte_view():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM view_angajati_proiecte")
        date   = cursor.fetchall()
        return jsonify({"status": "succes", "total_legaturi": len(date), "date_proiecte": date}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


@app.route('/api/team-leader/angajati-view/<int:id_leader>', methods=['GET'])
@jwt_required()
@rol_required('team_leader', 'hr_manager', 'ceo')
def get_angajati_team_leader_view(id_leader):
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT a.id_angajat, a.nume, a.prenume, a.email, a.telefon,
                   a.salariu_curent, a.data_angajare,
                   d.nume AS nume_departament, p.titlu AS titlu_pozitie
            FROM angajati a
            JOIN manageri m     ON a.id_manager     = m.id_manager
            JOIN departamente d ON a.id_departament = d.id_departament
            JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
            WHERE m.id_angajat = %s
        """, (id_leader,))
        date = cursor.fetchall()
        return jsonify({"status": "succes", "total_membri_echipa": len(date), "date_echipa": date}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


@app.route('/api/manageri/subordonati-view', methods=['GET'])
@jwt_required()
@rol_required('hr_manager', 'ceo')
def get_subordonati_manageri_view():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM view_subordonati_manageri")
        date = cursor.fetchall()
        return jsonify({"status": "succes", "total_subordonati": len(date), "date_subordonati": date}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


# ── JWT / AUTENTIFICARE ───────────────────────────────────────────────────────

@app.route('/api/login', methods=['POST'])
def login():
    import bcrypt
    data     = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Username si parola sunt obligatorii"}), 400

    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # preluam utilizatorul dupa username, doar daca e activ
        cursor.execute("""
            SELECT u.id_utilizator, u.id_angajat, u.username, u.parola_hash, u.rol, u.activ,
                   a.nume, a.prenume
            FROM utilizatori u
            JOIN angajati a ON u.id_angajat = a.id_angajat
            WHERE u.username = %s AND u.activ = 1
        """, (username,))
        user = cursor.fetchone() 

        # utilizator negasit sau inactiv
        if not user:
            return jsonify({"msg": "Username sau parola incorecte"}), 401

        # verificam parola cu bcrypt
        parola_corecta = bcrypt.checkpw(
            password.encode('utf-8'),
            user['parola_hash'].encode('utf-8')
        )
        if not parola_corecta:
            return jsonify({"msg": "Username sau parola incorecte"}), 401

        # actualizam ultima autentificare
        cursor.execute(
            "UPDATE utilizatori SET ultima_autentificare = NOW() WHERE id_utilizator = %s",
            (user['id_utilizator'],)
        )
        conn.commit()
        cursor.close()
        conn.close()

        additional_claims = {
            'username': user['username'],
            'rol': user['rol'],
            'id_angajat': user['id_angajat'] 
            }

        token = create_access_token(
            identity=str(user['id_utilizator']),
            additional_claims=additional_claims
        )
        return jsonify({
            "token":   token,
            "success": True,
            "rol":     user['rol'],
            "username": user['username'],
            "nume":    user['nume'],
            "prenume": user['prenume'],
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/utilizatori/profil-meu', methods=['GET'])
@jwt_required()
def get_profil_meu_utilizator():
    try:
        identity = get_jwt_identity()
        conn     = get_db_connection()
        cursor   = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.id_utilizator, u.id_angajat, a.nume AS nume_real, a.prenume AS prenume_real,
                   u.username, u.rol, u.activ, u.ultima_autentificare
            FROM utilizatori u LEFT JOIN angajati a ON u.id_angajat = a.id_angajat
            WHERE u.id_utilizator = %s OR u.username = %s
        """, (identity, identity))
        user_data = cursor.fetchone()
        if not user_data:
            return jsonify({"status": "eroare", "mesaj": f"Utilizatorul '{identity}' nu exista."}), 404
        return jsonify({"status": "succes", "date_profil": user_data}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


@app.route('/api/manageri', methods=['GET'])
@jwt_required()
def get_manageri():
    id_utilizator = get_jwt_identity()
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id_angajat FROM utilizatori WHERE id_utilizator = %s", (id_utilizator,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Angajat negasit"}), 404
        cursor.execute("""
            SELECT m.id_manager, a2.nume AS nume_manager, a2.prenume AS prenume_manager
            FROM angajati a1
            JOIN manageri m  ON a1.id_manager = m.id_manager
            JOIN angajati a2 ON m.id_angajat  = a2.id_angajat
            WHERE a1.id_angajat = %s
        """, (row['id_angajat'],))
        manager = cursor.fetchone()
        if manager:
            return jsonify(manager), 200
        return jsonify({"msg": "Nu s-a gasit un manager asociat"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals(): conn.close()


@app.route('/api/istoric-salarial', methods=['GET'])
@jwt_required()
def get_istoric_salarial():
    id_utilizator = get_jwt_identity()
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id_angajat FROM utilizatori WHERE id_utilizator = %s", (id_utilizator,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Angajat negasit"}), 404
        cursor.execute("""
            SELECT data_modificare, salariu_vechi, salariu_nou, motiv
            FROM istoric_salarial WHERE id_angajat = %s ORDER BY data_modificare DESC
        """, (row['id_angajat'],))
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals(): conn.close()


@app.route('/api/notificari', methods=['GET']) 
@jwt_required()
def get_notificari():
    id_utilizator = get_jwt_identity()
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id_angajat FROM utilizatori WHERE id_utilizator = %s", (id_utilizator,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Angajat negasit"}), 404
        cursor.execute("""
            SELECT id_notificare, mesaj, data_creare, citita
            FROM notificari WHERE id_angajat = %s ORDER BY data_creare DESC
        """, (row['id_angajat'],))
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals(): conn.close()


@app.route('/api/notificari/marcheaza-citit', methods=['PUT'])
@jwt_required()
def marcheaza_notificari_citite():
    try:
        data          = request.get_json()
        id_notificare = data.get('id_notificare')
        id_angajat    = data.get('id_angajat')

        if not id_notificare and not id_angajat:
            return jsonify({"status": "eroare", "mesaj": "Lipseste id_notificare sau id_angajat."}), 400

        conn   = get_db_connection()
        cursor = conn.cursor()
        if id_notificare:
            cursor.execute("UPDATE notificari SET citita = 1 WHERE id_notificare = %s", (id_notificare,))
            mesaj = f"Notificarea {id_notificare} marcata citita."
        else:
            cursor.execute("UPDATE notificari SET citita = 1 WHERE id_angajat = %s", (id_angajat,))
            mesaj = f"Toate notificarile angajatului {id_angajat} marcate citite."
        conn.commit()
        return jsonify({"status": "succes", "mesaj": mesaj}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


# ── ML ───────────────────────────────────────────────────────────────────────

@app.route('/api/ml/comparatie', methods=['GET'])
@jwt_required()
@rol_required('hr_manager', 'director', 'ceo')
def get_ml_comparatie():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT rf.id_angajat,
                   rf.probabilitate AS prob_rf, lr.probabilitate AS prob_lr, xgb.probabilitate AS prob_xgb,
                   rf.nivel_risc AS risc_rf, lr.nivel_risc AS risc_lr, xgb.nivel_risc AS risc_xgb,
                   a.salariu_curent,
                   ROUND(DATEDIFF(CURDATE(), a.data_angajare) / 365, 2) AS vechime_ani,
                   p.titlu AS nivel_pozitie, d.nume AS departament
            FROM predictii_churn_rf rf
            JOIN predictii_churn_lr  lr  ON rf.id_angajat = lr.id_angajat
            JOIN predictii_churn_xgb xgb ON rf.id_angajat = xgb.id_angajat
            JOIN angajati a              ON rf.id_angajat = a.id_angajat
            JOIN pozitii p               ON a.id_pozitie  = p.id_pozitie
            JOIN departamente d          ON a.id_departament = d.id_departament
            ORDER BY rf.probabilitate DESC
        """)
        date = cursor.fetchall()
        return jsonify({"status": "succes", "date": date}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()


@app.route('/api/ml/statistici', methods=['GET'])
@jwt_required()
@rol_required('hr_manager', 'director', 'ceo')
def get_ml_statistici():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 'Random Forest' AS model,
                   SUM(CASE WHEN nivel_risc='Mare'  THEN 1 ELSE 0 END) AS mare,
                   SUM(CASE WHEN nivel_risc='Mediu' THEN 1 ELSE 0 END) AS mediu,
                   SUM(CASE WHEN nivel_risc='Mic'   THEN 1 ELSE 0 END) AS mic,
                   COUNT(*) AS total
            FROM predictii_churn_rf
            UNION ALL
            SELECT 'Logistic Regression',
                   SUM(CASE WHEN nivel_risc='Mare'  THEN 1 ELSE 0 END),
                   SUM(CASE WHEN nivel_risc='Mediu' THEN 1 ELSE 0 END),
                   SUM(CASE WHEN nivel_risc='Mic'   THEN 1 ELSE 0 END),
                   COUNT(*) FROM predictii_churn_lr
            UNION ALL
            SELECT 'XGBoost',
                   SUM(CASE WHEN nivel_risc='Mare'  THEN 1 ELSE 0 END),
                   SUM(CASE WHEN nivel_risc='Mediu' THEN 1 ELSE 0 END),
                   SUM(CASE WHEN nivel_risc='Mic'   THEN 1 ELSE 0 END),
                   COUNT(*) FROM predictii_churn_xgb
        """)
        distributie = cursor.fetchall()
        cursor.execute("""
            SELECT COUNT(*) AS consens_mare
            FROM predictii_churn_rf rf
            JOIN predictii_churn_lr  lr  ON rf.id_angajat = lr.id_angajat
            JOIN predictii_churn_xgb xgb ON rf.id_angajat = xgb.id_angajat
            WHERE rf.nivel_risc='Mare' AND lr.nivel_risc='Mare' AND xgb.nivel_risc='Mare'
        """)
        consens = cursor.fetchone()
        return jsonify({"status": "succes", "distributie": distributie, "consens_mare": consens['consens_mare']}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()


# ── AUDIT LOG ────────────────────────────────────────────────────────────────

@app.route('/api/audit-log', methods=['GET'])
@jwt_required()
@rol_required('ceo')
def get_audit_log():
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True) 
        cursor.execute("""
            SELECT id_log, tabel, id_inregistrare, actiune, coloana,
                   valoare_veche, valoare_noua, utilizator, data_actiune
            FROM audit_log ORDER BY data_actiune DESC LIMIT 200
        """)
        logs = cursor.fetchall()
        return jsonify({"status": "succes", "total_logs": len(logs), "date_audit": logs}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close(); conn.close()


# ── RUTE SPECIFICE DIRECTOR ───────────────────────────────────────────────────

@app.route('/api/director/info', methods=['GET'])
@jwt_required()
def get_info_director():
    """Returneaza orasul directorului logat"""
    id_utilizator = get_jwt_identity()
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT a.id_angajat, a.nume, a.prenume,
                   d.locatie AS oras, d.nume AS departament
            FROM utilizatori u
            JOIN angajati a     ON u.id_angajat     = a.id_angajat
            JOIN departamente d ON a.id_departament = d.id_departament
            WHERE u.id_utilizator = %s
        """, (id_utilizator,))
        return jsonify(cursor.fetchone()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals(): conn.close()


@app.route('/api/director/angajati', methods=['GET']) 
@jwt_required()
def get_angajati_director():
    """Angajatii din orasul directorului logat"""
    id_utilizator = get_jwt_identity()
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # gasim orasul directorului
        cursor.execute("""
            SELECT d.locatie FROM utilizatori u
            JOIN angajati a     ON u.id_angajat     = a.id_angajat
            JOIN departamente d ON a.id_departament = d.id_departament
            WHERE u.id_utilizator = %s
        """, (id_utilizator,))
        row = cursor.fetchone()
        if not row:
            return jsonify([]), 200
        oras = row['locatie']
        cursor.execute("""
            SELECT a.id_angajat, a.nume, a.prenume, a.email,
                   a.salariu_curent, a.status, a.data_angajare,
                   d.nume AS departament, d.locatie,
                   p.titlu AS pozitie, p.nivel
            FROM angajati a
            JOIN departamente d ON a.id_departament = d.id_departament
            JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
            WHERE d.locatie = %s AND a.status = 'activ'
            ORDER BY d.nume, a.nume
        """, (oras,))
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals(): conn.close()


@app.route('/api/director/departamente', methods=['GET'])
@jwt_required()
def get_departamente_director():
    """Departamentele din orasul directorului logat"""
    id_utilizator = get_jwt_identity()
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT d2.locatie FROM utilizatori u
            JOIN angajati a      ON u.id_angajat     = a.id_angajat
            JOIN departamente d2 ON a.id_departament = d2.id_departament
            WHERE u.id_utilizator = %s
        """, (id_utilizator,))
        row = cursor.fetchone()
        if not row:
            return jsonify([]), 200
        oras = row['locatie']
        cursor.execute("""
            SELECT d.id_departament, d.nume, d.locatie,
                   COUNT(a.id_angajat) AS nr_angajati
            FROM departamente d
            LEFT JOIN angajati a ON d.id_departament = a.id_departament
                                AND a.status = 'activ'
            WHERE d.locatie = %s
            GROUP BY d.id_departament, d.nume, d.locatie
            ORDER BY d.nume
        """, (oras,))
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals(): conn.close()


@app.route('/api/director/proiecte', methods=['GET'])
@jwt_required()
def get_proiecte_director():
    """Proiectele cu angajati din orasul directorului"""
    id_utilizator = get_jwt_identity()
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT d.locatie FROM utilizatori u
            JOIN angajati a     ON u.id_angajat     = a.id_angajat
            JOIN departamente d ON a.id_departament = d.id_departament
            WHERE u.id_utilizator = %s
        """, (id_utilizator,))
        row = cursor.fetchone()
        if not row:
            return jsonify([]), 200
        oras = row['locatie']
        cursor.execute("""
            SELECT DISTINCT p.id_proiect, p.nume, p.descriere,
                   p.status, p.data_start, p.data_sfarsit, p.buget
            FROM proiecte p
            JOIN alocari_proiecte ap ON p.id_proiect    = ap.id_proiect
            JOIN angajati a          ON ap.id_angajat   = a.id_angajat
            JOIN departamente d      ON a.id_departament = d.id_departament
            WHERE d.locatie = %s
            ORDER BY p.data_start DESC
        """, (oras,))
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals(): conn.close()


# ── RUTE SPECIFICE HR SPECIALIST ──────────────────────────────────────────────

@app.route('/api/hr/departamente', methods=['GET'])
@jwt_required()
def get_departamente_hr_specialist():
    """Toate departamentele — HR vede tot dar fara proiecte si beneficii"""
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT d.id_departament, d.nume, d.locatie,
                   COUNT(a.id_angajat) AS nr_angajati
            FROM departamente d
            LEFT JOIN angajati a ON d.id_departament = a.id_departament
                                AND a.status = 'activ'
            GROUP BY d.id_departament, d.nume, d.locatie
            ORDER BY d.locatie, d.nume
        """)
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals(): conn.close()

@app.route('/api/angajati/profil-meu', methods=['PUT'])
@jwt_required()
def actualizeaza_profil_meu():
    identity = get_jwt_identity()
    date_update = request.get_json()
    if not date_update:
        return jsonify({"status": "eroare", "mesaj": "Nu s-au trimis date."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Obținem id_angajat din JWT
        cursor.execute("SELECT id_angajat FROM utilizatori WHERE id_utilizator = %s", (identity,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"status": "eroare", "mesaj": "Angajat negasit."}), 404
        id_angajat = row['id_angajat']

        # Doar aceste câmpuri pot fi editate de utilizator
        campuri_permise = ['nume', 'prenume', 'email', 'telefon']

        campuri = []
        valori = []
        for cheie, valoare in date_update.items():
            if cheie in campuri_permise:
                if cheie in ['nume', 'prenume']:
                    valoare = str(valoare).strip().capitalize()
                elif cheie == 'email':
                    valoare = str(valoare).strip().lower()
                campuri.append(f"{cheie} = %s")
                valori.append(valoare)

        if not campuri:
            return jsonify({"status": "eroare", "mesaj": "Niciun camp editabil trimis."}), 400

        valori.append(id_angajat)
        cursor.execute(
            f"UPDATE angajati SET {', '.join(campuri)} WHERE id_angajat = %s",
            tuple(valori)
        )
        conn.commit()
        return jsonify({"status": "succes", "mesaj": "Profilul a fost actualizat."}), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close() 

@app.route('/api/echipa', methods=['GET'])
@jwt_required()
@rol_required('team_leader', 'app_readonly', 'project_manager', 'hr_manager')
def get_echipa_mea():
    identity = get_jwt_identity() 
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT id_angajat FROM utilizatori WHERE id_utilizator = %s", (identity,))
        user_row = cursor.fetchone()
        
        if not user_row:
            return jsonify({"status": "eroare", "mesaj": "Manager negasit."}), 404
            
        id_manager = user_row['id_angajat']

        cursor.execute("""
            SELECT a.id_angajat, a.nume, a.prenume, a.email, a.telefon, a.data_angajare,
                   d.nume as departament, p.titlu as functie
            FROM angajati a
            LEFT JOIN departamente d ON a.id_departament = d.id_departament
            LEFT JOIN pozitii p      ON a.id_pozitie     = p.id_pozitie
            WHERE a.id_manager = %s
            ORDER BY a.nume ASC, a.prenume ASC
        """, (id_manager,)) 
        
        echipa = cursor.fetchall()
        return jsonify(echipa), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/proiecte/<int:id_proiect>', methods=['GET'])
@jwt_required()
def get_detalii_proiect(id_proiect):
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id_proiect, nume, descriere, data_start, data_sfarsit, status 
            FROM proiecte 
            WHERE id_proiect = %s
        """, (id_proiect,))
        proiect = cursor.fetchone()
        
        if not proiect:
            return jsonify({"status": "eroare", "mesaj": "Proiectul nu a fost gasit."}), 404
            
        return jsonify(proiect), 200

    except mysql.connector.Error as err: 
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

print("--- RUTE DECOPERITE DE FLASK ---") 
# ─────────────────────────────────────────────────────────────────────────────
print("--- RUTE INREGISTRATE ---")
print(app.url_map)
print("-------------------------") 

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 