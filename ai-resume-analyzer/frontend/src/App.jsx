import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-stone-50 pt-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        <div className="rise">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-medium mb-6">
            <span className="text-base">&#9889;</span>
            powered by gemini ai
          </span>

          <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 leading-tight mb-4">
            see how your resume<br/>
            <span className="text-brand-600">really stacks up</span>
          </h1>

          <p className="text-base text-gray-500 max-w-lg mx-auto mb-8 leading-relaxed">
            upload your resume and get a no-fluff breakdown of what's working,
            what's missing, and how to fix it.
          </p>

          <div className="flex items-center justify-center gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary">
                  try it free
                </Link>
                <Link to="/login" className="btn-secondary">
                  sign in
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-12 text-left">
          {[
            { icon: '&#128200;', title: 'ats score', desc: 'a real score out of 100 based on how well your resume parses' },
            { icon: '&#128270;', title: 'skill gaps', desc: 'keywords and tools you are missing compared to what\'s hot' },
            { icon: '&#128221;', title: 'actionable tips', desc: 'specific edits that actually move the needle' },
          ].map((f, i) => (
            <div key={i} className={`card card-hover p-4 rise d-${i + 1}`}>
              <span className="text-lg mb-1 block" dangerouslySetInnerHTML={{ __html: f.icon }} />
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">{f.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="text-center py-4 text-xs text-gray-400 border-t border-stone-100">
            crafted with <span className="text-red-400">&#9829;</span> by Rikansh Thakur
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
