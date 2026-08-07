import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';

const Ring = ({ size, className }) => (
  <div className={`rounded-full bg-surface ${className}`} style={{ width: size, height: size }} />
);

const Background = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-surface">
    <div className="absolute -top-52 -right-52 animate-float opacity-60">
      <Ring size="36rem" className="shadow-extruded">
        <Ring size="28rem" className="shadow-inset mx-auto mt-16">
          <Ring size="18rem" className="shadow-extruded mx-auto mt-16" />
        </Ring>
      </Ring>
    </div>
    <div className="absolute -bottom-64 -left-48 animate-float2 opacity-50">
      <Ring size="32rem" className="shadow-inset-deep">
        <Ring size="24rem" className="shadow-extruded mx-auto mt-12">
          <Ring size="14rem" className="shadow-inset mx-auto mt-12" />
        </Ring>
      </Ring>
    </div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Background />
        <div className="min-h-screen flex flex-col relative">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="text-center py-6 text-xs text-ink-faint">
            crafted with <span className="text-accent">&#9829;</span> by Rikansh Thakur
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
