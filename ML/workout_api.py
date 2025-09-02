from flask import Blueprint, request, jsonify
import joblib

workout_bp = Blueprint("workout", __name__)

# Load models
model_workout = joblib.load("workout_recommender.pkl")
model_exercise = joblib.load("exercise_recommender.pkl")
label_encoders = joblib.load("workout_label_encoders.pkl")

le_age = label_encoders["Age"]
le_activity = label_encoders["Activity Level"]
le_gender = label_encoders["Gender"]
le_day = label_encoders["Day"]
le_workout = label_encoders["Workout Schedule"]
le_exercise = label_encoders["Exercise Plan"]

@workout_bp.route("/workout", methods=["POST"])
def recommend_workout():
    try:
        data = request.json
        age_encoded = le_age.transform([data["Age"]])[0]
        activity_encoded = le_activity.transform([data["Activity Level"]])[0]
        gender_encoded = le_gender.transform([data["Gender"]])[0]

        recommendations = {}
        for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:
            day_encoded = le_day.transform([day])[0]
            workout_pred = model_workout.predict([[age_encoded, activity_encoded, gender_encoded, day_encoded]])
            exercise_pred = model_exercise.predict([[age_encoded, activity_encoded, gender_encoded, day_encoded]])

            recommendations[day] = {
                "Workout Schedule": le_workout.inverse_transform(workout_pred)[0],
                "Exercise Plan": le_exercise.inverse_transform(exercise_pred)[0]
            }
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
