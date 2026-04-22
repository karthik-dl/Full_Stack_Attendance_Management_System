import express from "express";
import pool from "../config/db.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();


// ================= CREATE SESSION =================
router.post("/", auth(["trainer"]), async (req, res) => {
  const { title, batch_id, date, start_time, end_time } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO sessions 
       (title, batch_id, date, start_time, end_time, trainer_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [title, batch_id, date, start_time, end_time, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ================= MARK ATTENDANCE =================
router.post("/attendance/mark", auth(["student"]), async (req, res) => {
  const { session_id, status } = req.body;

  try {
    const check = await pool.query(
      `SELECT * FROM attendance WHERE session_id=$1 AND student_id=$2`,
      [session_id, req.user.id]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ message: "Already marked" });
    }

    const result = await pool.query(
      `INSERT INTO attendance (session_id, student_id, status)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [session_id, req.user.id, status]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================= TRAINER SESSIONS =================
router.get("/trainer", auth(["trainer"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.name AS trainer_name
       FROM sessions s
       JOIN users u ON s.trainer_id = u.id
       WHERE s.trainer_id = $1
       ORDER BY s.date DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================= SESSION ATTENDANCE =================
router.get("/:id/attendance", auth(["trainer"]), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT a.id, a.status, u.name
       FROM attendance a
       JOIN users u ON a.student_id = u.id
       WHERE a.session_id = $1`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;