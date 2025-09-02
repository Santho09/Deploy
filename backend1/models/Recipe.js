const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    Name: String,
    RecipeIngredientParts: [String],
    Calories: Number,
    RecipeInstructions: [String]
});

module.exports = mongoose.model("Recipe", RecipeSchema);
