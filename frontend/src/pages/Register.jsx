import { useState } from "react";
import API from "../services/api";

const inputCls =
  "w-full mb-3 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-400";

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
      alert("Error registering. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-80">
        <h2 className="text-white text-xl mb-4 text-center">Register</h2>

        <input className={inputCls} placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <input className={inputCls} placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })} />

        <input className={inputCls} type="password" placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <select
          className={inputCls}
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

        <p className="text-gray-400 mt-4 text-sm text-center">
          Have an account? <a href="/" className="text-blue-400">Login</a>
        </p>
      </div>
    </div>
  );
}