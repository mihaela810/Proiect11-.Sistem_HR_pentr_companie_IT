from flask import Flask, jsonify, request
from flask_cors import CORS
from flask import request
import re
import mysql.connector
from datetime import datetime

app = Flask(__name__)
CORS(app)
regex_email = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

db_config = {
    'host': 'localhost', 
    'user': 'root',
    'password': '',
    'database': 'my_database'
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

@app.route('/api/angajati/profil/<int:id>', methods=['GET'])
def get_profil_complet(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # date din baza
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

        # Analiza salariala rapida pentru profil
        salariu = float(profil['salariu_curent'])
        medie = (float(profil['salariu_min']) + float(profil['salariu_max'])) / 2
        profil['analiza_piata'] = {
            "compa_ratio": f"{round((salariu / medie) * 100, 2)}%",
            "pozitie_grila": "Sub medie" if salariu < medie else "Peste medie"
        }

        # Istoric Salarial
        cursor.execute("SELECT * FROM istoric_salarial WHERE id_angajat = %s ORDER BY data_modificare DESC", (id,))
        profil['istoric_salarii'] = cursor.fetchall()

        # Evaluări
        cursor.execute("SELECT * FROM evaluari WHERE id_angajat = %s ORDER BY data_evaluare DESC", (id,))
        profil['evaluari'] = cursor.fetchall()

        # Proiecte Active
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

@app.route('/api/concedii/decizie/<int:id_concediu>', methods=['PUT'])
def decide_concediu(id_concediu):
    date = request.get_json()
    nou_status = date.get('status')  # status = 'aprobat' sau 'respins'
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

@app.route('/api/evaluari', methods=['POST'])
def adauga_evaluare():
    date = request.get_json()
    id_angajat = date.get('id_angajat')
    s_tehnic = int(date.get('scor_tehnic'))
    s_comunicare = int(date.get('scor_comunicare'))
    s_leadership = int(date.get('scor_leadership'))

    # LOGICA DE BUSINESS: Calculăm media scorului final în backend
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

print("--- RUTE DECOPERITE DE FLASK ---")
print(app.url_map)
print("--------------------------------")

if __name__ == '__main__':
    app.run(debug=True, port=5001)