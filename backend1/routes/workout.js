const express = require("express");
const axios = require("axios");
const router = express.Router();

const FLASK_WORKOUT_API = "http://127.0.0.1:5003/api/workout"; // Ensure this matches Flask

// ✅ POST request to Flask Workout API
router.post("/", async (req, res) => {
    console.log("➡ Received POST request for /api/workout:", req.body);

    try {
        const response = await axios.post(FLASK_WORKOUT_API, req.body);
        console.log("✅ Flask Response:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("❌ Error calling Flask Workout API:", error.message);

        if (error.response) {
            console.error("🔴 Flask API Response Status:", error.response.status);
            console.error("🔴 Flask API Response Data:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.error("🔴 No response received from Flask API");
            res.status(500).json({ error: "No response from Flask API" });
        } else {
            console.error("🔴 Unknown Request Error:", error.message);
            res.status(500).json({ error: "Workout API request failed" });
        }
    }
});

module.exports = router;
