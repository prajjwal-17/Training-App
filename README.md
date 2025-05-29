# AI Fitness Trainer Web App

An AI-powered fitness web application that tracks your exercise form and counts reps in real-time using your webcam. Built using **React.js** for the frontend and **MediaPipe** with **OpenCV** for pose detection. The entire pose estimation logic is deployed to the browser via **TensorFlow.js**, enabling real-time, on-device performance without sending data to the server.

## Features

- **Real-time Pose Detection** using webcam
- **Exercise Classification** (Bicep curls, Push-ups, etc.)
- **Automatic Rep Counter**
- Visual feedback for posture correction
- Responsive skeletal rendering using **MediaPipe Pose**
- Lightweight **ML Model deployed with TensorFlow.js** (runs in browser)

---

## Tech Stack

| Frontend         | Backend / Model             | Deployment       |
|------------------|-----------------------------|------------------|
| React.js + Tailwind | Python + OpenCV + MediaPipe | TensorFlow.js    |

---

## Model Overview

The core model uses **MediaPipe's Pose Detection** to locate 33 key landmarks on the human body in real-time. We use basic trigonometry to compute the angle between joints (e.g., shoulder–elbow–wrist) to evaluate motion and posture, such as:

## TensorFlow.js Integration
We used TensorFlow.js to bring the model directly to the browser. This enables:

- No backend latency – everything runs in-browser

- Privacy-first – no camera footage is sent to a server

- Cross-platform compatibility – mobile and desktop browsers supported

- Fast performance via WebGL acceleration

The Python model was first tested using cv2 and MediaPipe, and then ported to a TensorFlow.js-compatible format using landmark-based inference logic.
