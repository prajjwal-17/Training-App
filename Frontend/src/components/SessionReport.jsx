import React, { useState } from "react";
import { motion } from "framer-motion";

const SessionReport = ({ exerciseMode, reps, duration }) => {
    const [reportSaved, setReportSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const getCurrentDateTime = () => {
        const now = new Date();
        return {
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString()
        };
    };

    const { date, time } = getCurrentDateTime();

    const saveReportToBackend = async () => {
        if (reportSaved || isSaving) return; // Prevent multiple clicks

        setIsSaving(true);

        const reportData = {
            exerciseMode: exerciseMode || "Unknown",
            reps: parseInt(reps, 10) || 0,
            duration: parseInt(duration, 10) || 0
        };

        console.log("Sending report data:", reportData); // Debugging log

        try {
            const response = await fetch("http://localhost:5000/save_report", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reportData)
            });

            const result = await response.json();
            console.log("Response from backend:", result);
            setReportSaved(true);
        } catch (error) {
            console.error("Error saving report:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ 
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                padding: "20px",
                borderRadius: "15px",
                boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
                textAlign: "center",
                width: "350px",
                fontFamily: "'Poppins', sans-serif",
                marginTop: "20px",
                color: "#fff",
                border: "2px solid rgba(255, 255, 255, 0.3)"
            }}
        >
            <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "10px", letterSpacing: "1px", color: "purple" }}>
                🏋️‍♂️ Session Report
            </h2>

            <p style={{ fontSize: "16px", marginBottom: "5px" }}>
                <strong style={{ color: "black" }}>Exercise:</strong> <span style={{ color: "chocolate", fontWeight: "600" }}>{exerciseMode.charAt(0).toUpperCase() + exerciseMode.slice(1)}</span>
            </p>
            <p style={{ fontSize: "16px", marginBottom: "5px" }}>
                <strong style={{ color: "black" }}>Reps Count:</strong> <span style={{ color: "chocolate", fontWeight: "600" }}>{reps}</span>
            </p>
            <p style={{ fontSize: "16px", marginBottom: "5px" }}>
                <strong style={{ color: "black" }}>Duration:</strong> <span style={{ color: "chocolate", fontWeight: "600" }}>{duration} seconds</span>
            </p>
            <p style={{ fontSize: "14px", opacity: "0.8", marginTop: "10px", color: "purple", fontWeight: "bolder" }}>
                📅 {date} | ⏰ {time}
            </p>

            {/* Save Button */}
            <motion.button
                onClick={saveReportToBackend}
                whileHover={{ scale: 1.1, backgroundColor: "#8e44ad" }}
                whileTap={{ scale: 0.9 }}
                disabled={reportSaved || isSaving}
                style={{
                    marginTop: "15px",
                    padding: "10px 20px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#fff",
                    backgroundColor: reportSaved ? "#2ecc71" : "#9b59b6",
                    border: "none",
                    borderRadius: "8px",
                    cursor: reportSaved ? "default" : "pointer",
                    transition: "all 0.3s ease",
                    outline: "none",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"
                }}
            >
                {isSaving ? "Saving..." : reportSaved ? "✔ Report Saved" : "💾 Save Report"}
            </motion.button>
        </motion.div>
    );
};

export default SessionReport;
