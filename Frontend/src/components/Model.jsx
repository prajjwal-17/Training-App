import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "./Loader"; // Import Loader

const Model = () => {
  const [counter, setCounter] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now()); // Forces image refresh
  const [exerciseMode, setExerciseMode] = useState("bicep"); // Default: Bicep Curl
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    // Show loader for 4 seconds
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  useEffect(() => {
    let intervalId;
    if (isTracking) {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get("http://127.0.0.1:5000/count");
          setCounter(response.data.counter);
        } catch (error) {
          console.error("Error fetching count:", error);
        }
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isTracking]);

  const startTracking = async () => {
    try {
      await axios.post("http://127.0.0.1:5000/start");
      setCounter(0); // Reset counter in UI
      setTimestamp(Date.now()); // Force image refresh
      setIsTracking(true);
    } catch (error) {
      console.error("Error starting tracking:", error);
    }
  };

  const stopTracking = async () => {
    try {
      await axios.post("http://127.0.0.1:5000/stop");
      setCounter(0); // Reset counter when stopping
      setIsTracking(false);
    } catch (error) {
      console.error("Error stopping tracking:", error);
    }
  };

  const switchMode = async (mode) => {
    try {
      await axios.post("http://127.0.0.1:5000/set_exercise_mode", { mode });
      setExerciseMode(mode);
      setCounter(0); // Reset counter when changing exercise
      setTimestamp(Date.now()); // Force image refresh
    } catch (error) {
      console.error("Error setting exercise mode:", error);
    }
  };

  if (loading) return <Loader />; // Show loader first

  return (
    <div style={{ textAlign: "center", marginTop: "160px" }}>
      <h2>Exercise Counter</h2>
      <h3>Reps: {counter}</h3>

      {isTracking && (
        <img
          src={`http://127.0.0.1:5000/video_feed?${timestamp}`}
          alt="Live Pose Estimation"
          style={{
            width: "80%",
            maxWidth: "600px",
            border: "2px solid black",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => switchMode("bicep")}
          style={{
            padding: "10px 20px",
            fontSize: "18px",
            cursor: "pointer",
            backgroundColor: exerciseMode === "bicep" ? "blue" : "gray",
            color: "white",
            borderRadius: "5px",
          }}
        >
          Bicep Curl
        </button>
        <button
          onClick={() => switchMode("push-up")}
          style={{
            padding: "10px 20px",
            fontSize: "18px",
            cursor: "pointer",
            backgroundColor: exerciseMode === "push-up" ? "blue" : "gray",
            color: "white",
            borderRadius: "5px",
          }}
        >
          Push-up
        </button>
      </div>

      <button
        onClick={isTracking ? stopTracking : startTracking}
        style={{
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
          backgroundColor: isTracking ? "red" : "green",
          color: "white",
          borderRadius: "5px",
        }}
      >
        {isTracking ? "Stop Counting" : "Start Counting"}
      </button>
    </div>
  );
};

export default Model;
