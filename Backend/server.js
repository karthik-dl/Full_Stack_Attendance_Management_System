import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

// Debug (keep this for now, remove later)
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);

import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("API is running");
});

// 🔌 Database connection test
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection error", err);
  }
})();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/sessions", sessionRoutes);
// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ message: "Something went wrong" });
});

// Server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});