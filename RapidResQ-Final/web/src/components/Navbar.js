import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Phone,
  BookOpen,
  Shield,
  Map,
  MessageCircle,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import './Navbar.css';

const MOBILE_MAX = 900;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MOBILE_MAX + 1}px)`);
    const sync = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener('change', sync);
    sync();
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const linkClass = ({ isActive }) =>
    `nav-link${isActive ? ' active' : ''}`;

  return (
    <header className="navbar">
      <div className={`navbar-shell${menuOpen ? ' navbar-shell--menu-open' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-logo">
            <div className="logo-icon">
              <Shield size={20} aria-hidden />
            </div>
            <span className="logo-text">RapidResQ</span>
          </div>

          <button
            type="button"
            className="navbar-menu-btn"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>

          <nav className={`navbar-links${menuOpen ? ' navbar-links--open' : ''}`} aria-label="Main">
            <NavLink to="/dashboard" className={linkClass} end onClick={closeMenu}>
              <Home size={18} aria-hidden /> Dashboard
            </NavLink>
            <NavLink to="/emergency-numbers" className={linkClass} onClick={closeMenu}>
              <Phone size={18} aria-hidden /> Emergency
            </NavLink>
            <NavLink to="/firstaid" className={linkClass} onClick={closeMenu}>
              <BookOpen size={18} aria-hidden /> First Aid
            </NavLink>
            <NavLink to="/community" className={linkClass} onClick={closeMenu}>
              <Shield size={18} aria-hidden /> Community
            </NavLink>
            <NavLink to="/safetymap" className={linkClass} onClick={closeMenu}>
              <Map size={18} aria-hidden /> Safety Map
            </NavLink>
            <NavLink to="/aihelp" className={linkClass} onClick={closeMenu}>
              <MessageCircle size={18} aria-hidden /> AI Help
            </NavLink>
            <NavLink to="/account" className={linkClass} onClick={closeMenu}>
              <Settings size={18} aria-hidden /> Settings
            </NavLink>
          </nav>
        </div>
      </div>
      {menuOpen && (
        <button
          type="button"
          className="navbar-backdrop"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={closeMenu}
        />
      )}
    </header>
  );
}
