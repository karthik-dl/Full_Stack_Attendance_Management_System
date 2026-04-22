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

  // Load trainer sessions
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
    <div className="grid gap-6">

      {/* ================= SESSIONS ================= */}
      <div className="bg-gray-800 p-5 rounded-lg shadow">

        <h3 className="mb-4 text-lg font-semibold text-white">
          My Sessions
        </h3>

        {sessions.length === 0 && (
          <p className="text-gray-400">No sessions found</p>
        )}

        {sessions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">

              {/* HEADER */}
              <thead>
                <tr className="border-b border-gray-600 text-gray-400">
                  <th className="text-left py-3 px-3 w-1/4">Title</th>
                  <th className="text-center py-3 px-3 w-1/5">Date</th>
                  <th className="text-center py-3 px-3 w-1/5">Start</th>
                  <th className="text-center py-3 px-3 w-1/5">End</th>
                  <th className="text-center py-3 px-3 w-1/6">Action</th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-gray-700 hover:bg-gray-700 transition"
                  >
                    {/* Title */}
                    <td className="py-3 px-3 text-left font-medium">
                      {s.title}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-center">
                      {new Date(s.date).toLocaleDateString()}
                    </td>

                    {/* Start */}
                    <td className="py-3 px-3 text-center">
                      {s.start_time?.slice(0, 5)}
                    </td>

                    {/* End */}
                    <td className="py-3 px-3 text-center">
                      {s.end_time?.slice(0, 5)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        className="bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded text-xs transition"
                        onClick={() => viewAttendance(s.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

      {/* ================= ATTENDANCE ================= */}
      {selectedSession && (
        <div className="bg-gray-800 p-5 rounded-lg shadow">

          <h3 className="mb-4 text-lg font-semibold text-white">
            Attendance (Session {selectedSession})
          </h3>

          {attendance.length === 0 && (
            <p className="text-gray-400">No records</p>
          )}

          {attendance.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">

                <thead>
                  <tr className="border-b border-gray-600 text-gray-400">
                    <th className="text-left py-3 px-3">Student</th>
                    <th className="text-center py-3 px-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="py-3 px-3">{a.name}</td>

                      <td
                        className={`py-3 px-3 text-center font-medium ${
                          a.status === "present"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {a.status}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}