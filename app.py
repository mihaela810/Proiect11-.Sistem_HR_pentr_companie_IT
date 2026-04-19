from flask import Flask, jsonify, request
from flask_cors import CORS
from flask import request
import re

app = Flask(__name__)
CORS(app)
regex_email = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

mock_angajati = [
    {
        "id_angajat": 1,
        "nume": "Ionescu",
        "prenume": "Maria",
        "cnp": "2900101123456",
        "email": "maria.ionescu@email.com",
        "telefon": "0722123456",
        "data_angajare": "2023-01-15",
        "id_departament": 10,
        "id_pozitie": 2,
        "id_manager": None,
        "status": "activ"
    },
    {
        "id_angajat": 2,
        "nume": "Popescu",
        "prenume": "Andrei",
        "cnp": "1850505123456",
        "email": "andrei.popescu@email.com",
        "telefon": "0744987654",
        "data_angajare": "2022-05-20",
        "id_departament": 10,
        "id_pozitie": 3,
        "id_manager": 1,
        "status": "activ"
    }
]

@app.route('/')
def home():
    return "Sistem HR Backend activ!"

@app.route('/api/angajati', methods=['GET'])
def get_all_employees():
    return jsonify(mock_angajati)

@app.route('/api/angajati/<int:emp_id>', methods=['GET'])
def get_employee(emp_id):
    angajat = next((emp for emp in mock_angajati if emp["id"] == emp_id), None)
    if angajat:
        return jsonify(angajat)
    return jsonify({"error": "Angajat negasit"}), 404

@app.route('/api/predict-churn/<int:emp_id>', methods=['GET'])
def predict_churn(emp_id):
    #aici se va apela functia scrisa de tine, Miha
    return jsonify({
        "id_angajat": emp_id,
        "mesaj": "Astept modelul tau"
    })

@app.route('/api/angajat/cauta', methods=['GET'])
def cauta_angajat():
    email_cautat = request.args.get('email')
    
    if not email_cautat:
        return jsonify({"eroare": "Te rugam sa introduci un email pentru cautare"}), 400

    for angajat in mock_angajati:
        if angajat['email'].lower() == email_cautat.lower():
            return jsonify(angajat)

    return jsonify({"mesaj": "Angajatul cu acest email nu a fost gasit"}), 404

@app.route('/api/angajati/departament/<int:dep_id>', methods=['GET'])
def angajati_per_departament(dep_id):
    rezultat = []
    
    for angajat in mock_angajati:
        if angajat['id_departament'] == dep_id:
            rezultat.append(angajat)
    
    if len(rezultat) == 0:
        return jsonify({"mesaj": f"Nu exista angajati in departamentul {dep_id}"}), 404
        
    return jsonify(rezultat)

@app.route('/api/angajati', methods=['POST'])
def adauga_angajat():
    date_noi = request.get_json()
    erori = [] 

    # 1. Validare câmpuri obligatorii din baza de date
    campuri = ['nume', 'prenume', 'cnp', 'email', 'telefon', 'an_angajare', 'luna_angajare', 'id_pozitie', 'id_departament', 'id_manager', 'status']
    for camp in campuri:
        if camp not in date_noi or not date_noi[camp]:
            erori.append(f"Campul '{camp}' lipseste.")

    # 2. Validare Email (doar dacă a fost trimis)
    email = date_noi.get('email', '')
    if email and not re.fullmatch(regex_email, email):
        erori.append("Email invalid.")
    if any(a['email'] == email for a in mock_angajati):
        erori.append("Email deja utilizat.")

    # 3. Validare CNP
    cnp = str(date_noi.get('cnp', ''))
    if len(cnp) != 13:
        erori.append("CNP-ul trebuie sa aiba 13 cifre.")

    # 4. Validare Telefon
    tel = str(date_noi.get('telefon', '')).replace(" ", "")
    if len(tel) < 7 or len(tel) > 17:
        erori.append("Telefonul trebuie sa aiba intre 7 si 17 cifre.")

    # 5. Validarea anului si lunii angajarii
    an = date_noi.get('an_angajare')
    luna = date_noi.get('luna_angajare')
    if an and not (1900 <= int(an) <= 2026):
        erori.append("Anul trebuie sa fie intre 1900 si 2026.")
    if luna and not (1 <= int(luna) <= 12):
        erori.append("Luna trebuie sa fie intre 1 si 12.")

    if erori:

        return jsonify({"status": "eroare", "mesaje": erori}), 400

    nou_id = mock_angajati[-1]['id_angajat'] + 1
    date_noi['id_angajat'] = nou_id
    mock_angajati.append(date_noi)
    
    return jsonify({"mesaj": "Angajat adaugat!", "angajat": date_noi}), 201

@app.route('/api/angajati/<int:id_angajat>', methods=['PUT'])
def actualizeaza_angajat(id_angajat):
    date_actualizate = request.get_json()
    
    for angajat in mock_angajati:
        if angajat['id_angajat'] == id_angajat:
            # Actualizăm doar câmpurile pe care le dorim
            angajat.update(date_actualizate)
            return jsonify({"mesaj": "Date actualizate!", "angajat": angajat}), 200
            
    return jsonify({"eroare": "Angajatul nu a fost gasit"}), 404

@app.route('/api/angajati/<int:id_angajat>', methods=['DELETE'])
def sterge_angajat(id_angajat):
    global mock_angajati
    
    angajat_de_sters = next((a for a in mock_angajati if a['id_angajat'] == id_angajat), None)
    
    if angajat_de_sters:
        mock_angajati = [a for a in mock_angajati if a['id_angajat'] != id_angajat]
        return jsonify({"mesaj": f"Angajatul cu ID {id_angajat} a fost sters cu succes"}), 200
    
    return jsonify({"eroare": "Angajatul nu a fost gasit"}), 404

print("--- RUTE DECOPERITE DE FLASK ---")
print(app.url_map)
print("--------------------------------")

if __name__ == '__main__':
    app.run(debug=True, port=5001)