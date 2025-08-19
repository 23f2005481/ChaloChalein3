import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Tooltip, Button } from 'antd';
import { 
  HomeOutlined, 
  CompassOutlined, 
  InfoCircleOutlined, 
  PhoneOutlined,
  MoonOutlined,
  SunOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import Homepage from './Homepage';
import TravelPlanner from './components/TravelPlanner';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

import './index.css';
import './theme-toggle.css';

const { Header, Content, Footer } = Layout;

function AppContent() {
  const location = useLocation();
  const [darkMode, setDarkMode] = React.useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  React.useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Update the time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
  
  // Format the date and time
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(currentDateTime);
  
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(currentDateTime);
  
  // Determine which menu item should be active based on current path
  const getSelectedKey = () => {
    const pathname = location.pathname;
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/plan')) return 'plan';
    if (pathname.startsWith('/about')) return 'about';
    if (pathname.startsWith('/contact')) return 'contact';
    return '';
  };

  // Check if current page is Plan Trip or Chatbot
  const isPlanOrChatPage = location.pathname === '/plan' || location.pathname === '/chatbot';

  return (
    <Layout className="app-layout">
      <Header className="header">
        <Link to="/">
          <span className="hindi-logo-standalone">चलो चलें</span>
        </Link>
        <Menu mode="horizontal" className="header-nav" selectedKeys={[getSelectedKey()]}>
          <Menu.Item key="home" icon={<HomeOutlined />}>
            <Link to="/" className="header-link">Home</Link>
          </Menu.Item>
          <Menu.Item key="plan" icon={<CompassOutlined />}>
            <Link to="/plan" className="header-link">Plan Trip</Link>
          </Menu.Item>
          <Menu.Item key="about" icon={<InfoCircleOutlined />}>
            <Link to="/about" className="header-link">About</Link>
          </Menu.Item>
          <Menu.Item key="contact" icon={<PhoneOutlined />}>
            <Link to="/contact" className="header-link">Contact</Link>
          </Menu.Item>
        </Menu>
        <div className="header-controls">
          <div className="header-datetime">
            <ClockCircleOutlined className="datetime-icon" />
            <div className="datetime-info">
              <div className="datetime-date">{formattedDate}</div>
              <div className="datetime-time">{formattedTime}</div>
            </div>
          </div>
          <div className="theme-toggle">
            <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <Button 
                type="text" 
                icon={darkMode ? <SunOutlined className="theme-icon" /> : <MoonOutlined className="theme-icon" />}
                onClick={toggleTheme}
                className="theme-toggle-button"
                aria-label="Toggle theme"
              />
            </Tooltip>
          </div>
        </div>
      </Header>
      
      <Content className="main-content">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/plan" element={<TravelPlanner />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/chatbot" element={<TravelPlanner />} />
        </Routes>
      </Content>
      
      <Footer className="app-footer">
        <div>
          <div className="footer-logo">
            <span className="header-logo">
              {/* Removed English "ChaloChalein" text as per user request */}
              <span className="hindi-logo">चलो चलें</span>
            </span>
          </div>
          <p>Your AI-powered Travel Assistant</p>
          <p>© {new Date().getFullYear()} All Rights Reserved</p>
        </div>
      </Footer>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
