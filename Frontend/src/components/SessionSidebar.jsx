import React from "react";
import "./SessionSidebar.css";

const SessionSidebar = ({ isOpen, onClose }) => {
  return (
    <div className={`session-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-content">
        <div className="header">
          <h2>Achievements 🏆</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="trophy-container">
          <p style={{fontFamily:"K2D", fontWeight:"bolder"}}>2025 10 Reps Challenge</p>
          <img src="/trophy.png" alt="Trophy" style={{marginTop:"10px",marginLeft:"-5px",width:"100px",height:"100px"}} className="trophy-icon" /><br></br>
          <img src="/silver.png" alt="Trophy" style={{marginTop:"10px",marginLeft:"-5px",width:"100px",height:"100px"}} className="trophy-icon" /><br></br>
          <img src="/bronze.png" alt="Trophy" style={{marginTop:"10px",marginLeft:"-5px",width:"100px",height:"100px"}} className="trophy-icon" /><br></br>
          
          <br></br>
        </div>
      </div>
    </div>
  );
};

export default SessionSidebar;
