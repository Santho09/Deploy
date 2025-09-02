from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import cv2, numpy as np, mediapipe as mp

# Import blueprints
from diet_api import diet_bp
from sleep_api import sleep_bp
from workout_api import workout_bp
from medical_chatbot_api import medical_bp

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Register blueprints
app.register_blueprint(diet_bp, url_prefix="/api")
app.register_blueprint(sleep_bp, url_prefix="/api")
app.register_blueprint(workout_bp, url_prefix="/api")
app.register_blueprint(medical_bp, url_prefix="/api")

# -------- Workout Tracking Events -------- #
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

@socketio.on("start_workout")
def start_workout(data):
    exercise = data.get("exercise", "bicep curl")
    emit("rep_update", {"exercise": exercise, "reps": 0})

@socketio.on("stop_workout")
def stop_workout():
    emit("workout_stopped", {"message": "Workout tracking stopped"})

# Run server
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)

