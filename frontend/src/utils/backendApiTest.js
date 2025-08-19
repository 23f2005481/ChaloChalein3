// Backend API Connection Test Utility
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Test backend connection
export const testBackendConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return {
      success: true,
      message: 'Backend connection successful',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: `Backend connection failed: ${error.message}`,
      error
    };
  }
};

// Test weather API endpoint
export const testWeatherEndpoint = async (city = 'London') => {
  try {
    const response = await axios.get(`${API_URL}/weather`, {
      params: { city }
    });
    return {
      success: true,
      message: 'Weather API endpoint test successful',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: `Weather API endpoint test failed: ${error.message}`,
      error
    };
  }
};

// Test Foursquare API endpoint
export const testFoursquareEndpoint = async () => {
  try {
    const response = await axios.post(`${API_URL}/locations/test`, {
      apiKey: process.env.REACT_APP_FOURSQUARE_API_KEY
    });
    return {
      success: true,
      message: 'Foursquare API endpoint test successful',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: `Foursquare API endpoint test failed: ${error.message}`,
      error
    };
  }
};

// Test GROQ API endpoint
export const testGroqEndpoint = async () => {
  try {
    const response = await axios.post(`${API_URL}/itinerary/test`, {
      apiKey: process.env.REACT_APP_GROQ_API_KEY
    });
    return {
      success: true,
      message: 'GROQ API endpoint test successful',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: `GROQ API endpoint test failed: ${error.message}`,
      error
    };
  }
};

// Run all backend API tests
export const runAllBackendTests = async () => {
  const results = {
    backend: await testBackendConnection(),
    weather: await testWeatherEndpoint(),
    foursquare: await testFoursquareEndpoint(),
    groq: await testGroqEndpoint()
  };
  
  return results;
};

export default runAllBackendTests;
