// BMI Calculation
function calculateBMI(weight, height) {
    const bmi = (weight / ((height / 100) ** 2)).toFixed(2);
    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal weight";
    else if (bmi < 30) category = "Overweight";
    else category = "Obesity";
    
    return { bmi, category };
}

// BMR Calculation
function calculateBMR(weight, height, age, gender) {
    let bmr;
    if (gender.toLowerCase() === "male") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    return bmr;
}

// Calorie Requirement Calculation
function calculateCalorieIntake(weight, height, age, gender, activityLevel) {
    const bmr = calculateBMR(weight, height, age, gender);
    const activityMultiplier = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very active": 1.9
    };
    return Math.round(bmr * (activityMultiplier[activityLevel] || 1.2));
}

module.exports = { calculateBMI, calculateBMR, calculateCalorieIntake };
