import React from "react";
import "./Footer.css";
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Column 1: Explore */}
        <div className="footer-column">
          <h4>Explore</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#questions">Questions</a></li>
            <li><a href="#articles">Articles</a></li>
            <li><a href="#tutorials">Tutorials</a></li>
          </ul>
        </div>

        {/* Column 2: Support */}
        <div className="footer-column">
          <h4>Support</h4>
          <ul>
            <li><a href="#faqs">FAQs</a></li>
            <li><a href="#help">Help</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>

        {/* Column 3: Stay Connected */}
        <div className="footer-column">
          <h4>Stay Connected</h4>
          <div className="social-icons">
            <a href="#facebook" aria-label="Facebook"><FaFacebook /></a>
            <a href="#instagram" aria-label="Instagram"><FaInstagram /></a>
            <a href="#twitter" aria-label="Twitter"><FaTwitter /></a>
          </div>
        </div>
      </div>

      {/* Centered bottom section */}
      <div className="footer-bottom">
        <h2>Deakin@CoffeeHouse 2025</h2>
        <div className="footer-legal-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms</a>
          <a href="#conduct">Code of Conduct</a>
        </div>
      </div>
    </footer>
  );
}