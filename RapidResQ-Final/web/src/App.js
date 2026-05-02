import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Navbar
import Navbar from './components/Navbar';

// Pages
import LandingPage from './components/LandingPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmergencyNumbers from './pages/EmergencyNumbers';
import FirstAidLibrary from './pages/FirstAidLibrary';
import CommunityBoard from './pages/Community';
import SafetyMap from './pages/SafetyMap';
import AIHelp from './pages/Ai';
import Account from './pages/Account';

/* Wrapper to control Navbar visibility */
function Layout({ children }) {
  const location = useLocation();

  const hideNavbarRoutes = ['/', '/login', '/signup'];

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/emergency-numbers" element={<EmergencyNumbers />} />
          <Route path="/firstaid" element={<FirstAidLibrary />} />
          <Route path="/community" element={<CommunityBoard />} />
          <Route path="/safetymap" element={<SafetyMap />} />
          <Route path="/aihelp" element={<AIHelp />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
