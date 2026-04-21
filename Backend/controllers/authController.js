import pool from "../config/db.js";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export async function register(req, res) {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, email, hashedPassword, role]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
  console.error("REGISTER ERROR:", err); // 👈 ADD THIS
  res.status(500).json({ error: err.message });
}
}

// LOGIN
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const validPassword = await compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.rows[0].id,
        role: user.rows[0].role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.rows[0].role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}