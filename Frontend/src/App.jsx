import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Model from "./components/Model";
import PoseTracker from "./components/PoseTracker";
import ProfileSetup from "./components/ProfileSetup";
import PoseTracker2 from "./components/PoseTracker2";
import Bot from "./components/Bot";
import Sidebar from "./components/Sidebar";
import Stats from "./components/Stats";

const Home = () => <div style={{ background:"#BCF4F5",height:"940px"}}>
  <img src="img.png" width={"940px"} height={"940px"} style={{marginTop:"-51px" , marginLeft:"-142px"}} alt="" />
    {/* <div style={{background:"aqua", marginTop:"300px",width:"940px" ,height:"940px"}}>Card</div>  */}
    <nav style={{width:"643px",height:"165px",marginTop:"-676px",marginLeft:"783px", fontFamily:"K2D",fontWeight:"700",fontSize:"96px",lineHeight:"124.8px"}}>Train on Your Own Time</nav>
  </div>



const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/model" element={<Model />} />
        <Route path="/bot" element={<Bot />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/pose-tracker2" element={<PoseTracker2 />} />
      </Routes>

     
    </>
  );
};

export default App;
