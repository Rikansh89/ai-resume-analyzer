import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled ? 'bg-white/90 backdrop-blur-md border-b border-stone-200' : 'bg-transparent'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-lg font-display font-bold text-gray-800 group-hover:text-brand-600 transition-colors">
              ResumeIQ AI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/dashboard'
                      ? 'text-brand-600'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  dashboard
                </Link>
                <span className="text-stone-200">/</span>
                <span className="text-sm text-gray-500">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-xs"
                >
                  logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  get started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-2">
            {user ? (
              <>
                <p className="text-sm text-gray-500 px-2 py-1">{user.name}</p>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-2 py-1.5 text-sm text-gray-700 hover:text-brand-600 rounded-lg hover:bg-stone-50">dashboard</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left px-2 py-1.5 text-sm text-red-500 rounded-lg hover:bg-red-50">logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-2 py-1.5 text-sm text-gray-700 rounded-lg hover:bg-stone-50">sign in</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-2 py-1.5 text-sm text-brand-600 font-medium rounded-lg hover:bg-brand-50">get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
