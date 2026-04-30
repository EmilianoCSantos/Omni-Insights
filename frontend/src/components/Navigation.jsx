import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navigation.css';

function Navigation() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">📊</span>
          Omni-Insights
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/analysis" className="nav-link">
              Data Analysis
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/cohort" className="nav-link">
              Cohort Analysis
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
