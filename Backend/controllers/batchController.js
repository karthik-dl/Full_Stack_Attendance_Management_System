import pool from "../config/db.js";
import crypto from "crypto";

// CREATE BATCH (AUTO NAME)
export const createBatch = async (req, res) => {
  try {
    const name = `Batch_${req.user.id}_${Date.now()}`;

    const result = await pool.query(
      "INSERT INTO batches (name, institution_id) VALUES ($1,$2) RETURNING *",
      [name, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GENERATE INVITE LINK
export const generateInvite = async (req, res) => {
  const { id } = req.params;

  try {
    const token = crypto.randomBytes(16).toString("hex");

    await pool.query(
      "INSERT INTO batch_invites (batch_id, token) VALUES ($1,$2)",
      [id, token]
    );

    const inviteLink = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/join/${token}`;

    res.json({ inviteLink, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// JOIN BATCH USING TOKEN
export const joinBatch = async (req, res) => {
  const { token } = req.params;

  try {
    const invite = await pool.query(
      "SELECT * FROM batch_invites WHERE token=$1",
      [token]
    );

    if (!invite.rows.length) {
      return res.status(400).json({ msg: "Invalid token" });
    }

    const batchId = invite.rows[0].batch_id;

    // prevent duplicate join
    const existing = await pool.query(
      "SELECT * FROM batch_students WHERE batch_id=$1 AND student_id=$2",
      [batchId, req.user.id]
    );

    if (existing.rows.length) {
      return res.json({ msg: "Already joined" });
    }

    await pool.query(
      "INSERT INTO batch_students (batch_id, student_id) VALUES ($1,$2)",
      [batchId, req.user.id]
    );

    res.json({ msg: "Joined batch successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// BATCH SUMMARY
export const getBatchSummary = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE a.status='present') * 100.0 / COUNT(*) AS attendance_rate
      FROM attendance a
      JOIN sessions s ON a.session_id = s.id
      WHERE s.batch_id = $1
    `, [id]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};