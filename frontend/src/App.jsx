import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import BacktestDashboard from './pages/BacktestDashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    try {
      // Safely inspect browser memory for an active security token passport
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Local session storage tracker inaccessible:", err);
    } finally {
      setCheckingSession(false);
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Session disconnection fault:", err);
    }
  };

  // Prevent flash or freeze states while looking up the local token
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center font-mono text-xs text-brand-yellow">
        [ SYNCHRONIZING SECURE SESSION TELEMETRY... ]
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="relative">
      {/* Floating Sign-Out Action Module */}
      <button 
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 bg-rose-600 text-black font-mono font-black text-xs uppercase px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#FFF] hover:bg-white cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        [ DISCONNECT SESSION ]
      </button>
      <BacktestDashboard />
    </div>
  );
}