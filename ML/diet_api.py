from flask import Flask, request, jsonify
import pandas as pd
import pickle

# Load the model and encoders
with open('diet_recommendation_model.pkl', 'rb') as model_file:
    model = pickle.load(model_file)

with open('encoders.pkl', 'rb') as encoders_file:
    encoders = pickle.load(encoders_file)

le_gender = encoders['le_gender']
le_activity = encoders['le_activity']
le_diet = encoders['le_diet']
le_plan = encoders['le_plan']
le_recipe = encoders['le_recipe']

app = Flask(__name__)

# Predict diet recommendation based on input data
@app.route('/api/diet', methods=['POST'])
def predict():
    try:
        data = request.json

        # Convert input data into DataFrame
        input_data = pd.DataFrame({
            'Age': [data['Age']],
            'Gender': [data['Gender']],
            'Weight_kg': [data['Weight_kg']],
            'Height_cm': [data['Height_cm']],
            'Physical_Activity_Level': [data['Physical_Activity_Level']]
        })

        # Encode categorical data
        input_data['Gender'] = le_gender.transform(input_data['Gender'])
        input_data['Physical_Activity_Level'] = le_activity.transform(input_data['Physical_Activity_Level'])

        # Predict using the model
        predicted_output = model.predict(input_data)

        # Decode the predictions
        decoded_output = {
            'BMI': predicted_output[0][0],
            'Daily_Caloric_Intake': predicted_output[0][1],
            'Diet_Recommendation': le_diet.inverse_transform([int(predicted_output[0][2])])[0],
            'Weight Loss / Weight Gain Plan': le_plan.inverse_transform([int(predicted_output[0][3])])[0],
            'Recommended Recipes': le_recipe.inverse_transform([int(predicted_output[0][4])])[0],
            'Total Calories': predicted_output[0][5]
        }

        return jsonify(decoded_output)

    except Exception as e:
        return jsonify({'error': str(e)})

# Start the Flask server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
