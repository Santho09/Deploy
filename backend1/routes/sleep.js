const express = require("express");
const axios = require("axios");
const router = express.Router();

const FLASK_SLEEP_API = "http://127.0.0.1:5005/api/sleep";  // ✅ Flask API URL

// ✅ POST request to Flask Sleep Recommender API
router.post("/", async (req, res) => {
    console.log("➡ Received POST request for /api/sleep");
    console.log("📨 Forwarding request to Flask Sleep API:", req.body);

    try {
        const response = await axios.post(FLASK_SLEEP_API, req.body);
        console.log("✅ Flask API Response:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("❌ Error calling Flask Sleep API:", error.message);

        if (error.response) {
            console.error("🔴 Flask API Response Status:", error.response.status);
            console.error("🔴 Flask API Response Data:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.error("🔴 No response received from Flask API");
            res.status(500).json({ error: "No response from Flask API" });
        } else {
            console.error("🔴 Unknown Request Error:", error.message);
            res.status(500).json({ error: "Sleep API request failed" });
        }
    }
});

module.exports = router;
