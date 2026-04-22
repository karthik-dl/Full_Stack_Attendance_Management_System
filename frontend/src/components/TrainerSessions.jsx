import { useEffect, useState } from "react";
import API from "../services/api";

export default function TrainerSessions() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const viewAttendance = async (id) => {
    try {
      const res = await API.get(`/sessions/${id}/attendance`);
      setAttendance(res.data || []);
      setSelectedSession(id);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ FIXED EFFECT
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const res = await API.get("/sessions/trainer");

        if (isMounted) {
          setSessions(res.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="grid gap-4">

      {/* Sessions */}
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="mb-2 font-semibold">My Sessions</h3>

        {sessions.length === 0 && <p>No sessions found</p>}

        {sessions.map((s) => (
          <div key={s.id} className="flex justify-between border-b py-2">
            <span>{s.title} - {s.date}</span>

            <button
              className="bg-purple-500 px-2 py-1 rounded text-sm"
              onClick={() => viewAttendance(s.id)}
            >
              View Attendance
            </button>
          </div>
        ))}
      </div>

      {/* Attendance */}
      {selectedSession && (
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="mb-2 font-semibold">
            Attendance (Session {selectedSession})
          </h3>

          {attendance.length === 0 && <p>No records</p>}

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-400">
                <th className="text-left py-2">Student</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="py-2">{a.name}</td>
                  <td className="text-green-400">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}