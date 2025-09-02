from flask import Flask, request
from flask_socketio import SocketIO, emit
import cv2
import numpy as np
import mediapipe as mp

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Function to calculate angle
def calculate_angle(a, b, c):
    a = np.array([a.x, a.y])
    b = np.array([b.x, b.y])
    c = np.array([c.x, c.y])
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    return np.degrees(np.arccos(np.clip(cosine_angle, -1.0, 1.0)))

# Exercise Configurations
exercise_configs = {
    "bicep curl": {
        "landmarks": [mp_pose.PoseLandmark.LEFT_SHOULDER.value,
                      mp_pose.PoseLandmark.LEFT_ELBOW.value,
                      mp_pose.PoseLandmark.LEFT_WRIST.value],
        "up_angle": 150,
        "down_angle": 60
    },
    "squats": {
        "landmarks": [mp_pose.PoseLandmark.LEFT_HIP.value,
                      mp_pose.PoseLandmark.LEFT_KNEE.value,
                      mp_pose.PoseLandmark.LEFT_ANKLE.value],
        "up_angle": 170,
        "down_angle": 90
    },
    "push-up": {
        "landmarks": [mp_pose.PoseLandmark.LEFT_SHOULDER.value,
                      mp_pose.PoseLandmark.LEFT_ELBOW.value,
                      mp_pose.PoseLandmark.LEFT_WRIST.value],
        "up_angle": 160,
        "down_angle": 90
    },
    "shoulder press": {
        "landmarks": [mp_pose.PoseLandmark.LEFT_SHOULDER.value,
                      mp_pose.PoseLandmark.LEFT_ELBOW.value,
                      mp_pose.PoseLandmark.LEFT_WRIST.value],
        "up_angle": 160,
        "down_angle": 70
    }
}

tracking_active = False  # Flag to stop tracking

@socketio.on("start_workout")
def start_workout(data):
    global tracking_active
    exercise = data.get("exercise")
    if exercise not in exercise_configs:
        emit("workout_error", {"message": "Invalid exercise selection"})
        return

    tracking_active = True
    config = exercise_configs[exercise]
    key_points = config["landmarks"]
    up_position = False
    total_reps = 0

    cap = cv2.VideoCapture(0)
    while cap.isOpened() and tracking_active:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(frame_rgb)

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            angle = calculate_angle(landmarks[key_points[0]],
                                    landmarks[key_points[1]],
                                    landmarks[key_points[2]])

            if angle > config["up_angle"]:
                up_position = True
            elif angle < config["down_angle"] and up_position:
                total_reps += 1
                up_position = False
                emit("rep_update", {"reps": total_reps}, broadcast=True)

            # Draw line to visualize movement
            cv2.line(frame,
                     (int(landmarks[key_points[0]].x * frame.shape[1]),
                      int(landmarks[key_points[0]].y * frame.shape[0])),
                     (int(landmarks[key_points[2]].x * frame.shape[1]),
                      int(landmarks[key_points[2]].y * frame.shape[0])),
                     (0, 255, 0), 3)

        # Convert frame to JPEG and send to frontend
        _, buffer = cv2.imencode(".jpg", frame)
        emit("video_feed", {"image": buffer.tobytes()})

        if cv2.waitKey(10) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    emit("workout_complete", {"total_reps": total_reps})

@socketio.on("stop_workout")
def stop_workout():
    global tracking_active
    tracking_active = False
    emit("workout_stopped", {"message": "Workout tracking stopped"})

if __name__ == "__main__":
    socketio.run(app, port=5007, debug=True)
