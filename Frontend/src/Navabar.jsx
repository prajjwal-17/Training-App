import React from "react";
import "./HomePage.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">🏋️ Fitness</div>
      <ul className="nav-links">
        <li><a href="#">HOME</a></li>
        <li><a href="#">ABOUT</a></li>
        <li><a href="#">CLASSES</a></li>
        <li><a href="#">PAGES ⬇</a></li>
        <li><a href="#">PACKAGES</a></li>
      </ul>
      <div className="nav-right">
        <span className="cart-icon">🛒<span className="cart-count">1</span></span>
        <button className="book-class-btn">BOOK CLASS</button>
      </div>
    </nav>
  );
}