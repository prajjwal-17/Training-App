import { motion } from "framer-motion";
import { useState } from "react";

const ProfileSetup = () => {
    const [shiftLeft, setShiftLeft] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: 1,
                scale: 1,
                x: shiftLeft ? "-40vw" : "0vw"
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="onboarding-card"
            style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                zIndex: 10
            }}
        >
            <h2>Welcome! Set Up Your Profile</h2>
            <p>What do we call you?</p>
            <input type="text" placeholder="Enter your name" />
            <button onClick={() => setShiftLeft(true)}>Next</button>
        </motion.div>
    );
};

export default ProfileSetup;