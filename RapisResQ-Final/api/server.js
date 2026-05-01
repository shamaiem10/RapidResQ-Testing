// api/server.js - Local development server
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./backend/config/database");

// Import routes
const authRoutes = require("./backend/routes/authRoutes");
const emergencyRoutes = require("./backend/routes/emergencyRoutes");
const chatRoutes = require("./backend/routes/chat");
const communityRoutes = require("./backend/routes/community");
const panicRoutes = require("./backend/routes/panic");

dotenv.config();

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors()); // You can restrict origins if needed
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug: log incoming requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// API Routes
app.use("/api", authRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api", chatRoutes);
app.use("/api", communityRoutes);
app.use("/api/community", communityRoutes); // backward compatibility
app.use("/api", panicRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ API available at: http://localhost:${PORT}/api`);
});
