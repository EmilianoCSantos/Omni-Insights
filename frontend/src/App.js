import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import Analysis from './components/Analysis';
import CohortAnalysis from './components/CohortAnalysis';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/cohort" element={<CohortAnalysis />} />
      </Routes>
    </Router>
  );
}

export default App;
