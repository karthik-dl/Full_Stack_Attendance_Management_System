import { useEffect, useState } from "react";
import API from "../services/api";
import TrainerSessions from "../components/TrainerSessions";

// Shared input style — fixes the missing .input class
const inputCls =
  "w-full mb-3 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-400";

export default function Dashboard() {
  const role = localStorage.getItem("role");

  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [batchId, setBatchId] = useState(
    localStorage.getItem("batchId") || ""
  );

  const [inviteLink, setInviteLink] = useState("");
  const [joinToken, setJoinToken] = useState("");

  const [sessionForm, setSessionForm] = useState({
    title: "",
    date: "",
    start_time: "",
    end_time: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  // ================= STUDENT DATA =================
  useEffect(() => {
    if (role !== "student") return;
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const s = await API.get("/student/sessions");
        const a = await API.get("/student/attendance");
        if (isMounted) {
          setSessions(s.data || []);
          setAttendance(a.data || []);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [role]);

  // ================= AUTO-LOAD SUMMARY =================
  useEffect(() => {
    if (!["institution", "manager", "officer"].includes(role)) return;
    let isMounted = true;
    const loadSummary = async () => {
      try {
        const id = localStorage.getItem("userId");
        const res =
          role === "institution"
            ? await API.get(`/summary/institution/${id}`)
            : await API.get("/summary/programme");
        if (isMounted) setSummary(Number(res.data?.attendance_rate) || 0);
      } catch {
        if (isMounted) setError("Error fetching summary");
      }
    };
    loadSummary();
    return () => { isMounted = false; };
  }, [role]);

  const clearMessages = () => { setMessage(""); setError(""); };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // ================= TRAINER ACTIONS =================

  const createBatch = async () => {
    clearMessages();
    try {
      const res = await API.post("/batches");
      const id = res.data.id;
      setBatchId(id);
      localStorage.setItem("batchId", id);
      setMessage("Batch created successfully");
    } catch {
      setError("Error creating batch");
    }
  };

  const generateInvite = async () => {
    clearMessages();
    try {
      if (!batchId) return setError("Create batch first");
      const res = await API.post(`/batches/${batchId}/invite`);
      setInviteLink(res.data.inviteLink);
      setMessage("Invite link generated");
    } catch {
      setError("Error generating invite");
    }
  };

  const createSession = async () => {
    clearMessages();
    try {
      if (!batchId) return setError("Create batch first");
      const { title, date, start_time, end_time } = sessionForm;
      if (!title || !date || !start_time || !end_time) {
        return setError("Fill all fields");
      }
      if (start_time >= end_time) {
        return setError("Invalid time range");
      }
      await API.post("/sessions", {
        title,
        batch_id: Number(batchId),
        date,
        start_time,
        end_time,
      });
      setMessage("Session created successfully");
      setSessionForm({ title: "", date: "", start_time: "", end_time: "" });
    } catch {
      setError("Error creating session");
    }
  };

  // ================= STUDENT ACTIONS =================

  const joinBatch = async () => {
    clearMessages();
    try {
      const token = joinToken.includes("/join/")
        ? joinToken.split("/join/")[1]
        : joinToken;
      await API.post(`/batches/join/${token}`);
      setMessage("Joined batch successfully");
      setJoinToken("");
      const s = await API.get("/student/sessions");
      const a = await API.get("/student/attendance");
      setSessions(s.data || []);
      setAttendance(a.data || []);
    } catch {
      setError("Invalid token");
    }
  };

  const markAttendance = async (sessionId) => {
    clearMessages();
    try {
      await API.post("/sessions/attendance/mark", {
        session_id: sessionId,
        status: "present",
      });
      setMessage("Attendance marked");
      const a = await API.get("/student/attendance");
      setAttendance(a.data || []);
    } catch {
      setError("Error marking attendance");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{role?.toUpperCase()} DASHBOARD</h2>
        <button className="bg-red-500 px-4 py-1 rounded" onClick={logout}>
          Logout
        </button>
      </div>

      {/* MESSAGES */}
      {message && <div className="bg-green-600 p-2 mb-3 rounded">{message}</div>}
      {error && <div className="bg-red-600 p-2 mb-3 rounded">{error}</div>}

      {/* ================= TRAINER ================= */}
      {role === "trainer" && (
        <div className="grid gap-6">

          {/* Batch */}
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-semibold mb-3">Batch</h3>
            <button className="bg-green-500 px-4 py-1 rounded" onClick={createBatch}>
              Create Batch
            </button>
            {batchId && <p className="mt-2 text-green-400">Batch ID: {batchId}</p>}
          </div>

          {/* Invite — TrainerSessions is its own card below, not nested here */}
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-semibold mb-3">Invite Link</h3>
            <button className="bg-yellow-500 px-4 py-1 rounded" onClick={generateInvite}>
              Generate Invite
            </button>
            {inviteLink && (
              <div className="mt-2">
                <p className="text-green-400 break-all text-sm">{inviteLink}</p>
              </div>
            )}
          </div>

          {/* Session */}
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-semibold mb-3">Create Session</h3>
            <input
              className={inputCls}
              placeholder="Title"
              value={sessionForm.title}
              onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
            />
            <input
              className={inputCls}
              type="date"
              value={sessionForm.date}
              onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
            />
            <div className="flex gap-2">
              <input
                className="flex-1 mb-3 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-400"
                type="time"
                value={sessionForm.start_time}
                onChange={(e) => setSessionForm({ ...sessionForm, start_time: e.target.value })}
              />
              <input
                className="flex-1 mb-3 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-400"
                type="time"
                value={sessionForm.end_time}
                onChange={(e) => setSessionForm({ ...sessionForm, end_time: e.target.value })}
              />
            </div>
            <button className="bg-blue-500 px-4 py-1 rounded" onClick={createSession}>
              Create Session
            </button>
          </div>

          {/* Sessions & Attendance — its own top-level card */}
          <TrainerSessions />
        </div>
      )}

      {/* ================= STUDENT ================= */}
      {role === "student" && (
        <div className="grid gap-6">

          {/* Join */}
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-semibold mb-3">Join a Batch</h3>
            <input
              className={inputCls}
              placeholder="Paste invite link or token"
              value={joinToken}
              onChange={(e) => setJoinToken(e.target.value)}
            />
            <button className="bg-green-500 px-4 py-1 rounded" onClick={joinBatch}>
              Join Batch
            </button>
          </div>

          {/* Sessions */}
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-semibold mb-3">Sessions</h3>
            {loading && <p className="text-gray-400">Loading...</p>}
            {!loading && sessions.length === 0 && (
              <p className="text-gray-400">No sessions available. Join a batch first.</p>
            )}
            {sessions.map((s) => (
              <div key={`s-${s.id}`} className="flex justify-between items-center border-b border-gray-700 py-2">
                <div>
                  <span className="font-medium">{s.title}</span>
                  <span className="text-gray-400 text-sm ml-2">{s.date}</span>
                </div>
                <button
                  className="bg-blue-500 px-3 py-1 rounded text-sm"
                  onClick={() => markAttendance(s.id)}
                >
                  Mark Present
                </button>
              </div>
            ))}
          </div>

          {/* Attendance */}
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-semibold mb-3">My Attendance</h3>
            {attendance.length === 0 && (
              <p className="text-gray-400">No attendance records yet.</p>
            )}
            {attendance.map((a) => (
              <div key={`a-${a.id}`} className="flex justify-between border-b border-gray-700 py-2">
                <span>{a.title}</span>
                <span className="text-green-400 capitalize">{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= INSTITUTION ================= */}
      {role === "institution" && (
        <div className="grid gap-6">
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-semibold mb-2">Institution Attendance Summary</h3>
            {summary !== null ? (
              <p className="text-green-400 text-lg">
                Attendance Rate: {Number(summary).toFixed(2)}%
              </p>
            ) : (
              <p className="text-gray-400">Loading summary...</p>
            )}
          </div>
        </div>
      )}

      {/* ================= PROGRAMME MANAGER ================= */}
      {role === "manager" && (
        <div className="grid gap-6">
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-semibold mb-2">Programme Manager — Attendance Overview</h3>
            {summary !== null ? (
              <p className="text-green-400 text-lg">
                Programme-wide Attendance Rate: {Number(summary).toFixed(2)}%
              </p>
            ) : (
              <p className="text-gray-400">Loading summary...</p>
            )}
          </div>
        </div>
      )}

      {/* ================= MONITORING OFFICER (read-only) ================= */}
      {role === "officer" && (
        <div className="grid gap-6">
          <div className="bg-yellow-900 border border-yellow-600 p-3 rounded text-yellow-300 text-sm">
            Read-only access — no create, edit, or delete actions are available for this role.
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-semibold mb-2">Programme-wide Attendance</h3>
            {summary !== null ? (
              <p className="text-green-400 text-lg">
                Attendance Rate: {Number(summary).toFixed(2)}%
              </p>
            ) : (
              <p className="text-gray-400">Loading summary...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}