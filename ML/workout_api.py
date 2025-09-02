from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# ✅ Load trained models
model_workout = joblib.load("workout_recommender.pkl")
model_exercise = joblib.load("exercise_recommender.pkl")  # ✅ Load Exercise Plan model
label_encoders = joblib.load("workout_label_encoders.pkl")

# ✅ Load Label Encoders
le_age = label_encoders["Age"]
le_activity = label_encoders["Activity Level"]
le_gender = label_encoders["Gender"]
le_day = label_encoders["Day"]
le_workout = label_encoders["Workout Schedule"]
le_exercise = label_encoders["Exercise Plan"]  # ✅ Now it exists!

@app.route("/api/workout", methods=["POST"])
def recommend_workout():
    try:
        data = request.json
        print(f"➡ Received data: {data}")

        # ✅ Validate input fields
        if not all(key in data for key in ["Age", "Activity Level", "Gender"]):
            return jsonify({"error": "Missing required fields (Age, Activity Level, Gender)"}), 400

        # ✅ Convert input to numerical values
        age_encoded = le_age.transform([data["Age"]])[0]
        activity_encoded = le_activity.transform([data["Activity Level"]])[0]
        gender_encoded = le_gender.transform([data["Gender"]])[0]

        recommendations = {}

        # ✅ Generate recommendations for each day
        for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:
            day_encoded = le_day.transform([day])[0]

            workout_prediction = model_workout.predict([[age_encoded, activity_encoded, gender_encoded, day_encoded]])
            exercise_prediction = model_exercise.predict([[age_encoded, activity_encoded, gender_encoded, day_encoded]])

            workout_decoded = le_workout.inverse_transform(workout_prediction)[0]
            exercise_decoded = le_exercise.inverse_transform(exercise_prediction)[0]  # ✅ Get Exercise Plan

            recommendations[day] = {
                "Workout Schedule": workout_decoded,
                "Exercise Plan": exercise_decoded  # ✅ Added Exercise Plan in response
            }

        return jsonify(recommendations)

    except KeyError as e:
        print(f"❌ KeyError: {e}")
        return jsonify({"error": f"Invalid input value: {str(e)}"}), 400
    except ValueError as e:
        print(f"❌ ValueError: {e}")
        return jsonify({"error": f"Value transformation error: {str(e)}"}), 400
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003, debug=True)
