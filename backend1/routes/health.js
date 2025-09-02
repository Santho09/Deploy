const express = require("express");
const { calculateBMI, calculateBMR, calculateCalorieIntake } = require("../utils/healthUtils");
const router = express.Router();

// API for BMI Calculation
router.post("/bmi", (req, res) => {
    const { weight, height } = req.body;
    if (!weight || !height) return res.status(400).json({ error: "Weight and height are required" });

    const result = calculateBMI(weight, height);
    res.json(result);
});

// API for BMR Calculation
router.post("/bmr", (req, res) => {
    console.log("BMR API hit");  // ✅ Debugging log
    const { weight, height, age, gender } = req.body;
    if (!weight || !height || !age || !gender) {
        console.log("Missing fields");  // ✅ Debugging log
        return res.status(400).json({ error: "All fields are required" });
    }
    const bmr = calculateBMR(weight, height, age, gender);
    res.json({ bmr });
});


// API for Calorie Calculation
router.post("/calories", (req, res) => {
    const { weight, height, age, gender, activityLevel } = req.body;
    if (!weight || !height || !age || !gender || !activityLevel)
        return res.status(400).json({ error: "All fields are required" });

    const calories = calculateCalorieIntake(weight, height, age, gender, activityLevel);
    res.json({ calories });
});

module.exports = router;
