import express from "express";
import pool from "../config/db.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * PROGRAMME SUMMARY
 * Roles: manager, officer
 */
router.get("/programme", auth(["manager", "officer"]), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status='present') * 100.0 / NULLIF(COUNT(*),0) AS attendance_rate
      FROM attendance
    `);

    res.json(result.rows[0] || { attendance_rate: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * INSTITUTION SUMMARY
 * Role: institution
 */
router.get("/institution/:id", auth(["institution"]), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE a.status='present') * 100.0 / NULLIF(COUNT(*),0) AS attendance_rate
      FROM attendance a
      JOIN sessions s ON a.session_id = s.id
      JOIN batches b ON s.batch_id = b.id
      WHERE b.institution_id = $1
    `, [id]);

    res.json(result.rows[0] || { attendance_rate: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;