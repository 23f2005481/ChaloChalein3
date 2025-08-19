import React from 'react';

const Homepage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
      Welcome to ChaloChalein
    </h1>
    <p style={{ fontSize: '1.2rem', marginTop: '1rem', color: 'var(--color-text)', opacity: 0.85 }}>
      This is your homepage. If you see this, routing and rendering are working!
    </p>
  </div>
);

export default Homepage; 