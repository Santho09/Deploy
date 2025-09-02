const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key"; // Secure in .env

// Input validation middleware
const validateSignupInput = (req, res, next) => {
    const { username, email, password, height, weight, age, gender } = req.body;
    
    // Basic validation
    if (!username || !email || !password || !height || !weight || !age || !gender) {
        return res.status(400).json({ error: "All required fields must be filled" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    // Password strength validation
    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Numeric field validation
    if (isNaN(height) || height <= 0 || isNaN(weight) || weight <= 0 || isNaN(age) || age <= 0) {
        return res.status(400).json({ error: "Height, weight, and age must be positive numbers" });
    }

    // Gender validation
    if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
        return res.status(400).json({ error: "Invalid gender value" });
    }

    next();
};

// ✅ **Signup Route**
router.post("/signup", validateSignupInput, async (req, res) => {
    try {
        const { username, email, password, height, weight, age, gender, medicalConditions } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            height: parseFloat(height),
            weight: parseFloat(weight),
            age: parseInt(age),
            gender: gender.toLowerCase(),
            medicalConditions: medicalConditions ? medicalConditions.filter(condition => condition.trim()) : []
        });

        // Save user to database
        await newUser.save();
        
        // Log successful registration
        console.log(`New user registered: ${email}`);
        
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Signup Error:", error);
        
        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: "Invalid input data" });
        }
        if (error.code === 11000) {
            return res.status(400).json({ error: "Email already exists" });
        }
        
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ **Login Route**
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate token
        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
        
        // Prepare user data
        const userData = {
            username: user.username,
            height: user.height,
            weight: user.weight,
            age: user.age,
            gender: user.gender,
            medicalConditions: user.medicalConditions
        };

        res.json({ token, user: userData });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ **Protected Route Example**
router.get("/protected", async (req, res) => {
    try {
        const token = req.headers["authorization"];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Verify token
        const decoded = jwt.verify(token, SECRET_KEY);
        
        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Return user data without sensitive information
        const userData = {
            username: user.username,
            email: user.email,
            height: user.height,
            weight: user.weight,
            age: user.age,
            gender: user.gender,
            medicalConditions: user.medicalConditions
        };

        res.json({ message: "Access granted", user: userData });

    } catch (error) {
        console.error("Protected Route Error:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Invalid token" });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired" });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
