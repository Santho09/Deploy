import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_squared_error
import pickle

# Load dataset and encode categorical features
def load_data(file_path):
    df = pd.read_csv(file_path)

    # Encode categorical input features
    le_gender = LabelEncoder()
    df['Gender'] = le_gender.fit_transform(df['Gender'])

    le_activity = LabelEncoder()
    df['Physical_Activity_Level'] = le_activity.fit_transform(df['Physical_Activity_Level'])

    # Encode categorical target features
    le_diet = LabelEncoder()
    df['Diet_Recommendation'] = le_diet.fit_transform(df['Diet_Recommendation'])

    le_plan = LabelEncoder()
    df['Weight Loss / Weight Gain Plan'] = le_plan.fit_transform(df['Weight Loss / Weight Gain Plan'])

    le_recipe = LabelEncoder()
    df['Recommended Recipes'] = le_recipe.fit_transform(df['Recommended Recipes'])

    le_ingredients = LabelEncoder()
    df['Ingredients'] = le_ingredients.fit_transform(df['Ingredients'])

    return df, le_gender, le_activity, le_diet, le_plan, le_recipe, le_ingredients

# Train the model and save it to pkl
def train_model_and_save(df):
    input_features = ['Age', 'Gender', 'Weight_kg', 'Height_cm', 'Physical_Activity_Level']
    target_features = ['BMI', 'Daily_Caloric_Intake', 'Diet_Recommendation', 'Weight Loss / Weight Gain Plan',
                       'Recommended Recipes', 'Ingredients', 'Total Calories']

    X = df[input_features]
    y = df[target_features]

    # Split the dataset into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Use MultiOutputRegressor with RandomForestRegressor to handle multi-output regression
    model = MultiOutputRegressor(RandomForestRegressor(random_state=42))
    model.fit(X_train, y_train)

    # Predict the test set
    y_pred = model.predict(X_test)
    
    # Calculate Mean Squared Error for each output
    mse = mean_squared_error(y_test, y_pred, multioutput='raw_values')
    print("Model Training Complete. MSE for each output:", mse)

    # Save the model and encoders as pkl files
    with open('diet_recommendation_model.pkl', 'wb') as model_file:
        pickle.dump(model, model_file)

    with open('encoders.pkl', 'wb') as encoders_file:
        pickle.dump({
            'le_gender': le_gender,
            'le_activity': le_activity,
            'le_diet': le_diet,
            'le_plan': le_plan,
            'le_recipe': le_recipe,
            'le_ingredients': le_ingredients
        }, encoders_file)

    print("Model and encoders saved as pkl files.")

# Example usage
if __name__ == "__main__":
    # Load data
    df, le_gender, le_activity, le_diet, le_plan, le_recipe, le_ingredients = load_data('updated_diet_recommendation.csv')

    # Train model and save
    train_model_and_save(df)
