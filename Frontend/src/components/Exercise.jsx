import { useState } from "react";

const Exercise = () => {
  const [message, setMessage] = useState("Start Exercise");

  const handleStart = () => {
    setMessage("Analyzing movement...");
    setTimeout(() => {
      setMessage("Exercise Completed!");
    }, 5000); // Simulating delay
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>{message}</h1>
      <button onClick={handleStart} style={{ padding: "10px 20px", fontSize: "18px", marginTop: "20px" }}>
        Start Exercise
      </button>
    </div>
  );
};

export default Exercise;
