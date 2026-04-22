import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());


app.get("/api", (req, res) => {
  res.send("API working ");
});

// DB connection test
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
app.use("/api/student", studentRoutes);
app.use("/api/summary", summaryRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});