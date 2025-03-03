import { useEffect, useRef, useState, useCallback } from "react";

const WorkoutCounter = ({ keypoints, exerciseMode, onRepsUpdate }) => {
    const [counter, setCounter] = useState(0);
    const [stage, setStage] = useState(null);
    const counterRef = useRef(0);
    const prevExerciseMode = useRef(exerciseMode);

    useEffect(() => {
        if (exerciseMode !== prevExerciseMode.current) {
            setCounter(0);
            setStage(null);
            counterRef.current = 0;
            prevExerciseMode.current = exerciseMode;
        }
    }, [exerciseMode]);

    const calculateAngle = (p1, p2, p3) => {
        if (!p1 || !p2 || !p3) return null;
        const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);
        return angle > 180 ? 360 - angle : angle;
    };

    const areKeypointsValid = (keypoints) => keypoints.every(kp => kp && kp.score > 0.6);

    const countReps = useCallback((keypoints) => {
        try {
            let leftAngle, rightAngle;

            if (exerciseMode === "bicep") {
                const points = [keypoints[5], keypoints[7], keypoints[9], keypoints[6], keypoints[8], keypoints[10]];
                if (!areKeypointsValid(points)) return;

                leftAngle = calculateAngle(points[0], points[1], points[2]);
                rightAngle = calculateAngle(points[3], points[4], points[5]);

                if (leftAngle > 160 && rightAngle > 160 && stage !== "down") {
                    setStage("down");
                } else if (leftAngle < 50 && rightAngle < 50 && stage === "down") {
                    setStage("up");
                    setCounter(prev => prev + 1);
                    counterRef.current += 1;
                    onRepsUpdate(counterRef.current);  // Call parent function
                }
            } 
            else if (exerciseMode === "squats") {
                const points = [keypoints[11], keypoints[13], keypoints[15], keypoints[12], keypoints[14], keypoints[16]];
                if (!areKeypointsValid(points)) return;

                leftAngle = calculateAngle(points[0], points[1], points[2]);
                rightAngle = calculateAngle(points[3], points[4], points[5]);

                if (leftAngle > 170 && rightAngle > 170 && stage !== "up") {
                    setStage("up");
                } else if (leftAngle < 100 && rightAngle < 100 && stage === "up") {
                    setStage("down");
                    setCounter(prev => prev + 1);
                    counterRef.current += 1;
                    onRepsUpdate(counterRef.current);  // Call parent function
                }
            } 
            else {
                const points = [keypoints[7], keypoints[11], keypoints[5], keypoints[8], keypoints[12], keypoints[6]];
                if (!areKeypointsValid(points)) return;

                leftAngle = calculateAngle(points[0], points[2], points[1]);
                rightAngle = calculateAngle(points[3], points[5], points[4]);

                if (leftAngle > 170 && rightAngle > 170 && stage !== "up") {
                    setStage("up");
                } else if (leftAngle < 40 && rightAngle < 40 && stage === "up") {
                    setStage("down"); 
                    setCounter(prev => prev + 1);
                    counterRef.current += 1;
                    onRepsUpdate(counterRef.current);  // Call parent function
                }
            }
        } catch (error) {
            console.error("❌ Error in rep counting:", error);
        }
    }, [exerciseMode, stage, onRepsUpdate]);

    useEffect(() => {
        if (keypoints) countReps(keypoints);
    }, [keypoints, countReps]);

    return <h1>Reps: {counter}</h1>;
};

export default WorkoutCounter;
