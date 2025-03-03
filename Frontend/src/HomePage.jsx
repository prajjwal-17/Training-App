import React from "react";
import "./HomePage.css";
import Navbar from "./Navabar";
// import ThreeDViewer from "./ThreeDViewer"; // Import 3D Model Component

export default function HomePage() {
  return (
    <div className="homepage">
      <Navbar />
      <div className="content">
        <div className="text-section">
          <span className="trainer-name">CORE STRENGTH</span>
          <h1>
            Join my live personal <br /> training <span>classes</span>
          </h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Habitasse
            arcu vulputate velit scelerisque cursus nunc. Ac cras sapien quam
            sem et venenatis velit. A fusce sed convallis.
          </p>
          <div className="buttons">
            <button className="primary-btn">BOOK A CLASS</button>
            <button className="secondary-btn">ABOUT ME</button>
          </div>
        </div>
        <div className="model-container">
          {/* <ThreeDViewer /> 3D Model Component */}
        </div>
      </div>
    </div>
  );
}