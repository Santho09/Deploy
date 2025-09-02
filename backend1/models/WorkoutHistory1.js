const mongoose = require("mongoose");

const WorkoutHistorySchema = new mongoose.Schema({
    exercise: { type: String, required: true },
    reps: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WorkoutHistory", WorkoutHistorySchema);
