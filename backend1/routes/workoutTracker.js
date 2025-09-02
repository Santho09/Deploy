const express = require("express");
const axios = require("axios");
const WorkoutHistory = require("../models/WorkoutHistory1");

const router = express.Router();
const FLASK_API_URL = "http://localhost:5005/api/start_workout"; // Flask API URL

// Start Workout Route (Proxy to Flask API)
router.post("/start", async (req, res) => {
    try {
        const { exercise } = req.body;
        
        // Call the Flask API
        const response = await axios.post(FLASK_API_URL, { exercise });
        
        // Save workout details to MongoDB
        const workout = new WorkoutHistory({
            exercise,
            reps: response.data.total_reps,
            date: new Date(),
        });

        await workout.save();
        
        res.json(response.data);
    } catch (error) {
        console.error("Error starting workout:", error);
        res.status(500).json({ error: "Failed to start workout" });
    }
});

// Get Workout History
router.get("/history", async (req, res) => {
    try {
        const history = await WorkoutHistory.find().sort({ date: -1 });
        res.json(history);
    } catch (error) {
        console.error("Error fetching workout history:", error);
        res.status(500).json({ error: "Failed to retrieve workout history" });
    }
});

module.exports = router;
