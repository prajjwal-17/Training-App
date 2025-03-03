import { useState, useEffect } from "react";
import "./TrophyPopup.css";
import { BsX } from "react-icons/bs"; // Bootstrap X icon

const trophyImage = "/trophy.png"; // Trophy Image from public folder

export default function TrophyPopup({ reps }) {
  const [showTrophy, setShowTrophy] = useState(false);

  // Show trophy popup when reps reach 10
  useEffect(() => {
    if (reps >= 10) {
      setShowTrophy(true);
    }
  }, [reps]);

  const closePopup = () => setShowTrophy(false);

  // Close popup on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {showTrophy && (
        <>
          <div className="overlay" onClick={closePopup}></div>
          <div className="trophy-popup">
            <button className="close-btn" onClick={closePopup}>
              <BsX size={24} color="white" />
            </button>
            <h3 className="greeting">Dear User</h3>
            <h1 className="congrats">Congratulations</h1>
            <h2 className="badge-title">「 10 Reps Badge 2024 」</h2>
            <div className="trophy-container">
              <img src={trophyImage} alt="Trophy" className="trophy-image" />
            </div>
            <p className="subtext">Awarded to You</p>
            <button className="claim-btn" onClick={closePopup}>
              Claim Reward
            </button>
          </div>
        </>
      )}
    </>
  );
}
