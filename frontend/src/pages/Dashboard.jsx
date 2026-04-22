import { useEffect, useState } from "react";
import API from "../services/api";
import TrainerSessions from "../components/TrainerSessions";

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

    return () => {
      isMounted = false;
    };
  }, [role]);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // ================= TRAINER =================

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

      setSessionForm({
        title: "",
        date: "",
        start_time: "",
        end_time: "",
      });

    } catch {
      setError("Error creating session");
    }
  };

  // ================= STUDENT =================

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
      <div className="flex justify-between mb-6">
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
            <button className="bg-green-500 px-4 py-1 rounded" onClick={createBatch}>
              Create Batch
            </button>
            {batchId && <p className="mt-2 text-green-400">Batch ID: {batchId}</p>}
          </div>

          {/* Invite */}
          <div className="bg-gray-800 p-4 rounded">
            <button className="bg-yellow-500 px-4 py-1 rounded" onClick={generateInvite}>
              Generate Invite
            </button>

            {inviteLink && (
              <div className="mt-2">
                <p className="text-green-400 break-all">{inviteLink}</p>
              </div>
            )}
            <TrainerSessions />
          </div>

          {/* Session */}
          <div className="bg-gray-800 p-4 rounded">
            <input
              className="input"
              placeholder="Title"
              value={sessionForm.title}
              onChange={(e) =>
                setSessionForm({ ...sessionForm, title: e.target.value })
              }
            />

            <input
              className="input"
              type="date"
              value={sessionForm.date}
              onChange={(e) =>
                setSessionForm({ ...sessionForm, date: e.target.value })
              }
            />

            <div className="flex gap-2">
              <input
                className="input w-1/2"
                type="time"
                value={sessionForm.start_time}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, start_time: e.target.value })
                }
              />

              <input
                className="input w-1/2"
                type="time"
                value={sessionForm.end_time}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, end_time: e.target.value })
                }
              />
            </div>

            <button
              className="bg-blue-500 px-4 py-1 rounded mt-2"
              onClick={createSession}
            >
              Create Session
            </button>
          </div>
        </div>
      )}

      {/* ================= STUDENT ================= */}
      {role === "student" && (
        <div className="grid gap-6">

          {/* Join */}
          <div className="bg-gray-800 p-4 rounded">
            <input
              className="input"
              placeholder="Paste token"
              value={joinToken}
              onChange={(e) => setJoinToken(e.target.value)}
            />
            <button className="bg-green-500 px-4 py-1 mt-2 rounded" onClick={joinBatch}>
              Join Batch
            </button>
          </div>

          {/* Sessions */}
          <div className="bg-gray-800 p-4 rounded">
            <h3>Sessions</h3>

            {loading && <p>Loading...</p>}
            {!loading && sessions.length === 0 && <p>No sessions available</p>}

            {sessions.map((s) => (
              <div key={`s-${s.id}`} className="flex justify-between border-b py-2">
                <span>{s.title}</span>
                <button
                  className="bg-blue-500 px-2 rounded"
                  onClick={() => markAttendance(s.id)}
                >
                  Mark
                </button>
              </div>
            ))}
          </div>

          {/* Attendance */}
          <div className="bg-gray-800 p-4 rounded">
            <h3>Attendance</h3>

            {attendance.length === 0 && <p>No attendance records</p>}

            {attendance.map((a) => (
              <div key={`a-${a.id}`} className="py-1">
                {a.title} - <span className="text-green-400">{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SUMMARY ================= */}
      {(role === "institution" || role === "manager" || role === "officer") && (
        <div className="bg-gray-800 p-4 rounded">
          <button
            className="bg-purple-500 px-4 py-1 rounded"
            onClick={async () => {
              try {
                const id = localStorage.getItem("userId");

                const res =
                  role === "institution"
                    ? await API.get(`/summary/institution/${id}`)
                    : await API.get("/summary/programme");

                setSummary(Number(res.data?.attendance_rate) || 0);
              } catch {
                setError("Error fetching summary");
              }
            }}
          >
            View Summary
          </button>

          {summary !== null && (
            <p className="mt-3 text-green-400">
              Attendance Rate: {Number(summary).toFixed(2)}%
            </p>
          )}
        </div>
      )}
    </div>
  );
}