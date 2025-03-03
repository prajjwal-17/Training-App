import { Routes, Route } from "react-router-dom";
import Navbar from "./NavabarNavbar";
import Exercise from "./components/Exercise";
import Model from "./components/Model";
import PoseTracker from "./components/PoseTracker";
import HomePage from "./HomePage";



const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/model" element={<Model />} />
        <Route path="/exercise" element={<Exercise />} />
        <Route path="/pose-tracker" element={<PoseTracker />} />
      </Routes>
    </>
  );
};

export default App;
