const mongoose = require("mongoose");
const Recipe = require("./models/Recipe");
const fs = require("fs");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const data = JSON.parse(fs.readFileSync("health_data.json", "utf-8"));

const importData = async () => {
    try {
        await Recipe.insertMany(data);
        console.log("Data Imported Successfully!");
        process.exit();
    } catch (error) {
        console.error("Error importing data:", error);
        process.exit(1);
    }
};

importData();