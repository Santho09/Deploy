import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib

# ✅ Load the dataset
df = pd.read_csv("sleep_dataset.csv")  # Change this to your actual dataset file

# ✅ Select relevant features and target variables
features = ["Sleep Time (hrs)", "Sleep Interruptions", "Stress Level (1-10)", 
            "Physical Activity (min/day)", "Screen Time Before Bed (min)"]

targets = ["Total Hours of Sleep", "Sleep Efficiency (%)", "Deep Sleep (%)", 
           "REM Sleep (%)", "Sleep Score", "Sleep Health", "Recommendations"]

# ✅ Encode categorical target variable (Sleep Health)
label_encoder = LabelEncoder()
df["Sleep Health"] = label_encoder.fit_transform(df["Sleep Health"])

# ✅ Split dataset into features (X) and target variables (Y)
X = df[features]
y_numeric = df[["Total Hours of Sleep", "Sleep Efficiency (%)", "Deep Sleep (%)", "REM Sleep (%)", "Sleep Score"]]
y_categorical = df[["Sleep Health", "Recommendations"]]

# ✅ Train/Test split
X_train, X_test, y_train_num, y_test_num = train_test_split(X, y_numeric, test_size=0.2, random_state=42)
_, _, y_train_cat, y_test_cat = train_test_split(X, y_categorical, test_size=0.2, random_state=42)

# ✅ Train regression model for numeric predictions
num_model = RandomForestRegressor(n_estimators=100, random_state=42)
num_model.fit(X_train, y_train_num)

# ✅ Train classification model for categorical predictions
cat_model = RandomForestRegressor(n_estimators=100, random_state=42)  # Using regression for categorical for simplicity
cat_model.fit(X_train, y_train_cat.applymap(lambda x: hash(x)))  # Convert text to numerical hash

# ✅ Save the models
joblib.dump(num_model, "sleep_numeric_model.pkl")
joblib.dump(cat_model, "sleep_categorical_model.pkl")
joblib.dump(label_encoder, "sleep_label_encoder.pkl")

print("✅ Model training complete! Models saved.")
