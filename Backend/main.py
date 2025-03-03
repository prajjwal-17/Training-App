from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import mysql.connector
from datetime import datetime
import sqlite3

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database connection
db = mysql.connector.connect(
    host="localhost",
    user="root",      # Change as per your DB credentials
    password="ur_password",
    database="ur_database"
)
cursor = db.cursor()

# Create table if not exists
cursor.execute("""
    CREATE TABLE IF NOT EXISTS session_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        exercise_mode VARCHAR(50),
        reps INT,
        duration INT,
        date_time DATETIME
    )
""")
db.commit()

@app.route('/save_report', methods=['POST'])
def save_report():
    data = request.json
    print("Received Data:", data)  # Debugging line to print received data

    try:
        exercise_mode = data.get("exerciseMode", "Unknown")
        reps = int(data.get("reps", 0))  # Ensure integer values
        duration = int(data.get("duration", 0))
        date_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        sql = "INSERT INTO session_reports (exercise_mode, reps, duration, date_time) VALUES (%s, %s, %s, %s)"
        values = (exercise_mode, reps, duration, date_time)
        
        cursor.execute(sql, values)
        db.commit()

        return jsonify({"message": "Session report saved successfully!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    cursor = db.cursor()  # Use the existing database connection
    cursor.execute("SELECT * FROM session_reports ORDER BY date_time DESC")
    sessions = cursor.fetchall()
    cursor.close()

    # Convert results to a list of dictionaries
    sessions_list = []
    for session in sessions:
        sessions_list.append({
            "id": session[0],
            "exercise_mode": session[1],
            "reps": session[2],
            "duration": session[3],
            "date_time": session[4].strftime('%Y-%m-%d %H:%M:%S')  # Convert datetime to string
        })

    return jsonify(sessions_list)

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

# Initialize global variables
counter = 0
stage = None
exercise_mode = "bicep"  # Default mode

# Initialize Mediapipe
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

def calculate_angle(a, b, c):
    """Calculate the angle between three points."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    return 360 - angle if angle > 180 else angle

@app.route('/set_exercise_mode', methods=['POST'])
def set_exercise_mode():
    """Set the exercise mode (Bicep Curl or Push-up)."""
    global exercise_mode
    data = request.json
    if "mode" in data:
        exercise_mode = data["mode"]
        return jsonify({"message": f"Exercise mode set to {exercise_mode}"}), 200
    return jsonify({"error": "Mode not provided"}), 400

@app.route('/start', methods=['POST'])
def start_tracking():
    """Start the rep counter."""
    global counter, stage
    counter = 0
    stage = None
    return jsonify({"message": "Tracking started", "counter": counter})

@app.route('/stop', methods=['POST'])
def stop_tracking():
    """Stop the rep counter."""
    return jsonify({"message": "Tracking stopped"})

@app.route('/count', methods=['GET'])
def get_count():
    """Get the current rep count."""
    return jsonify({"counter": counter})

def generate_frames():
    """Capture frames from the webcam and process them for pose estimation."""
    global counter, stage, exercise_mode

    cap = cv2.VideoCapture(0)

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Convert frame to RGB for Mediapipe
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = pose.process(image)
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            try:
                landmarks = results.pose_landmarks.landmark

                # Extract key points
                shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, 
                            landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, 
                         landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, 
                         landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]

                angle = calculate_angle(shoulder, elbow, wrist)
                angle_threshold = 30 if exercise_mode == "bicep" else 50  # 30° for curls, 50° for push-ups

                # Rep counting logic based on exercise mode
                if exercise_mode == "bicep":
                    if angle > 170:
                        stage = "down"
                    if angle < angle_threshold and stage == "down":
                        stage = "up"
                        counter += 1
                else:  # Push-up Mode
                    if angle > 170:
                        stage = "up"
                    if angle < angle_threshold and stage == "up":
                        stage = "down"
                        counter += 1

                # Overlay text on frame
                cv2.putText(image, f"Mode: {exercise_mode}", (10, 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2, cv2.LINE_AA)
                cv2.putText(image, f"Reps: {counter}", (10, 70), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
                cv2.putText(image, f"Stage: {stage}", (10, 110), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)

                mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                          mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2),
                                          mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2))

            except Exception as e:
                print("Error:", e)

            # Encode and send frame
            _, buffer = cv2.imencode('.jpg', image)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    cap.release()
    cv2.destroyAllWindows()

@app.route('/video_feed')
def video_feed():
    """Stream the processed video feed."""
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/generate_plan', methods=['POST'])
def fitness_chatbot():
    """
    API endpoint to generate a personalized fitness and nutrition plan.
    Accepts JSON input and returns a JSON response.
    """
    data = request.json  # Get JSON data from request

    name = data.get("name")
    age = data.get("age")
    weight = data.get("weight")
    height = data.get("height")
    fitness_goal = data.get("fitness_goal")
    experience_level = data.get("experience_level")
    diet_preference = data.get("diet_preference")

    # Validate required inputs
    if not all([name, age, weight, height, fitness_goal, experience_level, diet_preference]):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Calculate BMI
    bmi = weight / ((height / 100) ** 2)
    
    # Determine BMI category
    if bmi < 18.5:
        bmi_category = "underweight"
    elif bmi < 25:
        bmi_category = "normal weight"
    elif bmi < 30:
        bmi_category = "overweight"
    else:
        bmi_category = "obese"

    # Determine recommended workout frequency
    workout_days = {"beginner": 3, "intermediate": 4, "advanced": 5}.get(experience_level, 3)

    # Determine training approach
    if fitness_goal == 'weight_loss':
        cardio_minutes = 30
        workout_type = "Higher rep ranges (12-15 reps) with moderate weight"
    elif fitness_goal == 'muscle_gain':
        cardio_minutes = 15
        workout_type = "Medium rep ranges (8-12 reps) with challenging weight"
    else:  # general_fitness
        cardio_minutes = 20
        workout_type = "Mixed rep ranges (8-15 reps) with moderate weight"

    # Calculate daily nutrition requirements
    daily_calories = weight * (24 if age < 30 else 22) * (0.8 if fitness_goal == 'weight_loss' else (1.1 if fitness_goal == 'muscle_gain' else 1.0))
    protein_g = weight * (2.0 if fitness_goal == 'weight_loss' else (2.2 if fitness_goal == 'muscle_gain' else 1.6))
    fats_g = weight * 0.8 if fitness_goal == 'weight_loss' else weight * 1.0
    carbs_g = (daily_calories - (protein_g * 4 + fats_g * 9)) / 4

    # Estimate monthly budget
    monthly_budget_inr = 8000 if diet_preference == "veg" else 10000

    return jsonify({
        "name": name,
        "bmi": round(bmi, 1),
        "bmi_category": bmi_category,
        "recommended_workout_days": workout_days,
        "cardio_minutes": cardio_minutes,
        "workout_type": workout_type,
        "daily_nutrition": {
            "calories": int(daily_calories),
            "protein_g": int(protein_g),
            "carbs_g": int(max(0, carbs_g)),
            "fats_g": int(fats_g)
        },
        "monthly_budget_inr": monthly_budget_inr,
        "message": "Your personalized fitness plan has been generated!"
    })

if __name__ == '__main__':
    app.run(debug=True)
