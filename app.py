from flask import Flask, jsonify, request
from flask_cors import CORS
from flask import request

app = Flask(__name__)
CORS(app)

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
    #aici se va apela functia scrisa de tine
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

print("--- RUTE DECOPERITE DE FLASK ---")
print(app.url_map)
print("--------------------------------")

if __name__ == '__main__':
    app.run(debug=True, port=5001)