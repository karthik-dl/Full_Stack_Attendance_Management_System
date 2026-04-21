import pool from "../config/db.js";

// CREATE SESSION
export const createSession = async (req, res) => {
  const { title, batch_id, date, start_time, end_time } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO sessions (title, batch_id, trainer_id, date, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, batch_id, req.user.id, date, start_time, end_time]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ATTENDANCE FOR SESSION
export const getSessionAttendance = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT a.*, u.name 
       FROM attendance a
       JOIN users u ON a.student_id = u.id
       WHERE a.session_id = $1`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MARK ATTENDANCE
export const markAttendance = async (req, res) => {
  const { session_id, status } = req.body;

  try {
    // ✅ ADD HERE (first validation)
    if (!["present", "absent", "late"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    // 1. Check session exists
    const session = await pool.query(
      "SELECT * FROM sessions WHERE id=$1",
      [session_id]
    );

    if (session.rows.length === 0) {
      return res.status(404).json({ msg: "Session not found" });
    }

    const batchId = session.rows[0].batch_id;

    // 2. Check student belongs to batch
    const student = await pool.query(
      "SELECT * FROM batch_students WHERE batch_id=$1 AND student_id=$2",
      [batchId, req.user.id]
    );

    if (student.rows.length === 0) {
      return res.status(403).json({ msg: "Not part of this batch" });
    }

    // 3. Prevent duplicate
    const exists = await pool.query(
      "SELECT * FROM attendance WHERE session_id=$1 AND student_id=$2",
      [session_id, req.user.id]
    );

    if (exists.rows.length > 0) {
      return res.json({ msg: "Already marked" });
    }

    // 4. Insert attendance
    const result = await pool.query(
      `INSERT INTO attendance (session_id, student_id, status)
       VALUES ($1, $2, $3) RETURNING *`,
      [session_id, req.user.id, status]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};