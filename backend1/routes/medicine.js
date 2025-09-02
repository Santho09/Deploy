const express = require("express");
const axios = require("axios");
const router = express.Router();

const FLASK_MEDICINE_API = "http://127.0.0.1:5004/api/medicine"; // Make sure Flask is running on this port

router.post("/", async (req, res) => {
    console.log("➡ Received POST request for /api/medicine:", req.body);
    try {
        const response = await axios.post(FLASK_MEDICINE_API, req.body);
        console.log("✅ Flask Response:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("❌ Error calling Flask API:", error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

module.exports = router;
