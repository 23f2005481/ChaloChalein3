import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer style={{ marginTop: '2rem', padding: '2rem 0', background: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)', boxShadow: 'var(--color-shadow)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 2rem' }}>
        {/* Removed English "ChaloChalein" line and description as per user request */}
        <div style={{ flex: '1 1 180px' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li><Link to="/" className="header-link">Home</Link></li>
            <li><Link to="/chatbot" className="header-link">Plan Trip</Link></li>
            <li><Link to="/about" className="header-link">About</Link></li>
            <li><Link to="/contact" className="header-link">Contact</Link></li>
          </ul>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Contact Us</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--color-text)', opacity: 0.85 }}>
            <li>Email: info@chalochalein.com</li>
            <li>Phone: +91 12345 67890</li>
            <li>Address: 123, Travel Street, India</li>
          </ul>
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Follow Us</h4>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" style={{ color: 'var(--color-accent)', fontSize: '1.5rem' }}><FiFacebook /></a>
            <a href="#" style={{ color: 'var(--color-accent)', fontSize: '1.5rem' }}><FiTwitter /></a>
            <a href="#" style={{ color: 'var(--color-accent)', fontSize: '1.5rem' }}><FiInstagram /></a>
            <a href="#" style={{ color: 'var(--color-accent)', fontSize: '1.5rem' }}><FiLinkedin /></a>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '2rem', paddingTop: '1rem', textAlign: 'center', color: 'var(--color-text)', opacity: 0.7, fontWeight: 500 }}>
        <p>&copy; {new Date().getFullYear()}. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 