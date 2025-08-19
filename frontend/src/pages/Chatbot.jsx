import React from 'react';
import TravelPlanner from '../components/TravelPlanner';

const Chatbot = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', padding: '2rem 0' }}>
      <div className="card" style={{ maxWidth: 900, margin: '2rem auto' }}>
        <TravelPlanner />
      </div>
    </div>
  );
};

export default Chatbot; 