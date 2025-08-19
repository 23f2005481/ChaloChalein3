// src/Homepage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Input, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag,
  AutoComplete
} from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

// Popular destinations with consistent time data
const popularDestinations = [
  {
    id: 1,
    name: "Paris",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Explore the city of love and discover iconic landmarks like the Eiffel Tower and Louvre Museum.",
    timeOfDay: "Morning",
    time: "08:00"
  },
  {
    id: 2,
    name: "Bali",
    image: "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Experience the perfect blend of beaches, culture, and tropical landscapes in this Indonesian paradise.",
    timeOfDay: "Afternoon",
    time: "14:00"
  },
  {
    id: 3,
    name: "Tokyo",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Immerse yourself in the fascinating mix of traditional culture and futuristic technology.",
    timeOfDay: "Evening",
    time: "19:00"
  },
  {
    id: 4,
    name: "New York",
    image: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "The city that never sleeps offers endless entertainment, iconic skyscrapers, and cultural diversity.",
    timeOfDay: "Night",
    time: "22:00"
  },
  {
    id: 5,
    name: "Cairo",
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Discover ancient wonders and explore the rich history of Egypt's vibrant capital city.",
    timeOfDay: "Morning",
    time: "10:30"
  },
  {
    id: 6,
    name: "Sydney",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    description: "Experience the perfect blend of urban life and natural beauty in Australia's largest city.",
    timeOfDay: "Afternoon",
    time: "16:45"
  }
];

// Travel experiences data
const travelExperiences = [
  {
    id: 1,
    title: 'Cultural Tours',
    icon: '🏛️',
    description: 'Immerse yourself in local traditions and heritage.'
  },
  {
    id: 2,
    title: 'Adventure Activities',
    icon: '🧗',
    description: 'Get your adrenaline pumping with exciting experiences.'
  },
  {
    id: 3,
    title: 'Culinary Journeys',
    icon: '🍽️',
    description: 'Taste the world with authentic local cuisines.'
  },
  {
    id: 4,
    title: 'Relaxation Retreats',
    icon: '🧘',
    description: 'Unwind and rejuvenate at peaceful destinations.'
  }
];

