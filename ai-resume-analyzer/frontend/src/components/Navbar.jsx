import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (to) => location.pathname === to;

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-4 py-2 min-h-[44px] inline-flex items-center rounded-btn text-sm font-semibold transition-all duration-300 ease-out focus-ring ${
        isActive(to) ? 'bg-surface shadow-inset-sm text-ink' : 'text-ink-muted hover:text-ink hover:shadow-extruded-sm hover:bg-surface'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || menuOpen
        ? 'bg-surface/85 backdrop-blur-xl shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]'
        : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group rounded-btn focus-ring">
            <span className="w-9 h-9 rounded-btn bg-brand-gradient shadow-extruded flex items-center justify-center group-hover:-translate-y-px group-hover:shadow-extruded-hover transition-all duration-300">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6M9 8h.01M7 4h10a2 2 0 012 2v16l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z" />
              </svg>
            </span>
            <span className="font-display font-bold text-ink tracking-tight">
              ResumeIQ
              <span className="text-gradient"> AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {navLink('/dashboard', 'dashboard')}
                <div className="flex items-center gap-3 pl-4 ml-2">
                  <span className="w-9 h-9 rounded-full bg-surface shadow-inset-deep flex items-center justify-center">
                    <span className="text-xs font-bold text-accent">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </span>
                  <span className="text-sm text-ink-muted">{user.name}</span>
                  <Button variant="ghost" onClick={handleLogout}>logout</Button>
                </div>
              </>
            ) : (
              <>
                <Button to="/login" variant="ghost">sign in</Button>
                <Button to="/register">get started</Button>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-11 h-11 inline-flex items-center justify-center rounded-btn text-ink-muted shadow-extruded-sm focus-ring transition-all duration-300 active:shadow-inset-sm"
            aria-label={menuOpen ? 'close menu' : 'open menu'}
            aria-expanded={menuOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="md:hidden bg-surface/95 backdrop-blur-xl shadow-extruded">
          <div className="px-4 py-3 space-y-1">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2 mb-1">
                  <span className="w-10 h-10 rounded-full bg-surface shadow-inset-deep flex items-center justify-center">
                    <span className="text-sm font-bold text-accent">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                  </span>
                  <span className="text-sm text-ink font-medium">{user.name}</span>
                </div>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-btn text-sm text-ink font-semibold bg-surface shadow-inset-sm">dashboard</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 rounded-btn text-sm font-semibold text-ink-muted hover:text-ink">logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-btn text-sm font-semibold text-ink-muted hover:text-ink">sign in</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-btn text-sm font-bold text-white bg-accent shadow-extruded text-center mt-1">get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
