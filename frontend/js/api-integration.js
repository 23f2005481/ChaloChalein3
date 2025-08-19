/**
 * API integration module for ChaloChalein frontend
 * This module provides functions to interact with the backend API
 */

// Base URL for API - change this based on your deployment
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Get weather data for a city
 * @param {string} city - The name of the city
 * @returns {Promise} - Promise with weather data
 */
async function getWeather(city) {
  try {
    const response = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok || data.error) {
      throw new Error(data.error || 'Failed to fetch weather data');
    }
    
    return data;
  } catch (error) {
    console.error('Weather API Error:', error);
    throw error;
  }
}

/**
 * Search for locations
 * @param {string} query - The search query
 * @returns {Promise} - Promise with location results
 */
async function searchLocations(query) {
  try {
    const response = await fetch(`${API_BASE_URL}/location/search?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok || (data.success === false)) {
      throw new Error(data.error || 'Failed to fetch location suggestions');
    }
    
    return data;
  } catch (error) {
    console.error('Location Search API Error:', error);
    throw error;
  }
}

/**
 * Get route between two points
 * @param {string} origin - Starting coordinates (latitude,longitude)
 * @param {string} destination - Ending coordinates (latitude,longitude)
 * @returns {Promise} - Promise with route data
 */
async function getRoute(origin, destination) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (!response.ok || (data.success === false)) {
      throw new Error(data.error || 'Failed to generate itinerary');
    }
    
    return data;
  } catch (error) {
    console.error('Routing API Error:', error);
    throw error;
  }
}

/**
 * Get response from GROQ AI
 * @param {Array} messages - Array of message objects {role, content}
 * @returns {Promise} - Promise with AI response
 */
async function getGroqResponse(messages) {
  try {
    const response = await fetch(`${API_BASE_URL}/groq`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });
    
    const data = await response.json();
    
    if (!response.ok || (data.success === false)) {
      throw new Error(data.error || 'Failed to get AI response');
    }
    
    return data;
  } catch (error) {
    console.error('GROQ API Error:', error);
    throw error;
  }
}

/**
 * Check if the API server is reachable
 * @returns {Promise<boolean>} - True if the server is reachable
 */
async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const data = await response.json();
    return response.ok && data.status === 'ok';
  } catch (error) {
    console.error('API Health Check Error:', error);
    return false;
  }
}

// Export all functions for use in your React/Vue/other frontend components
export {
  getWeather,
  searchLocations,
  getRoute,
  getGroqResponse,
  checkApiHealth
}; 