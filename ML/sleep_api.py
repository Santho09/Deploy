from flask import Blueprint, request, jsonify
import joblib, numpy as np

sleep_bp = Blueprint("sleep", __name__)

# Load models
num_model = joblib.load("sleep_regressor.pkl")
cat_model = joblib.load("sleep_classifier.pkl")
label_encoders = joblib.load("label_encoders.pkl")

@sleep_bp.route("/sleep", methods=["POST"])
def predict_sleep():
    try:
        data = request.json
        age = int(data.get("Age", 0))
        gender = data.get("Gender", "Male")
        sleep_time = float(data.get("Sleep_Time", 0))
        sleep_interruptions = int(data.get("Sleep_Interruptions", 0))
        stress_level = int(data.get("Stress_Level", 0))
        physical_activity = int(data.get("Physical_Activity", 0))
        screen_time = int(data.get("Screen_Time", 0))

        gender_encoded = label_encoders["Gender"].transform([gender])[0]

        input_data = np.array([[age, gender_encoded, sleep_time,
                                sleep_interruptions, stress_level,
                                physical_activity, screen_time]])

        num_predictions = num_model.predict(input_data)
        cat_predictions = cat_model.predict(input_data)

        decoded_predictions = {
            "Sleep Health": label_encoders["Sleep Health"].inverse_transform([cat_predictions[0][0]])[0],
            "Recommendations": label_encoders["Recommendations"].inverse_transform([cat_predictions[0][1]])[0]
        }

        response = {
            "Total Hours of Sleep": round(num_predictions[0][0], 2),
            "Sleep Efficiency (%)": round(num_predictions[0][1], 2),
            "Deep Sleep (%)": round(num_predictions[0][2], 2),
            "REM Sleep (%)": round(num_predictions[0][3], 2),
            "Sleep Score": round(num_predictions[0][4], 2),
            **decoded_predictions
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
