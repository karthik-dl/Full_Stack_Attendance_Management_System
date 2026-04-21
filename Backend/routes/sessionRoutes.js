import express from "express";
import { createSession, getSessionAttendance,markAttendance } from "../controllers/sessionController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Trainer creates session
router.post("/", auth(["trainer"]), createSession);

// Trainer views attendance
router.get("/:id/attendance", auth(["trainer"]), getSessionAttendance);
router.post("/attendance", auth(["student"]), markAttendance);


export default router;