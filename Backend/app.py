from flask import Flask, jsonify, request
from flask_cors import CORS
from flask import request
import re
import os
import mysql.connector
from datetime import datetime
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)
CORS(app)
app.config["JWT_SECRET_KEY"] = "super-secret-roz-albastru"
jwt = JWTManager(app)
regex_email = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

db_config = {
    'host': os.getenv('DB_HOST', 'localhost'), 
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'my_database')
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

@app.route('/api/angajati', methods=['POST'])
def adauga_angajat():
    date_noi = request.get_json()
    erori = [] 

    # 1. Validare câmpuri
    campuri_obligatorii = [
        'nume', 'prenume', 'cnp', 'email', 'telefon', 
        'an_angajare', 'luna_angajare', 'id_pozitie', 'id_departament', 'salariu_curent'
    ]
    for camp in campuri_obligatorii:
        if camp not in date_noi or str(date_noi[camp]).strip() == "":
            erori.append(f"Campul '{camp}' lipseste.")

    # 2. Validare Email
    email = date_noi.get('email', '')
    if email and not re.fullmatch(regex_email, email):
        erori.append("Email invalid.")

    # 3. Validare CNP
    cnp = str(date_noi.get('cnp', ''))
    if cnp and (not cnp.isdigit() or len(cnp) != 13):
        erori.append("CNP-ul trebuie sa aiba exact 13 cifre.")

    # 4. Validare Telefon
    tel = str(date_noi.get('telefon', '')).replace(" ", "")
    if tel and (len(tel) < 7 or len(tel) > 17):
        erori.append("Telefonul trebuie sa aiba intre 7 si 17 cifre.")

    # 5. Validare An și Lună
    an = date_noi.get('an_angajare')
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
    
    nume_final = date_noi['nume'].strip().capitalize()
    prenume_final = date_noi['prenume'].strip().capitalize()

    nume_final = date_noi['nume'].strip().capitalize()
    prenume_final = date_noi['prenume'].strip().capitalize()
    email_final = email.strip().lower()

    # 6. Salvare în Baza de Date
    try:
        data_sql = f"{an}-{int(luna):02d}-01" 
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """INSERT INTO angajati 
                 (nume, prenume, cnp, email, telefon, data_angajare, id_departament, id_pozitie, salariu_curent) 
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        valori = (
            nume_final, prenume_final, cnp, 
            email, tel, data_sql,
            date_noi['id_departament'], date_noi['id_pozitie'], date_noi['salariu_curent']
        )
        cursor.execute(sql, valori)
        conn.commit()
        return jsonify({"status": "succes", "mesaj": "Angajat validat si salvat in baza de date!"}), 201
    
    except mysql.connector.Error as err:
        if err.errno == 1062:
            mesaj_personalizat = "CNP-ul sau Email-ul exista deja."
            err_str = str(err).lower()
            if "email" in err_str:
                mesaj_personalizat = "Acest email este deja utilizat de un alt angajat."
            elif "cnp" in err_str:
                mesaj_personalizat = "Acest CNP este deja inregistrat in sistem."
            
            return jsonify({"status": "eroare", "mesaj": mesaj_personalizat}), 400

        # Aici apar mesajele de eroare de le triggere
        if err.sqlstate == '45000':
            return jsonify({"status": "eroare_logica", "mesaj": err.msg}), 400

        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/angajati', methods=['GET'])
def toti_angajatii():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT 
                a.*, 
                d.nume AS nume_departament, 
                p.titlu AS titlu_pozitie
            FROM angajati a
            LEFT JOIN departamente d ON a.id_departament = d.id_departament
            LEFT JOIN pozitii p ON a.id_pozitie = p.id_pozitie
        """

        cursor.execute(query)
        toti_angajatii = cursor.fetchall()
        return jsonify(toti_angajatii), 200
    
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/angajati/cauta', methods=['GET'])
def cauta_angajati():
    termen = request.args.get('termen', '').strip()

    if not termen:
        return jsonify({"status": "eroare", "mesaj": "Introdu un nume sau un ID."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Dacă termenul este număr, căutăm după ID
        if termen.isdigit():
            query = """
                SELECT a.*, d.nume AS nume_departament, p.titlu AS titlu_pozitie
                FROM angajati a
                LEFT JOIN departamente d ON a.id_departament = d.id_departament
                LEFT JOIN pozitii p ON a.id_pozitie = p.id_pozitie
                WHERE a.id_angajat = %s
            """
            cursor.execute(query, (termen,))
        else:
            # Dacă este text, căutăm parțial în nume, prenume sau email
            query = """
                SELECT a.*, d.nume AS nume_departament, p.titlu AS titlu_pozitie
                FROM angajati a
                LEFT JOIN departamente d ON a.id_departament = d.id_departament
                LEFT JOIN pozitii p ON a.id_pozitie = p.id_pozitie
                WHERE a.nume LIKE %s OR a.prenume LIKE %s OR a.email LIKE %s
            """
            val_like = f"%{termen}%"
            cursor.execute(query, (val_like, val_like, val_like))
        
        rezultate = cursor.fetchall()
        return jsonify({"status": "succes", "rezultate": rezultate}), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()

@app.route('/api/statistici', methods=['GET'])
def get_stats():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # aici calculeaza
        query = """
            SELECT 
                COUNT(*) as total_angajati,
                ROUND(AVG(salariu_curent), 2) as salariu_mediu,
                SUM(salariu_curent) as buget_total_salarii,
                MAX(salariu_curent) as salariu_maxim,
                MIN(salariu_curent) as salariu_minim
            FROM angajati
            WHERE status = 'activ'
        """
        
        cursor.execute(query)
        stats = cursor.fetchone()
        
        return jsonify({
            "status": "succes",
            "date_statistice": stats
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/statistici/departament/<int:id_dept>', methods=['GET'])
def get_raport_departament(id_dept):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Apelăm procedura stocată folosind ID-ul din URL
        cursor.callproc('proc_raport_salarii_departament', [id_dept])
        
        date_raport = []
        for result in cursor.stored_results():
            date_raport.extend(result.fetchall())
            
        while cursor.nextset():
            pass
            
        return jsonify({
            "status": "succes",
            "id_departament": id_dept,
            "date_raport": date_raport
        }), 200
    
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/angajati/arhiva', methods=['GET'])
def get_arhiva_angajati():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                a.*, 
                d.nume AS nume_departament, 
                p.titlu AS titlu_pozitie
            FROM angajati a
            LEFT JOIN departamente d ON a.id_departament = d.id_departament
            LEFT JOIN pozitii p ON a.id_pozitie = p.id_pozitie
            WHERE a.status = 'inactiv'
            ORDER BY a.nume ASC
        """
        
        cursor.execute(query)
        arhiva = cursor.fetchall()
        
        return jsonify({
            "status": "succes",
            "numar_fosti_angajati": len(arhiva),
            "date": arhiva
        }), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()


@app.route('/api/angajati/<int:id>', methods=['PUT'])
def actualizeaza_angajat(id):
    date_update = request.get_json()
    
    # verificăm dacă avem ce să actualizăm
    if not date_update:
        return jsonify({"status": "eroare", "mesaj": "Nu s-au trimis date pentru actualizare."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # verificam daca angajatul exista inainte de update
        cursor.execute("SELECT id_angajat FROM angajati WHERE id_angajat = %s", (id,))
        if not cursor.fetchone():
            return jsonify({"status": "eroare", "mesaj": "Angajatul nu a fost gasit."}), 404

        # actualizam doar ce primim
        campuri = []
        valori = []
        
        campuri_permise = ['nume', 'prenume', 'email', 'telefon', 'salariu_curent', 'id_departament', 'id_pozitie']
        
        for cheie, valoare in date_update.items():
            if cheie in campuri_permise:

                if cheie in ['nume', 'prenume']:
                    valoare = str(valoare).strip().capitalize()
                elif cheie == 'email':
                    valoare = str(valoare).strip().lower()
                
                campuri.append(f"{cheie} = %s")
                valori.append(valoare)

        if not campuri:
            return jsonify({"status": "eroare", "mesaj": "Niciun camp valid pentru actualizare."}), 400

        # Adaug ID la final de lista
        valori.append(id)
        sql = f"UPDATE angajati SET {', '.join(campuri)} WHERE id_angajat = %s"
        
        cursor.execute(sql, tuple(valori))
        conn.commit()

        return jsonify({
            "status": "succes",
            "mesaj": f"Datele angajatului cu ID {id} au fost actualizate."
        }), 200

    except mysql.connector.Error as err:
        # Aici apar erorile de le triggere
        if err.sqlstate == '45000':
            return jsonify({"status": "eroare_logica_db", "mesaj": err.msg}), 400
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()

@app.route('/api/angajati/<int:id>', methods=['DELETE'])
def sterge_angajat(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # executăm direct UPDATE-ul către statusul 'inactiv'
        sql = "UPDATE angajati SET status = 'inactiv' WHERE id_angajat = %s"
        cursor.execute(sql, (id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "eroare", "mesaj": "Angajatul nu a fost gasit."}), 404

        return jsonify({
            "status": "succes", 
            "mesaj": f"Angajatul cu ID {id} a fost trecut in starea 'inactiv'."
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()

@app.route('/api/angajati/profil/<int:id>', methods=['GET'])
def get_profil_complet(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. Date de bază angajat + grila lui salarială
        query_base = """
            SELECT a.*, d.nume as departament, p.titlu as functie, 
                   p.salariu_min, p.salariu_max
            FROM angajati a
            JOIN departamente d ON a.id_departament = d.id_departament
            JOIN pozitii p ON a.id_pozitie = p.id_pozitie
            WHERE a.id_angajat = %s
        """
        cursor.execute(query_base, (id,))
        profil = cursor.fetchone()
        
        if not profil:
            return jsonify({"status": "eroare", "mesaj": "Angajat negasit"}), 404

        # 2. Analiza salarială completă (Aliniată la cerințele de Churn)
        salariu = float(profil['salariu_curent'])
        medie = (float(profil['salariu_min']) + float(profil['salariu_max'])) / 2
        compa_procent = (salariu / medie) * 100
        
        # Pragurile oficiale de churn
        if compa_procent < 80:
            status_grila = "Subdeplătit (Risc churn mare)"
        elif 80 <= compa_procent <= 120:
            status_grila = "În grilă"
        else:
            status_grila = "Peste grilă"

        cursor.callproc('proc_calcul_salariu_net', [salariu])

        salariu_net = None
        # Citim rezultatul pe care îl întoarce procedura stocată
        for result in cursor.stored_results():
            row = result.fetchone()
            if row:
                salariu_net = list(row.values())[0] if isinstance(row, dict) else row[0]

        profil['analiza_piata'] = {
            "compa_ratio": f"{round(compa_procent, 2)}%",
            "pozitie_grila": status_grila,
            "salariu_net_calculat": round(float(salariu_net), 2) if salariu_net is not None else "Eroare calcul"
        }

        while cursor.nextset():
            pass

        # 3. Istoric Salarial
        cursor.execute("SELECT * FROM istoric_salarial WHERE id_angajat = %s ORDER BY data_modificare DESC", (id,))
        profil['istoric_salarii'] = cursor.fetchall()

        # 4. Evaluări (Aici aducem noile scoruri: tehnic, comunicare, leadership, final)
        cursor.execute("SELECT id_evaluare, id_evaluator, data_evaluare, scor_tehnic, scor_comunicare, scor_leadership, scor_final, feedback FROM evaluari WHERE id_angajat = %s ORDER BY data_evaluare DESC", (id,))
        profil['evaluari'] = cursor.fetchall()

        # 5. Proiecte Active
        query_proiecte = """
            SELECT DISTINCT p.nume, ap.rol_proiect, ap.ore_alocate
            FROM alocari_proiecte ap
            JOIN proiecte p ON ap.id_proiect = p.id_proiect
            WHERE ap.id_angajat = %s AND p.status = 'in desfasurare'
        """
        cursor.execute(query_proiecte, (id,))
        profil['proiecte'] = cursor.fetchall()

        return jsonify(profil), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()

@app.route('/api/angajati/marire', methods=['POST'])
def acorda_marire():
    date = request.get_json()
    id_angajat = date.get('id_angajat')
    procent = date.get('procent')
    # Motivul, in caz ca cere baza
    motiv = date.get('motiv', 'Marire salariala curenta') 

    if id_angajat is None or procent is None:
        return jsonify({"status": "eroare", "mesaj": "Lipsesc date esentiale (id_angajat sau procent)."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        v_id = int(id_angajat)
        v_procent = float(procent)

        cursor.callproc('proc_marire_salariu', [v_id, v_procent, motiv])
        
        #Salvăm modificările în baza de date
        conn.commit()

        return jsonify({
            "status": "succes", 
            "mesaj": f"Procedura de marire cu {v_procent}% a fost aplicata cu succes pentru angajatul cu ID {v_id}."
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()

from flask_jwt_extended import jwt_required, get_jwt_identity

@app.route('/api/angajati/<int:id_angajat>', methods=['PUT'])
@jwt_required()
def editeaza_angajat(id_angajat):
    try:
        data = request.get_json()
        current_username = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. Verificăm mai întâi rolul utilizatorului care face cererea
        cursor.execute("SELECT rol FROM utilizatori WHERE username = %s", (current_username,))
        user_cont = cursor.fetchone()
        
        if not user_cont:
            cursor.execute("SELECT rol FROM utilizatori WHERE id_utilizator = %s", (current_username,))
            user_cont = cursor.fetchone()

        # 2. Dacă este doar 'user', aplicăm restricțiile
        if user_cont and user_cont['rol'] == 'user':
            campuri_interzise = ['salariu', 'data_angajare', 'id_departament', 'pozitie', 'rol_proiect']
            for camp in campuri_interzise:
                if camp in data:
                    return jsonify({
                        "status": "eroare_securitate",
                        "mesaj": f"Nu aveti permisiunea de a modifica campul sensibil: {camp}."
                    }), 403

        return jsonify({"status": "succes", "mesaj": "Datele au fost actualizate."}), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/angajati/filtrare', methods=['GET'])
def get_angajati_filtrati():
    try:
        # Preluăm parametrii trimiși din React URL 
        departament = request.args.get('departament')
        pozitie = request.args.get('pozitie')
        status_activ = request.args.get('activ') 
        sortare = request.args.get('sortare', 'nume_asc')
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Construim query-ul dinamic
        query = "SELECT * FROM angajati WHERE 1=1"
        params = []
        
        if departament:
            query += " AND id_departament = %s"
            params.append(departament)
        if pozitie:
            query += " AND pozitie LIKE %s"
            params.append(f"%{pozitie}%")
        if status_activ is not None:
            query += " AND activ = %s"
            params.append(int(status_activ))
            
        # Aplicăm sortarea cerută
        if sortare == 'nume_asc':
            query += " ORDER BY nume ASC, prenume ASC"
        elif sortare == 'nume_desc':
            query += " ORDER BY nume DESC, prenume DESC"
        elif sortare == 'departament':
            query += " ORDER BY id_departament ASC"
        elif sortare == 'pozitie':
            query += " ORDER BY pozitie ASC"
            
        cursor.execute(query, tuple(params))
        rezultate = cursor.fetchall()
        
        return jsonify({"status": "succes", "total": len(rezultate), "angajati": rezultate}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/concedii/istoric-grupare', methods=['GET'])
def get_istoric_concedii_avansat():
    try:
        id_angajat = request.args.get('id_angajat')
        id_departament = request.args.get('id_departament')
        id_manager = request.args.get('id_manager')
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT c.*, a.nume, a.prenume, a.id_departament, c.id_aprobator
            FROM concedii c
            JOIN angajati a ON c.id_angajat = a.id_angajat
            WHERE 1=1
        """
        params = []
        
        if id_angajat:
            query += " AND c.id_angajat = %s"
            params.append(id_angajat)
        if id_departament:
            query += " AND a.id_departament = %s"
            params.append(id_departament)
        if id_manager:
            query += " AND c.id_aprobator = %s"
            params.append(id_manager)
            
        query += " ORDER BY c.data_start DESC"
        
        cursor.execute(query, tuple(params))
        istoric = cursor.fetchall()
        return jsonify({"status": "succes", "date_concedii": istoric}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/departamente/sinteza', methods=['GET'])
def get_sinteza_departamente():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. Extragem departamentele cu numărul total de angajați alocați
        query_departamente = """
            SELECT d.id_departament, d.nume AS nume_departament, COUNT(a.id_angajat) AS numar_angajati
            FROM departamente d
            LEFT JOIN angajati a ON d.id_departament = a.id_departament
            GROUP BY d.id_departament
        """
        cursor.execute(query_departamente)
        departamente = cursor.fetchall()
        
        # 2. Pentru fiecare departament, atașăm detaliile reale ale angajatiilor
        for dep in departamente:
            query_angajati = """
                SELECT id_angajat, nume, prenume, id_pozitie, status 
                FROM angajati 
                WHERE id_departament = %s
            """
            cursor.execute(query_angajati, (dep['id_departament'],))
            angajati = cursor.fetchall()
            
            dep['detalii_angajati'] = angajati
            
            # Extragem ID-urile unice de poziții active în acest departament
            pozitii_unice = list(set([ang['id_pozitie'] for ang in angajati if ang['id_pozitie']]))
            dep['id_pozitii_existente'] = pozitii_unice
            
            # Calculăm rapid câți angajați sunt activi în departament
            angajati_activi = len([ang for ang in angajati if ang['status'] == 'activ'])
            dep['numar_angajati_activi'] = angajati_activi
            
        return jsonify({
            "status": "succes", 
            "total_departamente": len(departamente),
            "departamente": departamente
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/beneficii/statistici', methods=['GET'])
def get_beneficii_cu_statistici():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Numărăm câți oameni unici au primit fiecare beneficiu în parte
        query = """
            SELECT b.id_beneficiu, b.nume, b.descriere, b.valoare, COUNT(ba.id_angajat) AS total_angajati_beneficiari
            FROM beneficii b
            LEFT JOIN beneficii_angajati ba ON b.id_beneficiu = ba.id_beneficiu
            GROUP BY b.id_beneficiu
        """
        cursor.execute(query)
        statistici = cursor.fetchall()
        return jsonify({"status": "succes", "beneficii": statistici}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/beneficii/acorda', methods=['POST'])
@jwt_required()
def acorda_beneficiu_angajat():
    try:
        current_username = get_jwt_identity()
        data = request.get_json()
        
        id_angajat = data.get('id_angajat')
        id_beneficiu = data.get('id_beneficiu')
        data_acordare = data.get('data_acordare', '2026-05-19') # Data curentă 2026 implicită
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verificare drepturi: Doar Admin sau Manager au voie!
        cursor.execute("SELECT rol FROM utilizatori WHERE username = %s OR id_utilizator = %s", (current_username, current_username))
        user_cont = cursor.fetchone()
        
        if user_cont and user_cont['rol'] == 'user':
            return jsonify({"status": "eroare_privilegii", "mesaj": "Utilizatorii simpli nu pot crea sau acorda beneficii!"}), 403
            
        if not id_angajat or not id_beneficiu:
            return jsonify({"status": "eroare", "mesaj": "Lipsesc id_angajat sau id_beneficiu."}), 400
            
        query = "INSERT INTO beneficii_angajati (id_angajat, id_beneficiu, data_acordare) VALUES (%s, %s, %s)"
        cursor.execute(query, (id_angajat, id_beneficiu, data_acordare))
        conn.commit()
        
        return jsonify({"status": "succes", "mesaj": "Beneficiul a fost alocat cu succes angajatului!"}), 201
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/hr/angajati-view', methods=['GET'])
def get_angajati_hr_view():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT * FROM view_angajati_hr_specialist"
        cursor.execute(query)
        
        lista_angajati = cursor.fetchall()
        
        return jsonify({
            "status": "succes",
            "total_inregistrari": len(lista_angajati),
            "date_angajati": lista_angajati
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/proiecte/angajati-view', methods=['GET'])
def get_angajati_proiecte_view():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT * FROM view_angajati_proiecte"
        cursor.execute(query)
        
        date_proiecte = cursor.fetchall()
        
        return jsonify({
            "status": "succes",
            "total_legaturi": len(date_proiecte),
            "date_proiecte": date_proiecte
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/team-leader/angajati-view/<int:id_leader>', methods=['GET'])
def get_angajati_team_leader_view(id_leader):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT * FROM view_angajati_team_leader WHERE id_manager = %s"
        cursor.execute(query, (id_leader,))
        
        date_echipa = cursor.fetchall()
        
        return jsonify({
            "status": "succes",
            "total_membri_echipa": len(date_echipa),
            "date_echipa": date_echipa
        }), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/manageri/subordonati-view', methods=['GET'])
def get_subordonati_manageri_view():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT * FROM view_subordonati_manageri"
        cursor.execute(query)
        
        date_subordonati = cursor.fetchall()
        
        return jsonify({
            "status": "succes",
            "total_subordonati": len(date_subordonati),
            "date_subordonati": date_subordonati
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/angajati/schimbare-parola', methods=['POST'])
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

@app.route('/api/angajati/istoric-concedii', methods=['GET'])
def get_istoric_concedii():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                c.id_concediu,
                c.id_angajat,
                a.nume AS nume_angajat,
                a.prenume AS prenume_angajat,
                c.tip,                  
                c.data_start,
                c.data_sfarsit,
                DATEDIFF(c.data_sfarsit, c.data_start) + 1 AS zile_solicitate, 
                c.id_aprobator,
                c.status                
            FROM concedii c
            JOIN angajati a ON c.id_angajat = a.id_angajat
            ORDER BY c.data_start DESC
        """
        cursor.execute(query)
        istoric = cursor.fetchall()
        
        return jsonify({
            "status": "succes",
            "total_cereri": len(istoric),
            "date_concedii": istoric
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/concedii', methods=['POST'])
def adauga_concediu():
    date = request.get_json()
    id_angajat = date.get('id_angajat')
    data_start = date.get('data_start')
    data_sfarsit = date.get('data_sfarsit')
    tip_concediu = date.get('tip') # 'odihna', 'boala', 'concediu fara plata'

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        #Validare format dată
        start = datetime.strptime(data_start, '%Y-%m-%d')
        sfarsit = datetime.strptime(data_sfarsit, '%Y-%m-%d')

        if start > sfarsit:
            return jsonify({"status": "eroare", "mesaj": "Data de inceput nu poate fi dupa data de sfarsit."}), 400

        #Validare, Angajatul nu trebuie să aibă alt concediu în această perioadă
        query_suprapunere = """
            SELECT id_concediu FROM concedii 
            WHERE id_angajat = %s AND status != 'respins'
            AND ((data_start <= %s AND data_sfarsit >= %s) 
                 OR (data_start <= %s AND data_sfarsit >= %s))
        """
        cursor.execute(query_suprapunere, (id_angajat, sfarsit, start, start, sfarsit))
        if cursor.fetchone():
            return jsonify({"status": "eroare", "mesaj": "Angajatul are deja un concediu programat in aceasta perioada."}), 400

        #Inserare (cu status default 'in asteptare')
        query_insert = """
            INSERT INTO concedii (id_angajat, id_aprobator, tip, data_start, data_sfarsit, status)
            VALUES (%s, %s, %s, %s, %s, 'in asteptare')
        """
        # Folosim un id_aprobator (ar trebui sa fie ID-ul managerului din tabelul manageri)
        id_aprobator = date.get('id_aprobator', 1) 
        
        cursor.execute(query_insert, (id_angajat, id_aprobator, tip_concediu, data_start, data_sfarsit))
        conn.commit()

        return jsonify({"status": "succes", "mesaj": "Cererea de concediu a fost inregistrata si asteapta aprobarea."}), 201

    except ValueError:
        return jsonify({"status": "eroare", "mesaj": "Formatul datei trebuie sa fie YYYY-MM-DD."}), 400
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()

@app.route('/api/concedii', methods=['GET'])
def get_concedii_in_asteptare():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                c.id_concediu,
                c.id_angajat,
                a.nume AS nume_angajat,
                a.prenume AS prenume_angajat,
                a.email AS email_angajat,
                c.tip AS tip_concediu,
                c.data_start,
                c.data_sfarsit,
                DATEDIFF(c.data_sfarsit, c.data_start) + 1 AS numar_zile,
                c.status,
                c.id_aprobator,
                m.nume AS nume_aprobator,
                m.prenume AS prenume_aprobator
            FROM concedii c
            JOIN angajati a ON c.id_angajat = a.id_angajat
            LEFT JOIN angajati m ON c.id_aprobator = m.id_angajat
            WHERE c.status = 'in asteptare'
            ORDER BY c.data_start ASC
        """
        cursor.execute(query)
        cereri_asteptare = cursor.fetchall()
        
        return jsonify({
            "status": "succes",
            "total_cereri_in_asteptare": len(cereri_asteptare),
            "date_concedii": cereri_asteptare
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/concedii/decizie/<int:id_concediu>', methods=['PUT'])
def decide_concediu(id_concediu):
    date = request.get_json()
    nou_status = date.get('status')  
    id_manager_care_aproba = date.get('id_manager')

    if nou_status not in ['aprobat', 'respins']:
        return jsonify({"status": "eroare", "mesaj": "Status invalid. Folositi 'aprobat' sau 'respins'."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Verificăm dacă cererea există și cine este aprobatorul 
        cursor.execute("SELECT id_aprobator, status FROM concedii WHERE id_concediu = %s", (id_concediu,))
        concediu = cursor.fetchone()

        if not concediu:
            return jsonify({"status": "eroare", "mesaj": "Cererea de concediu nu a fost gasita."}), 404
        
        # Logica de Business: Verificăm dacă cel care dă click este managerul corect
        if concediu['id_aprobator'] != id_manager_care_aproba:
            return jsonify({"status": "eroare", "mesaj": "Nu aveti permisiunea de a aproba aceasta cerere."}), 403

        # Actualizăm statusul
        cursor.execute(
            "UPDATE concedii SET status = %s WHERE id_concediu = %s",
            (nou_status, id_concediu)
        )
        
        # Inserăm o notificare automată pentru angajat (folosind tabelul notificari)
        # Aflăm ID-ul angajatului
        cursor.execute("SELECT id_angajat FROM concedii WHERE id_concediu = %s", (id_concediu,))
        id_angajat = cursor.fetchone()['id_angajat']
        
        mesaj_notificare = f"Cererea ta de concediu a fost {nou_status}."
        cursor.execute(
            "INSERT INTO notificari (id_angajat, tip, mesaj) VALUES (%s, 'concediu', %s)",
            (id_angajat, mesaj_notificare)
        )

        conn.commit()
        return jsonify({"status": "succes", "mesaj": f"Concediul a fost {nou_status} cu succes."}), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()

@app.route('/api/departamente', methods=['GET', 'POST'])
def gestionare_departamente():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'GET':
        cursor.execute("SELECT * FROM departamente ORDER BY nume")
        departamente = cursor.fetchall()
        conn.close()
        return jsonify(departamente), 200

    if request.method == 'POST':
        date = request.get_json()
        nume = date.get('nume')
        descriere = date.get('descriere', '')

        if not nume:
            return jsonify({"status": "eroare", "mesaj": "Numele departamentului este obligatoriu"}), 400

        try:
            cursor.execute("INSERT INTO departamente (nume, descriere) VALUES (%s, %s)", (nume, descriere))
            conn.commit()
            return jsonify({"status": "succes", "mesaj": "Departament creat"}), 201
        except mysql.connector.Error as err:
            return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        finally:
            conn.close()

@app.route('/api/pozitii', methods=['GET', 'POST'])
def gestionare_pozitii():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'GET':
        cursor.execute("SELECT * FROM pozitii")
        pozitii = cursor.fetchall()
        conn.close()
        return jsonify(pozitii), 200

    if request.method == 'POST':
        date = request.get_json()
        titlu = date.get('titlu')
        id_dept = date.get('id_departament')
        s_min = float(date.get('salariu_min', 0))
        s_max = float(date.get('salariu_max', 0))

        # Validare Grilă Salarială
        if s_min >= s_max:
            return jsonify({
                "status": "eroare", 
                "mesaj": "Salariul minim trebuie sa fie mai mic decat cel maxim. Verifica datele de piata!"
            }), 400

        try:
            query = "INSERT INTO pozitii (titlu, id_departament, salariu_min, salariu_max) VALUES (%s, %s, %s, %s)"
            cursor.execute(query, (titlu, id_dept, s_min, s_max))
            conn.commit()
            return jsonify({"status": "succes", "mesaj": "Pozitie adaugata in grila salariala"}), 201
        except mysql.connector.Error as err:
            return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        finally:
            conn.close()

@app.route('/api/proiecte', methods=['GET', 'POST'])
def gestionare_proiecte():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'GET':
        cursor.execute("SELECT * FROM proiecte ORDER BY data_start DESC")
        proiecte = cursor.fetchall()
        conn.close()
        return jsonify(proiecte), 200

    if request.method == 'POST':
        date = request.get_json()
        try:
            query = """
                INSERT INTO proiecte (nume, descriere, data_start, data_sfarsit, status, buget)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            valori = (date['nume'], date['descriere'], date['data_start'], 
                      date['data_sfarsit'], date['status'], date['buget'])
            cursor.execute(query, valori)
            conn.commit()
            return jsonify({"status": "succes", "mesaj": "Proiect creat cu succes"}), 201
        except Exception as e:
            return jsonify({"status": "eroare", "detalii": str(e)}), 400
        finally:
            conn.close()

@app.route('/api/angajati/beneficii', methods=['GET'])
def get_beneficii_angajati():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 🔥 Interogăm tabelele beneficii_angajati, beneficii și angajati folosind structura exactă furnizată
        query = """
            SELECT 
                ba.id_angajat,
                a.nume AS nume_angajat,
                a.prenume AS prenume_angajat,
                b.id_beneficiu,
                b.nume AS nume_beneficiu,       
                b.descriere AS descriere_beneficiu,
                b.valoare AS valoare_beneficiu,  
                ba.data_acordare                
            FROM beneficii_angajati ba
            JOIN angajati a ON ba.id_angajat = a.id_angajat
            JOIN beneficii b ON ba.id_beneficiu = b.id_beneficiu
            ORDER BY a.nume ASC, b.nume ASC
        """
        cursor.execute(query)
        lista_beneficii = cursor.fetchall()
        
        return jsonify({
            "status": "succes",
            "total_beneficii_alocate": len(lista_beneficii),
            "date_beneficii": lista_beneficii
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/beneficii', methods=['GET', 'POST'])
def gestionare_beneficii():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'GET':
        cursor.execute("SELECT * FROM beneficii")
        beneficii = cursor.fetchall()
        conn.close()
        return jsonify(beneficii), 200

    if request.method == 'POST':
        date = request.get_json()
        try:
            cursor.execute("INSERT INTO beneficii (nume, descriere, valoare) VALUES (%s, %s, %s)",
                           (date['nume'], date['descriere'], date['valoare']))
            conn.commit()
            return jsonify({"status": "succes", "mesaj": "Beneficiu adaugat"}), 201
        except Exception as e:
            return jsonify({"status": "eroare", "detalii": str(e)}), 400
        finally:
            conn.close()

@app.route('/api/management/arhiva-evaluari', methods=['GET'])
def get_arhiva_evaluari():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                e.id_evaluare,
                e.id_angajat,
                a.nume AS nume_angajat,
                a.prenume AS prenume_angajat,
                e.data_evaluare,
                e.scor_tehnic,
                e.scor_comunicare,
                e.scor_leadership,
                e.scor_final,
                e.feedback,
                e.id_evaluator,
                m.nume AS nume_evaluator,
                m.prenume AS prenume_evaluator
            FROM evaluari e
            JOIN angajati a ON e.id_angajat = a.id_angajat
            LEFT JOIN angajati m ON e.id_evaluator = m.id_angajat
            ORDER BY e.data_evaluare DESC
        """
        cursor.execute(query)
        arhiva = cursor.fetchall()
        
        return jsonify({
            "status": "succes",
            "total_evaluari": len(arhiva),
            "date_evaluari": arhiva
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/evaluari', methods=['POST'])
def adauga_evaluare():
    date = request.get_json()
    id_angajat = date.get('id_angajat')
    s_tehnic = int(date.get('scor_tehnic'))
    s_comunicare = int(date.get('scor_comunicare'))
    s_leadership = int(date.get('scor_leadership'))

    # Logica de business: Calculăm media scorului final
    scor_final = (s_tehnic + s_comunicare + s_leadership) / 3

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO evaluari (id_angajat, id_evaluator, data_evaluare, 
                                 scor_tehnic, scor_comunicare, scor_leadership, 
                                 scor_final, feedback)
            VALUES (%s, %s, CURDATE(), %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (id_angajat, date['id_evaluator'], s_tehnic, 
                               s_comunicare, s_leadership, scor_final, date.get('feedback')))
        conn.commit()
        return jsonify({"status": "succes", "scor_generat": round(scor_final, 2)}), 201
    except Exception as e:
        return jsonify({"status": "eroare", "detalii": str(e)}), 400
    finally:
        if 'conn' in locals(): conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    try:
        conn = mysql.connector.connect(
            user='root', 
            password='', 
            host=os.environ.get('DB_HOST', '127.0.0.1'),
            database='my_database' 
        )

        cursor = conn.cursor()
        
        cursor.callproc('proc_login', [username, password])
        
        # Preluăm rezultatul returnat de procedură
        user_data = None
        for result in cursor.stored_results():
            rows = result.fetchall()
            if rows:
                user_data = rows[0]

        cursor.close()
        conn.close()
        
        if user_data:
            id_utilizator = user_data[0]
            username_db = user_data[1]
            rol_utilizator = user_data[2]
            
            # Forțăm ID-ul să fie text (string) pentru a evita eroarea JWT
            identity_str = str(id_utilizator)
            
            token = create_access_token(
                identity=identity_str, 
                additional_claims={"username": username_db, "rol": rol_utilizator}
            )
            
            return jsonify({
                "token": token, 
                "success": True, 
                "rol": rol_utilizator,
                "username": username_db
            }), 200
        else:
            return jsonify({"msg": "Date de logare incorecte sau cont inactiv"}), 401
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
from flask_jwt_extended import jwt_required, get_jwt_identity

@app.route('/api/utilizatori/profil-meu', methods=['GET'])
@jwt_required()
def get_profil_meu_utilizator():
    try:
        identity = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
    
        query = """
            SELECT 
                u.id_utilizator,
                u.id_angajat,
                a.nume AS nume_real,
                a.prenume AS prenume_real,
                u.username,
                u.rol,
                u.activ,
                u.ultima_autentificare
            FROM utilizatori u
            LEFT JOIN angajati a ON u.id_angajat = a.id_angajat
            WHERE u.id_utilizator = %s OR u.username = %s
        """
        # Trimitem identitatea în ambele sloturi pentru siguranță completă
        cursor.execute(query, (identity, identity))
        user_data = cursor.fetchone()
        
        if not user_data:
            return jsonify({
                "status": "eroare", 
                "mesaj": f"Utilizatorul cu identitatea '{identity}' nu exista in baza de date."
            }), 404
            
        return jsonify({
            "status": "succes",
            "date_profil": user_data
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/evaluari', methods=['GET'])
@jwt_required()
def get_evaluari():
    # Acum current_user este direct string-ul cu ID respectiv
    id_utilizator = get_jwt_identity() 
    
    try:
        conn = mysql.connector.connect(
            user='root', password='', host='127.0.0.1', database='my_database'
        )
        cursor = conn.cursor(dictionary=True)
        
        # Interogăm tabelul folosind ID-ul primit
        query = """
            SELECT data_evaluare, scor_tehnic, scor_comunicare, scor_leadership, scor_final, feedback
            FROM evaluari 
            WHERE id_angajat = %s 
            ORDER BY data_evaluare DESC
        """
        cursor.execute(query, (id_utilizator,))
        rezultate = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return jsonify(rezultate), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/manageri', methods=['GET'])
@jwt_required()
def get_manageri():
    id_utilizator = get_jwt_identity()
    
    try:
        conn = mysql.connector.connect(
            user='root', password='', host='127.0.0.1', database='my_database'
        )
        cursor = conn.cursor(dictionary=True)
        
        # Aflăm cine este managerul angajatului curent
        query = """
            SELECT m.id_manager, a2.nume AS nume_manager, a2.prenume AS prenume_manager
            FROM angajati a1
            JOIN manageri m ON a1.id_manager = m.id_manager
            JOIN angajati a2 ON m.id_angajat = a2.id_angajat
            WHERE a1.id_angajat = %s
        """
        cursor.execute(query, (id_utilizator,))
        manager_data = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if manager_data:
            return jsonify(manager_data), 200
        return jsonify({"msg": "Nu s-a găsit un manager asociat"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/istoric-salarial', methods=['GET'])
@jwt_required()
def get_istoric_salarial():
    id_utilizator = get_jwt_identity()
    
    try:
        conn = mysql.connector.connect(
            user='root', password='', host='127.0.0.1', database='my_database'
        )
        cursor = conn.cursor(dictionary=True)
        
        # Preluăm toate modificările salariale
        query = """
            SELECT data_modificare, salariu_vechi, salariu_nou, motiv
            FROM istoric_salarial 
            WHERE id_angajat = %s 
            ORDER BY data_modificare DESC
        """
        cursor.execute(query, (id_utilizator,))
        rezultate = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return jsonify(rezultate), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/notificari', methods=['GET'])
@jwt_required()
def get_notificari():
    id_utilizator = get_jwt_identity()
    
    try:
        conn = mysql.connector.connect(
            user='root', password='', host='127.0.0.1', database='my_database'
        )
        cursor = conn.cursor(dictionary=True)
        
        # Preluăm notificările active pentru utilizatorul logat
        query = """
            SELECT id_notificare, mesaj, data_creare, citita 
            FROM notificari 
            WHERE id_angajat = %s 
            ORDER BY data_creare DESC
        """
        cursor.execute(query, (id_utilizator,))
        rezultate = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return jsonify(rezultate), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/notificari/marcheaza-citit', methods=['PUT'])
def marcheaza_notificari_citite():
    try:
        data = request.get_json()
        
        id_notificare = data.get('id_notificare')
        id_angajat = data.get('id_angajat')
        
        # Validare elementară: avem nevoie de măcar un parametru
        if not id_notificare and not id_angajat:
            return jsonify({
                "status": "eroare", 
                "mesaj": "Trebuie sa furnizati id_notificare sau id_angajat."
            }), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        #Marcăm o singură notificare specifică utilizând câmpul 'citita'
        if id_notificare:
            query = "UPDATE notificari SET citita = 1 WHERE id_notificare = %s"
            cursor.execute(query, (id_notificare,))
            mesaj_succes = f"Notificarea cu ID {id_notificare} a fost marcata ca citita."
            
        #Marcăm toate notificările unui anumit angajat ca fiind citite
        elif id_angajat:
            query = "UPDATE notificari SET citita = 1 WHERE id_angajat = %s"
            cursor.execute(query, (id_angajat,))
            mesaj_succes = f"Toate colaborarile si notificarile angajatului {id_angajat} au fost marcate ca citite."
            
        conn.commit()
        
        return jsonify({
            "status": "succes",
            "mesaj": mesaj_succes
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()
    
@app.route('/api/ml/comparatie', methods=['GET'])
def get_ml_comparatie():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                rf.id_angajat,
                rf.probabilitate  AS prob_rf,
                lr.probabilitate  AS prob_lr,
                xgb.probabilitate AS prob_xgb,
                rf.nivel_risc     AS risc_rf,
                lr.nivel_risc     AS risc_lr,
                xgb.nivel_risc    AS risc_xgb,
                a.salariu_curent,
                ROUND(DATEDIFF(CURDATE(), a.data_angajare) / 365, 2) AS vechime_ani,
                p.titlu           AS nivel_pozitie,
                d.nume            AS departament
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
def get_ml_statistici():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # distributia riscului per model
        cursor.execute("""
            SELECT
                'Random Forest' AS model,
                SUM(CASE WHEN nivel_risc = 'Mare'  THEN 1 ELSE 0 END) AS mare,
                SUM(CASE WHEN nivel_risc = 'Mediu' THEN 1 ELSE 0 END) AS mediu,
                SUM(CASE WHEN nivel_risc = 'Mic'   THEN 1 ELSE 0 END) AS mic,
                COUNT(*) AS total
            FROM predictii_churn_rf
            UNION ALL
            SELECT
                'Logistic Regression',
                SUM(CASE WHEN nivel_risc = 'Mare'  THEN 1 ELSE 0 END),
                SUM(CASE WHEN nivel_risc = 'Mediu' THEN 1 ELSE 0 END),
                SUM(CASE WHEN nivel_risc = 'Mic'   THEN 1 ELSE 0 END),
                COUNT(*)
            FROM predictii_churn_lr
            UNION ALL
            SELECT
                'XGBoost',
                SUM(CASE WHEN nivel_risc = 'Mare'  THEN 1 ELSE 0 END),
                SUM(CASE WHEN nivel_risc = 'Mediu' THEN 1 ELSE 0 END),
                SUM(CASE WHEN nivel_risc = 'Mic'   THEN 1 ELSE 0 END),
                COUNT(*)
            FROM predictii_churn_xgb
        """)
        distributie = cursor.fetchall()

        # consens intre modele
        cursor.execute("""
            SELECT COUNT(*) AS consens_mare
            FROM predictii_churn_rf rf
            JOIN predictii_churn_lr  lr  ON rf.id_angajat = lr.id_angajat
            JOIN predictii_churn_xgb xgb ON rf.id_angajat = xgb.id_angajat
            WHERE rf.nivel_risc = 'Mare'
            AND   lr.nivel_risc = 'Mare'
            AND  xgb.nivel_risc = 'Mare'
        """)
        consens = cursor.fetchone()

        return jsonify({
            "status":      "succes",
            "distributie": distributie,
            "consens_mare": consens['consens_mare']
        }), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals(): conn.close()

@app.route('/api/audit-log', methods=['GET'])
def get_audit_log():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                id_log,
                tabel,
                id_inregistrare,
                actiune,         
                coloana,
                valoare_veche,
                valoare_noua,
                utilizator,
                data_actiune
            FROM audit_log 
            ORDER BY data_actiune DESC 
            LIMIT 200
        """
        cursor.execute(query)
        logs = cursor.fetchall()
        
        return jsonify({
            "status": "succes",
            "total_logs": len(logs),
            "date_audit": logs
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
        
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()
        
@app.route('/api/alocari-proiecte/<int:id_angajat>', methods=['GET'])
def get_alocari_angajat(id_angajat):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT 
                ap.id_alocare,
                ap.id_angajat,
                ap.id_proiect,
                p.nume AS nume_proiect,
                ap.rol_proiect,
                ap.ore_alocate,
                ap.data_start AS data_start_alocare,
                ap.data_sfarsit AS data_sfarsit_alocare,
                p.buget AS buget_proiect
            FROM alocari_proiecte ap
            JOIN proiecte p ON ap.id_proiect = p.id_proiect
            WHERE ap.id_angajat = %s
            ORDER BY ap.data_start DESC
        """
        cursor.execute(query, (id_angajat,))
        alocari = cursor.fetchall()
        
        return jsonify({
            "status": "succes",
            "total_alocari": len(alocari),
            "date_alocari": alocari
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/alocari-proiecte', methods=['POST'])
def adauga_alocare_proiect():
    try:
        data = request.get_json()
        
        id_angajat = data.get('id_angajat')
        id_proiect = data.get('id_proiect')
        rol_proiect = data.get('rol_proiect', 'Membru Echipa')
        ore_alocate = data.get('ore_alocate', 8)
        data_start = data.get('data_start')       
        data_sfarsit = data.get('data_sfarsit')   
        
        # Validare câmpuri obligatorii
        if not id_angajat or not id_proiect:
            return jsonify({"status": "eroare", "mesaj": "Lipsesc id_angajat sau id_proiect!"}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
    
        query = """
            INSERT INTO alocari_proiecte (id_angajat, id_proiect, rol_proiect, ore_alocate, data_start, data_sfarsit)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (id_angajat, id_proiect, rol_proiect, ore_alocate, data_start, data_sfarsit))
        conn.commit()
        
        return jsonify({
            "status": "succes", 
            "mesaj": f"Angajatul a fost alocat cu succes pe proiectul cu ID {id_proiect}.",
            "id_alocare_generat": cursor.lastrowid
        }), 201

    except mysql.connector.Error as err:
        return jsonify({"status": "eroare_db", "detalii": str(err)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/alocari-proiecte/<int:id_alocare>', methods=['DELETE'])
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

print("--- RUTE DECOPERITE DE FLASK ---")
print(app.url_map)
print("--------------------------------")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
