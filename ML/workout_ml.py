import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier

# ✅ Load dataset
df = pd.read_csv("final_seniors_workout_schedule.csv")

# ✅ Encode categorical variables
label_encoders = {}

categorical_cols = ["Age", "Activity Level", "Gender", "Day", "Workout Schedule", "Exercise Plan"]
for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = le  # ✅ Save each encoder

# ✅ Define Features (X) and Target (y)
X = df[["Age", "Activity Level", "Gender", "Day"]]
y_workout = df["Workout Schedule"]
y_exercise = df["Exercise Plan"]  # ✅ Added Exercise Plan

# ✅ Train Random Forest model
model_workout = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
model_workout.fit(X, y_workout)

model_exercise = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
model_exercise.fit(X, y_exercise)  # ✅ Train model for Exercise Plan

# ✅ Save models
joblib.dump(model_workout, "workout_recommender.pkl")
joblib.dump(model_exercise, "exercise_recommender.pkl")  # ✅ Save Exercise Plan Model
joblib.dump(label_encoders, "workout_label_encoders.pkl")  # ✅ Save all encoders

print("✅ Models & Encoders Trained & Saved Successfully!")
