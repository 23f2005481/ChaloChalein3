import React from 'react';
import { Typography } from 'antd';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="page-hero">
        <div className="container">
          <h1>About ChaloChalein</h1>
          <p>Empowering travelers to discover the world through smart, personalized journey planning.</p>
        </div>
      </div>
      
      <div className="container">
        <section className="about-section">
          <div className="about-content">
            <h2>Our Mission</h2>
            <p>
              ChaloChalein is dedicated to transforming how people plan and experience travel. 
              Our AI-powered platform creates personalized itineraries that match your interests, 
              travel style, and preferences, making every journey unique and meaningful.
            </p>
            <p>
              We believe that travel should be more than just checking places off a list — it 
              should be an immersive experience that connects you with local cultures, hidden gems, 
              and unforgettable moments tailored specifically to you.
            </p>
          </div>
          <div className="about-image mission-image">
            <div className="image-overlay"></div>
          </div>
        </section>
        
        <section className="about-section reversed">
          <div className="about-content">
            <h2>Our Story</h2>
            <p>
              ChaloChalein began in 2023 when a group of passionate travelers and AI enthusiasts came together 
              with a shared vision: to create a platform that makes travel planning effortless and personal.
            </p>
            <p>
              After experiencing the frustration of generic travel recommendations and hours spent 
              researching destinations, we realized there was an opportunity to leverage AI to create 
              truly personalized travel experiences. By understanding individual preferences and local 
              insights, we could help travelers discover the perfect journey for them.
            </p>
          </div>
          <div className="about-image story-image">
            <div className="image-overlay"></div>
          </div>
        </section>
        
        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3>Personalization</h3>
              <p>We believe every traveler is unique, and your journey should reflect your individual preferences, interests, and travel style.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h3>Connection</h3>
              <p>We foster meaningful connections between travelers and destinations, helping you discover authentic local experiences and hidden gems.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3>Innovation</h3>
              <p>We continuously push the boundaries of what's possible with AI to create smarter, more intuitive travel planning experiences.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3>Accessibility</h3>
              <p>We believe personalized travel planning should be accessible to everyone, regardless of their travel expertise or planning skills.</p>
            </div>
          </div>
        </section>
        
        <section className="team-section">
          <h2>Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80')" }}></div>
              <h3>Priya Sharma</h3>
              <p className="member-role">Founder & CEO</p>
              <p className="member-bio">Travel enthusiast with 8+ years experience in AI and travel tech innovation.</p>
            </div>
            
            <div className="team-member">
              <div className="member-avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80')" }}></div>
              <h3>Arjun Mehta</h3>
              <p className="member-role">CTO</p>
              <p className="member-bio">AI researcher and engineer with a passion for creating intuitive user experiences.</p>
            </div>
            
            <div className="team-member">
              <div className="member-avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80')" }}></div>
              <h3>Kavita Patel</h3>
              <p className="member-role">Head of Content</p>
              <p className="member-bio">Travel writer and cultural expert who has visited over 35 countries across 6 continents.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage; 