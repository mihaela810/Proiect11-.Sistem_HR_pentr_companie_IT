from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

mock_angajati = [
    {"id": 1, "nume": "Ionescu", "prenume": "Andrei", "functie": "Software Developer", "manager_id": None},
    {"id": 2, "nume": "Popescu", "prenume": "Maria", "functie": "Junior Dev", "manager_id": 1},
    {"id": 3, "nume": "Georgescu", "prenume": "Elena", "functie": "HR Manager", "manager_id": None}
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
    return jsonify({
        "id_angajat": emp_id,
        "risc_plecare": "Low",
        "probabilitate": "15%"
    })

print("--- RUTE DECOPERITE DE FLASK ---")
print(app.url_map)
print("--------------------------------")

if __name__ == '__main__':
    app.run(debug=True, port=5001)