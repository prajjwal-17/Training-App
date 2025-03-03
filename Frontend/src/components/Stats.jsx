import { useEffect, useState } from "react";
import "./Stats.css";  // Import styles

const Stats = () => {
  const [sessions, setSessions] = useState([]);  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/sessions")  // Make sure backend is running
      .then((response) => response.json())
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching sessions:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="stats-container" >
      <h2>📊 Session Reports</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="stats-table">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Reps Count</th>
              <th>Duration</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session, index) => (
              <tr key={session.id}>
                <td>{session.exercise_mode}</td>
                <td>{session.reps}</td>
                <td>{session.duration} seconds</td>
                <td>{new Date(session.date_time).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Stats;