const Homepage = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simulate fetching destination suggestions
  const handleSearch = (value) => {
    setSearchValue(value);
    if (value) {
      setLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        const filteredOptions = ['Paris', 'Tokyo', 'New York', 'Bali', 'Rome', 'Barcelona', 'Sydney']
          .filter(city => city.toLowerCase().includes(value.toLowerCase()))
          .map(city => ({ value: city }));
        setOptions(filteredOptions);
        setLoading(false);
      }, 500);
    } else {
      setOptions([]);
    }
  };

  const startPlanning = (destination = searchValue) => {
    if (destination) {
      // Store the destination in localStorage to use in the chatbot
      localStorage.setItem('selectedDestination', destination);
      navigate('/chatbot');
    }
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="hero-section" style={{ 
        backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1421&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '80px 0',
        position: 'relative'
      }}>
        <div style={{ 
          backgroundColor: 'rgba(0,0,0,0.4)', 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0 
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px' }}>
          <Title style={{ color: 'white', fontSize: '48px', marginBottom: '24px', marginTop: '20px' }} className="trip-heading">
            Discover Your Perfect Journey
          </Title>
          <Paragraph style={{ color: 'white', fontSize: '18px', maxWidth: '800px', margin: '0 auto 40px' }}>
            Let our AI-powered travel assistant create a personalized itinerary based on your preferences and interests.
          </Paragraph>
          
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <AutoComplete
              options={options}
              onSearch={handleSearch}
              onSelect={(value) => setSearchValue(value)}
              style={{ width: '100%' }}
              value={searchValue}
            >
              <Input 
                size="large"
                placeholder="Where would you like to go?" 
                prefix={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
                suffix={
                  <Button 
                    type="primary" 
                    icon={<SearchOutlined />} 
                    onClick={() => startPlanning()}
                    loading={loading}
                  >
                    Plan My Trip
                  </Button>
                }
                onPressEnter={() => startPlanning()}
              />
            </AutoComplete>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <Text style={{ color: 'white', marginRight: '10px' }}>Popular:</Text>
            {['Paris', 'Bali', 'Tokyo', 'New York'].map(city => (
              <Tag 
                key={city} 
                style={{ cursor: 'pointer', marginRight: '8px', backgroundColor: 'rgba(255,255,255,0.8)' }}
                onClick={() => startPlanning(city)}
              >
                {city}
              </Tag>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={{ padding: '60px 20px', backgroundColor: '#232837' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '40px', color: '#ffffff' }}>
          How ChaloChalein Works
        </Title>
        
        <Row gutter={[24, 24]} justify="center" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Col xs={24} sm={12} md={6}>
            <Card className="how-it-works-card destination-card" bordered={false} style={{ textAlign: 'center', height: '100%' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌍</div>
              <Title level={4} style={{ color: '#ffffff' }}>Choose Your Destination</Title>
              <Text style={{ color: '#ffffff' }}>Tell us where you want to go and when you're planning to travel.</Text>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card className="how-it-works-card destination-card" bordered={false} style={{ textAlign: 'center', height: '100%' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✈️</div>
              <Title level={4} style={{ color: '#ffffff' }}>Travel Preferences</Title>
              <Text style={{ color: '#ffffff' }}>Share your interests, travel style, and who you're traveling with.</Text>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card className="how-it-works-card destination-card" bordered={false} style={{ textAlign: 'center', height: '100%' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <Title level={4} style={{ color: '#ffffff' }}>AI Generates Itinerary</Title>
              <Text style={{ color: '#ffffff' }}>Our AI creates a personalized day-by-day plan just for you.</Text>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card className="how-it-works-card destination-card" bordered={false} style={{ textAlign: 'center', height: '100%' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
              <Title level={4} style={{ color: '#ffffff' }}>Explore & Customize</Title>
              <Text style={{ color: '#ffffff' }}>Review your itinerary, make adjustments, and get ready for your trip!</Text>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Popular Destinations */}
      <div className="popular-destinations" style={{ padding: '60px 20px', backgroundColor: '#232837' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <Title level={2} style={{ margin: 0, color: '#ffffff' }}>Popular Destinations</Title>
            <Button type="link" style={{ color: '#6c63ff' }} onClick={() => navigate('/chatbot')}>
              View All <ArrowRightOutlined />
            </Button>
          </div>
          
          <Row gutter={[24, 24]}>
            {popularDestinations.map(destination => (
              <Col xs={24} sm={12} md={8} key={destination.id}>
                <Card 
                  className="popular-destination-card"
                  hoverable
                  cover={
                    <div className="destination-img-container">
                      <img alt={destination.name} src={destination.image} />
                      <div className={`time-badge time-${destination.timeOfDay.toLowerCase()}`}>
                        <span className="time">{destination.time}</span>
                        <span className="period">{destination.timeOfDay}</span>
                      </div>
                    </div>
                  }
                  onClick={() => startPlanning(destination.name)}
                >
                  <Meta 
                    title={destination.name} 
                    description={destination.description} 
                    className="destination-meta"
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Travel Experiences */}
      <div style={{ padding: '60px 20px', backgroundColor: '#181c24' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '40px', color: '#ffffff' }}>
            Discover Experiences
          </Title>
          
          <Row gutter={[24, 24]}>
            {travelExperiences.map(experience => (
              <Col xs={24} sm={12} md={6} key={experience.id}>
                <Card 
                  className="destination-card"
                  bordered={false} 
                  style={{ textAlign: 'center', height: '100%', borderRadius: '12px', overflow: 'hidden' }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>{experience.icon}</div>
                  <Title level={4} style={{ color: '#ffffff' }}>{experience.title}</Title>
                  <Text style={{ color: '#ffffff' }}>{experience.description}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ 
        padding: '80px 20px', 
        backgroundImage: 'linear-gradient(to right, #1890ff, #096dd9)',
        textAlign: 'center'
      }}>
        <Title level={2} style={{ color: 'white', marginBottom: '24px' }}>
          Ready to Plan Your Dream Vacation?
        </Title>
        <Paragraph style={{ color: 'white', fontSize: '18px', maxWidth: '700px', margin: '0 auto 32px' }}>
          Let our AI travel assistant create a personalized itinerary based on your preferences. No more hours of research!
        </Paragraph>
        <Button 
          type="primary" 
          size="large"
          style={{ backgroundColor: 'white', color: '#1890ff', borderColor: 'white', height: '50px', fontSize: '16px', fontWeight: 'bold' }}
          onClick={() => navigate('/auth')}
        >
          Start Planning Now
        </Button>
      </div>

      <style jsx>{`
        .homepage {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .how-it-works-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default Homepage;