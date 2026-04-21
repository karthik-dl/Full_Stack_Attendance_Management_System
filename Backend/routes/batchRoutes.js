import express from "express";
import { createBatch, generateInvite } from "../controllers/batchController.js";
import auth from "../middleware/authMiddleware.js";
import { joinBatch } from "../controllers/batchController.js";
const router = express.Router();

// Trainer or Institution can create batch
router.post("/", auth(["trainer", "institution"]), createBatch);

// Generate invite link
router.post("/:id/invite", auth(["trainer"]), generateInvite);



router.post("/join/:token", auth(["student"]), joinBatch);
export default router;

// invitelink
// http://localhost:3000/join/5a9a0840f222cdd84d11f705b45c5168