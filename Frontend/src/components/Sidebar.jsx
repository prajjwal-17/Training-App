import { useState } from "react";
import { House, Person, Gear, List, X } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Toggle Button */}
      <button
        className="btn btn-dark toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <List size={24} className={`icon ${isOpen ? "rotated" : ""}`} />
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        {/* Close Button */}
        {isOpen && (
          <button className="btn close-btn" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        )}

        <h2 className="mt-4">Menu</h2>
        <ul className="list-unstyled">
          <li className="mb-3">
            <House size={20} className="me-2" />
            <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
          </li>
          <li className="mb-3">
            <Person size={20} className="me-2" />
            <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
          </li>
          <li className="mb-3">
            <Gear size={20} className="me-2" />
            <Link to="/settings" onClick={() => setIsOpen(false)}>Settings</Link>
          </li>
          <li className="mb-3">
            <Person size={20} className="me-2" />
            <Link to="/cam" onClick={() => setIsOpen(false)}>Cam</Link>
          </li>
        </ul>
      </div>

      {/* CSS for Transitions */}
      <style>
        {`
          .sidebar {
            width: 250px;
            height: 100vh;
            position: fixed;
            top: 0;
            left: -250px;
            background: #212529;
            color: white;
            padding: 20px;
            transition: left 0.3s ease-in-out;
            z-index: 1100;
          }
          .sidebar.open {
            left: 0;
          }
          .mt-4 {
            margin-top: 2.5rem !important;
          }
          .toggle-btn {
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 1150;
          }
          .close-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 1150;
          }
          .icon {
            transition: transform 0.3s ease-in-out;
          }
          .icon.rotated {
            transform: rotate(90deg);
          }
          .list-unstyled a {
            text-decoration: none;
            color: white;
          }
          .list-unstyled a:hover {
            color: #ddd;
          }
        `}
      </style>
    </div>
  );
}
