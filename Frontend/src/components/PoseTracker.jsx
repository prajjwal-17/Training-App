import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posedetection from "@tensorflow-models/pose-detection";

const PoseTracker = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [detector, setDetector] = useState(null);
    const counterRef = useRef(0);
    const [counter, setCounter] = useState(0);
    const [stage, setStage] = useState(null);
    const [exerciseMode, setExerciseMode] = useState("bicep");

    useEffect(() => {
        const setup = async () => {
            try {
                console.log("🚀 Initializing Pose Tracker...");

                await tf.setBackend("webgl");
                await tf.ready();
                console.log("✅ TensorFlow.js backend:", tf.getBackend());

                const detectorInstance = await posedetection.createDetector(
                    posedetection.SupportedModels.MoveNet,
                    { modelType: posedetection.movenet.modelType.SINGLEPOSE_THUNDER }
                );
                setDetector(detectorInstance);
                console.log("✅ Pose detector initialized successfully");

                startVideo(detectorInstance);
            } catch (error) {
                console.error("❌ Error initializing Pose Tracker:", error);
            }
        };

        setup();
    }, []);

    const startVideo = async (detectorInstance) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play()
                        .then(() => {
                            console.log("🎥 Camera stream started successfully.");
                            detectPose(detectorInstance);
                        })
                        .catch((error) => console.error("❌ Video play error:", error));
                };
            }
        } catch (error) {
            console.error("❌ Error accessing webcam:", error);
        }
    };

    const detectPose = async (detectorInstance) => {
        const ctx = canvasRef.current.getContext("2d");
        const video = videoRef.current;

        const detectLoop = async () => {
            if (!video || !detectorInstance) return;

            const poses = await detectorInstance.estimatePoses(video);
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(video, 0, 0, 640, 480);

            if (poses.length > 0) {
                const keypoints = poses[0].keypoints;
                drawKeypointsAndLines(keypoints, ctx);
                countReps(keypoints);
            }

            requestAnimationFrame(detectLoop);
        };

        detectLoop();
    };

    const drawKeypointsAndLines = (keypoints, ctx) => {
        const adjacentPairs = [
            [5, 7], [7, 9], // Left arm (shoulder-elbow-wrist)
            [6, 8], [8, 10], // Right arm
            [5, 6], // Shoulders
            [11, 12], // Hips
            [5, 11], [6, 12], // Torso
            [11, 13], [13, 15], // Left leg
            [12, 14], [14, 16] // Right leg
        ];

        ctx.lineWidth = 2;
        ctx.strokeStyle = "blue";

        adjacentPairs.forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            if (kp1?.score > 0.3 && kp2?.score > 0.3) {
                ctx.beginPath();
                ctx.moveTo(kp1.x, kp1.y);
                ctx.lineTo(kp2.x, kp2.y);
                ctx.stroke();
            }
        });

        keypoints.forEach(({ x, y, score }) => {
            if (score > 0.3) {
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.fill();
            }
        });
    };

    const calculateAngle = (a, b, c) => {
        if (!a || !b || !c) return 0;
        const atanA = Math.atan2(a.y - b.y, a.x - b.x);
        const atanB = Math.atan2(c.y - b.y, c.x - b.x);
        let angle = Math.abs((atanB - atanA) * (180 / Math.PI));
        return angle > 180 ? 360 - angle : angle;
    };

    const countReps = (keypoints) => {
        try {
            let angle, threshold;

            if (exerciseMode === "bicep") {
                const leftShoulder = keypoints[5];
                const leftElbow = keypoints[7];
                const leftWrist = keypoints[9];

                if (!leftShoulder || !leftElbow || !leftWrist) return;
                angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
                threshold = 30;

                if (angle > 160 && stage !== "down") {
                    setStage("down");
                }
                if (angle < threshold && stage === "down") {
                    setStage("up");
                    counterRef.current += 1;
                    setCounter(counterRef.current);
                }
            } else {
                const leftElbow = keypoints[7];
                const leftHip = keypoints[11];
                const leftShoulder = keypoints[5];

                if (!leftShoulder || !leftElbow || !leftHip) return;
                angle = calculateAngle(leftElbow, leftShoulder, leftHip);
                threshold = 50;

                if (angle > 160 && stage !== "up") {
                    setStage("up");
                }
                if (angle < threshold && stage === "up") {
                    setStage("down");
                    counterRef.current += 1;
                    setCounter(counterRef.current);
                }
            }
        } catch (error) {
            console.error("❌ Error in rep counting:", error);
        }
    };

    const toggleExerciseMode = () => {
        setExerciseMode((prev) => (prev === "bicep" ? "pushup" : "bicep"));
        counterRef.current = 0;
        setCounter(0);
        setStage(null);
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h1>Pose Tracker</h1>
            <h2>Mode: {exerciseMode.toUpperCase()}</h2>
            <h3>Reps: {counter}</h3>
            <button onClick={toggleExerciseMode}>
                Switch to {exerciseMode === "bicep" ? "Push-ups" : "Bicep Curls"}
            </button>
            <video ref={videoRef} autoPlay playsInline style={{ display: "none" }}></video>
            <canvas ref={canvasRef} width="640" height="480" style={{ border: "2px solid black" }}></canvas>
        </div>
    );
};

export default PoseTracker;
