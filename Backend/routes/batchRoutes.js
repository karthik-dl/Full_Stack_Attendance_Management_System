import express from "express";
import {
  createBatch,
  generateInvite,
  joinBatch,
  getBatchSummary,
} from "../controllers/batchController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Create batch
router.post("/", auth(["trainer", "institution"]), createBatch);

// Invite link
router.post("/:id/invite", auth(["trainer"]), generateInvite);

// Join batch
router.post("/join/:token", auth(["student"]), joinBatch);

// ✅ NEW: Batch summary
router.get("/:id/summary", auth(["trainer", "institution"]), getBatchSummary);
// GET MY BATCHES (STUDENT)
router.get("/my", auth(["student"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.name
       FROM batches b
       JOIN batch_students bs ON b.id = bs.batch_id
       WHERE bs.student_id = $1`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
export default router;