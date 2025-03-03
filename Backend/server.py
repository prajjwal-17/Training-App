from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

from flask_cors import CORS
CORS(app)


def init_db():
    conn = sqlite3.connect("workout.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exercise TEXT,
            reps INTEGER,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

@app.route('/add_workout', methods=['POST'])
def add_workout():
    try:
        data = request.json
        exercise = data['exercise']
        reps = data['reps']
        timestamp = data['timestamp']

        conn = sqlite3.connect("workout.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO workouts (exercise, reps, timestamp) VALUES (?, ?, ?)", 
                       (exercise, reps, timestamp))
        conn.commit()
        conn.close()

        return jsonify({"message": "Workout added successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_workouts', methods=['GET'])
def get_workouts():
    conn = sqlite3.connect("workout.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM workouts")
    workouts = cursor.fetchall()
    conn.close()

    return jsonify(workouts)

if __name__ == '__main__':
    app.run(debug=True)