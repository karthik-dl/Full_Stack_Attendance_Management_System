import pool from "../config/db.js";
import crypto from "crypto";

// CREATE BATCH
export const createBatch = async (req, res) => {
  const { name } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO batches (name, institution_id) VALUES ($1, $2) RETURNING *",
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
      "INSERT INTO batch_invites (batch_id, token) VALUES ($1, $2)",
      [id, token]
    );

    const inviteLink = `http://localhost:3000/join/${token}`;

    res.json({ inviteLink });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const joinBatch = async (req, res) => {
  const { token } = req.params;

  try {
    // find invite
    const invite = await pool.query(
      "SELECT * FROM batch_invites WHERE token=$1",
      [token]
    );

    if (invite.rows.length === 0) {
      return res.status(400).json({ msg: "Invalid invite link" });
    }

    const batchId = invite.rows[0].batch_id;

    // add student to batch
    await pool.query(
      "INSERT INTO batch_students (batch_id, student_id) VALUES ($1, $2)",
      [batchId, req.user.id]
    );

    res.json({ msg: "Joined batch successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};