from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Load trained models and encoders
num_model = joblib.load("sleep_regressor.pkl")  # Regression model for numerical predictions
cat_model = joblib.load("sleep_classifier.pkl")  # Classification model for categorical predictions
label_encoders = joblib.load("label_encoders.pkl")  # Encoders for categorical variables

# Input features
input_features = ["Age", "Gender", "Sleep Time (hrs)", "Sleep Interruptions", "Stress Level (1-10)", 
                  "Physical Activity (min/day)", "Screen Time Before Bed (min)"]

# API Endpoint: Predict Sleep Recommendations
@app.route("/api/sleep", methods=["POST"])
def predict_sleep():
    try:
        # Get JSON request data
        data = request.json
        age = int(data.get("Age", 0))
        gender = data.get("Gender", "Male")  # Default to Male
        sleep_time = float(data.get("Sleep_Time", 0))
        sleep_interruptions = int(data.get("Sleep_Interruptions", 0))
        stress_level = int(data.get("Stress_Level", 0))
        physical_activity = int(data.get("Physical_Activity", 0))
        screen_time = int(data.get("Screen_Time", 0))

        # Encode Gender
        if gender not in label_encoders["Gender"].classes_:
            return jsonify({"error": f"Invalid gender '{gender}', must be one of {label_encoders['Gender'].classes_.tolist()}"}), 400
        
        gender_encoded = label_encoders["Gender"].transform([gender])[0]

        # Prepare input array
        input_data = np.array([[age, gender_encoded, sleep_time, sleep_interruptions, stress_level, physical_activity, screen_time]])

        # Predict numerical outputs
        num_predictions = num_model.predict(input_data)

        # Predict categorical outputs
        cat_predictions = cat_model.predict(input_data)

        # Decode categorical predictions
        decoded_predictions = {
            "Sleep Health": label_encoders["Sleep Health"].inverse_transform([cat_predictions[0][0]])[0],
            "Recommendations": label_encoders["Recommendations"].inverse_transform([cat_predictions[0][1]])[0]
        }

        # Format response
        response = {
            "Total Hours of Sleep": round(num_predictions[0][0], 2),
            "Sleep Efficiency (%)": round(num_predictions[0][1], 2),
            "Deep Sleep (%)": round(num_predictions[0][2], 2),
            "REM Sleep (%)": round(num_predictions[0][3], 2),
            "Sleep Score": round(num_predictions[0][4], 2),
            "Sleep Health": decoded_predictions["Sleep Health"],
            "Recommendations": decoded_predictions["Recommendations"]
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask server
if __name__ == "__main__":
    app.run(port=5005, debug=True)
