const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Proxy requests to Flask
const { createProxyMiddleware } = require("http-proxy-middleware");
app.use("/api/workout-tracker", createProxyMiddleware({ target: "http://localhost:5005", changeOrigin: true }));

// MongoDB Connection with better error handling
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Add timeout
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err);
  process.exit(1); // Exit if cannot connect to database
});

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Routes
const authRoutes = require("./routes/auth");
const dietRoutes = require("./routes/diet");
const workoutRoutes = require("./routes/workout");
const medicineRoutes = require("./routes/medicine");
const healthRoutes = require("./routes/health");
const sleepRoutes = require("./routes/sleep");

app.use("/api/auth", authRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/medicine", medicineRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/sleep", sleepRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mongodb: mongoose.connection.readyState === 1 });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
