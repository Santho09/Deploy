const express = require("express");
const axios = require("axios");
const router = express.Router();

const FLASK_DIET_API = "http://127.0.0.1:5002/api/diet"; // ✅ Ensure Flask is running on port 5002

// ✅ POST request to Flask Diet Recommender API
router.post("/", async (req, res) => {
    console.log("➡ Received POST request for /api/diet:", req.body);

    try {
        // ✅ Forward request to Flask API
        const mlResponse = await axios.post(FLASK_DIET_API, req.body);
        console.log("✅ Flask Response:", mlResponse.data);

        // ✅ Send response back to frontend
        res.json(mlResponse.data);
    } catch (error) {
        console.error("❌ Error calling Flask Diet API:", error.message);

        if (error.response) {
            console.error("🔴 Flask API Response Status:", error.response.status);
            console.error("🔴 Flask API Response Data:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.error("🔴 No response received from Flask API");
            res.status(500).json({ error: "No response from Flask API" });
        } else {
            console.error("🔴 Unknown Request Error:", error.message);
            res.status(500).json({ error: "Diet API request failed" });
        }
    }
});

module.exports = router;
