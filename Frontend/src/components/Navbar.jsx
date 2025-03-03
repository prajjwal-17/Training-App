import { Link } from "react-router-dom";
import "./Navbar.css";  // If in the same directory

const Navbar = () => {
  return (
    <nav style={{
      width: "1040px",
      height: "92px",
      position: "fixed",  // Keeps navbar visible
      top: "20px",         // Adjust as needed
      left: "50%",
      transform: "translateX(-50%)",  // Centers horizontally
      borderRadius: "50px",
      backgroundColor: "#B4EBCA",  // Dark background for visibility
      color: "#B4EBCA",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.2)", // Subtle shadow
      zIndex:"100"
    }}>
      <img src="logo.png" width={"164px"} height={"123px"} style={{marginTop:"3px", marginLeft:"-40px",borderRadius:"139.5px", marginRight:"160px"}} alt="" />
      <Link to="/" style={{ margin: "0 15px", color: "black",fontWeight:"bold", fontSize:"24px",fontFamily:"K2D", textDecoration: "none" }}>Home</Link>
      <Link to="/model" style={{ margin: "0 15px", color: "black",fontWeight:"bold", fontSize:"24px",fontFamily:"K2D", textDecoration: "none" }}>Model</Link>
      <Link to="/bot" style={{ margin: "0 15px", color: "black",fontWeight:"bold", fontSize:"24px",fontFamily:"K2D", textDecoration: "none" }}>NutriChat</Link>
      <Link to="/stats" style={{ margin: "0 15px", color: "black",fontWeight:"bold", fontSize:"24px",fontFamily:"K2D", textDecoration: "none" }}>Stats</Link>
      <Link to="/pose-tracker2" style={{ margin: "0 15px", color: "black",fontWeight:"bold", fontSize:"24px",fontFamily:"K2D", textDecoration: "none" }}>Flex-It-Out</Link>
    </nav>
  );
};

export default Navbar;

