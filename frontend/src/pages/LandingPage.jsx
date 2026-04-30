import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Omni-Insights</h1>
          <p className="tagline">Advanced Analytics for Surface Guided Radiation Therapy</p>
          <p className="description">
            Analyze HAL and TrueBeam SGRT tracking data with precision. 
            Visualize patient motion, detect positioning errors, and generate comprehensive reports 
            for surface-guided radiation therapy workflows.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Core Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📁</div>
            <h3>Multi-Format Import</h3>
            <p>Import tracking data from HAL and TrueBeam linear accelerators in CSV format.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Advanced Analytics</h3>
            <p>Calculate positioning accuracy, motion variability, and stability metrics in real-time.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Interactive Visualizations</h3>
            <p>Explore tracking data through interactive charts, trend analysis, and statistical summaries.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Data Privacy</h3>
            <p>All data is automatically anonymized. Bulk processing at the study/population level.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Report Export</h3>
            <p>Export analysis results in PDF, Excel, and PowerPoint formats.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast Processing</h3>
            <p>Handle large datasets efficiently with optimized backend processing.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload</h3>
            <p>Drag and drop your HAL CSV files or select from your computer.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Analyze</h3>
            <p>System automatically calculates tracking metrics and positioning accuracy.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Visualize</h3>
            <p>Explore interactive charts and real-time motion analysis.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Export</h3>
            <p>Generate professional reports in your preferred format.</p>
          </div>
        </div>
      </section>


    </div>
  );
}

export default LandingPage;
