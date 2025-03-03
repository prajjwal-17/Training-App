import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posedetection from "@tensorflow-models/pose-detection";
import WorkoutCounter from "./WorkoutCounter";
import TrophyPopup from "./TrophyPopup";
import SessionSidebar from "./SessionSidebar"; // Import the new component
import SessionReport from "./SessionReport"; // Adjust path if needed


// IndexedDB Setup for Offline Storage
const openDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("RepsDB", 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("reps")) {
                db.createObjectStore("reps", { keyPath: "id", autoIncrement: true });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const saveOfflineReps = async (user, reps, exerciseMode, duration) => {
    try {
        const db = await openDatabase();
        const tx = db.transaction("reps", "readwrite");
        const store = tx.objectStore("reps");
        store.add({ 
            user, 
            reps, 
            exerciseMode,
            duration,
            timestamp: Date.now() 
        });
    } catch (error) {
        console.error("❌ Error saving offline reps:", error);
    }
};

const PoseTracker2 = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [detector, setDetector] = useState(null);
    const [keypoints, setKeypoints] = useState(null);
    const [exerciseMode, setExerciseMode] = useState("bicep");
    const [isTracking, setIsTracking] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [reps, setReps] = useState(0);
    const [showTrophy, setShowTrophy] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [sessionDuration, setSessionDuration] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    let animationFrameId = useRef(null);

    // Track session time
    useEffect(() => {
        let timer;
        if (isTracking) {
            const startTime = Date.now();
            setSessionStartTime(startTime);
            
            timer = setInterval(() => {
                const currentDuration = Math.floor((Date.now() - startTime) / 1000);
                setSessionDuration(currentDuration);
            }, 1000);
        } else if (sessionStartTime && reps > 0) {
            // Save session when stopping if we have done any reps
            const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
            saveOfflineReps("User", reps, exerciseMode, duration);
        }
        
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isTracking]);

    useEffect(() => {
        const setupDetector = async () => {
            try {
                console.log("🚀 Initializing Pose Tracker...");
                await tf.ready();
                await tf.setBackend("webgl");
                console.log("✅ TensorFlow.js backend:", tf.getBackend());

                if (!detector) {
                    const detectorInstance = await posedetection.createDetector(
                        posedetection.SupportedModels.MoveNet,
                        { modelType: posedetection.movenet.modelType.SINGLEPOSE_THUNDER }
                    );
                    setDetector(detectorInstance);
                    console.log("✅ Pose detector initialized successfully");
                }
            } catch (error) {
                console.error("❌ Error initializing Pose Tracker:", error);
            }
        };

        setupDetector();
        
        // Setup online/offline listener
        const handleOnlineStatus = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleOnlineStatus);
        window.addEventListener('offline', handleOnlineStatus);
        
        return () => {
            window.removeEventListener('online', handleOnlineStatus);
            window.removeEventListener('offline', handleOnlineStatus);
        };
    }, []);

    useEffect(() => {
        if (isTracking) {
            startVideo();
        } else {
            stopVideo();
        }
    }, [isTracking]);

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1120, height: 630 },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = async () => {
                    await videoRef.current.play();
                    console.log("🎥 Camera stream started successfully.");
                    detectPose();
                };
            }
        } catch (error) {
            console.error("❌ Error accessing webcam:", error);
        }
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        cancelAnimationFrame(animationFrameId.current);
    };

    const detectPose = async () => {
        if (!detector) {
            console.error("❌ Detector not initialized!");
            return;
        }

        const detectLoop = async () => {
            if (!isTracking || !videoRef.current || !canvasRef.current) return;

            try {
                const video = videoRef.current;
                const ctx = canvasRef.current.getContext("2d");

                const poses = await detector.estimatePoses(video);
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.drawImage(video, 0, 0, 1120, 630);

                if (poses.length > 0) {
                    const keypoints = poses[0].keypoints;
                    setKeypoints(keypoints);
                    drawKeypointsAndLines(keypoints, ctx);
                }

                animationFrameId.current = requestAnimationFrame(detectLoop);
            } catch (error) {
                console.error("❌ Error in pose detection:", error);
            }
        };

        detectLoop();
    };

    const drawKeypointsAndLines = (keypoints, ctx) => {
        ctx.fillStyle = "red";
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 4;

        keypoints.forEach(point => {
            if (point.score > 0.3) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

        const connect = (a, b) => {
            if (keypoints[a].score > 0.3 && keypoints[b].score > 0.3) {
                ctx.beginPath();
                ctx.moveTo(keypoints[a].x, keypoints[a].y);
                ctx.lineTo(keypoints[b].x, keypoints[b].y);
                ctx.stroke();
            }
        };

        const pairs = [
            [5, 6], [5, 7], [6, 8], [7, 9], [8, 10],
            [5, 11], [6, 12], [11, 12], [11, 13], [12, 14], [13, 15], [14, 16]
        ];

        pairs.forEach(([a, b]) => connect(a, b));
    };

    const handleRepsUpdate = (newReps) => {
        setReps(newReps);
        if (newReps === 10) {
            setShowTrophy(true);
            stopVideo();
            
            // Save the completed session
            const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
            saveOfflineReps("User", newReps, exerciseMode, duration);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ 
            textAlign: "center", 
            position: "relative",
            background: "linear-gradient(135deg, #BCF4F5, #D6E6F2)",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontFamily: "'Poppins', sans-serif"
        }}>
            {/* Navbar Placeholder (Adjust height if necessary) */}
            <div style={{ height: "70px", width: "100%" }}></div>  
    
            {/* Main Content */}
            <div style={{
                marginTop: isTracking ? "20px" : "50px",  
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <h1 style={{ 
                    color: "#4CAF50", 
                    fontSize: "3rem", 
                    textShadow: "3px 3px 6px rgba(0, 0, 0, 0.3)", 
                    letterSpacing: "2px"
                }}>
                    Let's Train
                </h1>
                <h2 style={{ 
                    color: "#333", 
                    fontSize: "2rem", 
                    fontWeight: "bold",
                    background: "rgba(255, 255, 255, 0.3)", 
                    padding: "10px 20px",
                    borderRadius: "10px",
                    backdropFilter: "blur(5px)"
                }}>
                    Mode: {exerciseMode.charAt(0).toUpperCase() + exerciseMode.slice(1).toLowerCase()}
                </h2>
                <p style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: isOnline ? "#28a745" : "#dc3545",
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    {isOnline ? "🟢 Online" : "🔴 Offline (Saving Locally)"}
                </p>
            </div>
    
            {/* Camera & Tracking UI */}
            {isTracking && (
                <div style={{ marginTop: "20px" }}>  
                    <video ref={videoRef} autoPlay playsInline style={{ display: "none" }}></video>
                    <canvas 
                        ref={canvasRef} 
                        width="840" 
                        height="480" 
                        style={{ 
                            border: "3px solid #4CAF50", 
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.2)", 
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                            backdropFilter: "blur(10px)",
                            marginTop: "20px"
                        }} 
                    />
                </div>
            )}
    
            {/* Other Components */}
            <WorkoutCounter keypoints={keypoints} exerciseMode={exerciseMode} onRepsUpdate={handleRepsUpdate} />
            {showTrophy && <TrophyPopup reps={reps} />}
    
            {/* Buttons */}
            <div className="button-container">
                <button onClick={() => setIsTracking(prev => !prev)} className="btn primary">
                    {isTracking ? "⛔ Stop" : "▶ Start"}
                </button>
                <button onClick={() => setExerciseMode(prev => (prev === "bicep" ? "pushup" : prev === "pushup" ? "squats" : "bicep"))} className="btn secondary">
                    Switch to {exerciseMode === "bicep" ? "Push-ups" : exerciseMode === "pushup" ? "Squats" : "Bicep Curls"}
                </button>
                <button onClick={() => setIsSidebarOpen(true)} className="btn report">
                    📊 Medals
                </button>
            </div>
    
            {/* Sidebar & Session Report */}
            <SessionSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <SessionReport reps={reps} duration={sessionDuration} exerciseMode={exerciseMode} timestamp={sessionStartTime} />
    
            {/* Styles */}
            <style>
                {`
                .button-container {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-top: 20px;
                }
                
                .btn {
                    padding: 14px 24px;
                    font-size: 16px;
                    font-weight: bold;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
                    letter-spacing: 1px;
                }
    
                .btn.primary {
                    background: linear-gradient(135deg, #007bff, #0056b3);
                    color: white;
                }
                .btn.primary:hover {
                    transform: scale(1.07);
                    box-shadow: 0px 5px 15px rgba(0, 123, 255, 0.4);
                }
    
                .btn.secondary {
                    background: linear-gradient(135deg, #28a745, #1e7e34);
                    color: white;
                }
                .btn.secondary:hover {
                    transform: scale(1.07);
                    box-shadow: 0px 5px 15px rgba(40, 167, 69, 0.4);
                }
    
                .btn.report {
                    background: linear-gradient(135deg, #6f42c1, #563d7c);
                    color: white;
                }
                .btn.report:hover {
                    transform: scale(1.07);
                    box-shadow: 0px 5px 15px rgba(111, 66, 193, 0.4);
                }
    
                .btn:active {
                    transform: scale(0.95);
                }
                `}
            </style>
        </div>
    );
    
    
    
};

export default PoseTracker2;



