import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineCog, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'light' ? false : true);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Helper to set theme on <body>
  const setBodyTheme = (theme) => {
    document.body.setAttribute('data-theme', theme);
  };

  useEffect(() => {
    // Initialize from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      setBodyTheme(savedTheme);
    } else {
      setDarkMode(true);
      setBodyTheme('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    const newTheme = newDarkMode ? 'dark' : 'light';
    setBodyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/chatbot', label: 'Plan Trip' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header className="header" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--color-bg-card)', boxShadow: 'var(--color-shadow)', borderBottom: '1px solid var(--color-border)', padding: '0.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link to="/" className="header-logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        {/* Hindi Logo */}
        <span style={{ 
          fontFamily: 'Amita, sans-serif', 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: 'white',
          marginRight: '10px'
        }}>
          चलो चलें
        </span>
      </Link>
      <nav className="header-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`header-link${location.pathname === link.path ? ' active' : ''}`}
              style={{
                color: 'var(--color-text)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                background: location.pathname === link.path ? 'var(--color-primary)' : 'none',
                color: location.pathname === link.path ? '#fff' : 'var(--color-text)',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        {/* Theme Toggle Button */}
        <button
          className="theme-toggle"
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <HiOutlineSun className="toggle-icon" style={{ fontSize: '1.5rem' }} />
          ) : (
            <HiOutlineMoon className="toggle-icon" style={{ fontSize: '1.5rem' }} />
          )}
        </button>
        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn ant-btn"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Open Menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '2rem',
            marginLeft: '1rem',
            color: 'var(--color-primary)',
            cursor: 'pointer',
          }}
        >
          <span>&#9776;</span>
        </button>
      </nav>
      {/* Mobile Menu (hidden on desktop) */}
      {menuOpen && (
        <div className="mobile-menu" style={{ position: 'absolute', top: '100%', right: 0, background: 'var(--color-bg-card)', boxShadow: 'var(--color-shadow)', borderRadius: '0 0 1rem 1rem', padding: '1rem', minWidth: 180 }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`header-link${location.pathname === link.path ? ' active' : ''}`}
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: location.pathname === link.path ? '#fff' : 'var(--color-text)',
                background: location.pathname === link.path ? 'var(--color-primary)' : 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar; 