import { useState } from "react";
import API from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const register = async () => {
    try {
      await API.post("/auth/register", form);
      alert("Registered!");
      window.location.href = "/";
    } catch {
      alert("Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-80">
        <h2 className="text-white text-xl mb-4 text-center">Register</h2>

        <input className="input" placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <input className="input" placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })} />

        <input className="input" type="password" placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <select
          className="input"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="student">Student</option>
          <option value="trainer">Trainer</option>
          <option value="institution">Institution</option>
          <option value="manager">Manager</option>
          <option value="officer">Officer</option>
        </select>

        <button
          onClick={register}
          className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded mt-3"
        >
          Register
        </button>
      </div>
    </div>
  );
}