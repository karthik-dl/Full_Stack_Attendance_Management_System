import express from "express";
import pool from "../config/db.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Get student sessions
router.get("/sessions", auth(["student"]), async (req, res) => {
  const result = await pool.query(`
    SELECT s.* 
    FROM sessions s
    JOIN batch_students bs ON s.batch_id = bs.batch_id
    WHERE bs.student_id = $1
  `, [req.user.id]);

  res.json(result.rows);
});

// Get student attendance
router.get("/attendance", auth(["student"]), async (req, res) => {
  const result = await pool.query(`
    SELECT a.*, s.title, s.date
    FROM attendance a
    JOIN sessions s ON a.session_id = s.id
    WHERE a.student_id = $1
  `, [req.user.id]);

  res.json(result.rows);
});

export default router;