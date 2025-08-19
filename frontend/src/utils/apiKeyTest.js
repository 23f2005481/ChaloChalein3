// API Key Test Utility
import axios from 'axios';

// Test Firebase configuration
export const testFirebaseConfig = () => {
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
  };
  
  // Check if all required Firebase config values are present
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
  
  return {
    success: missingKeys.length === 0,
    message: missingKeys.length === 0 
      ? 'Firebase configuration is complete' 
      : `Missing Firebase configuration keys: ${missingKeys.join(', ')}`,
    config: firebaseConfig
  };
};

// Test Weather API
export const testWeatherAPI = async () => {
  const weatherApiKey = process.env.REACT_APP_WEATHER_API;
  if (!weatherApiKey) {
    return {
      success: false,
      message: 'Weather API key is missing'
    };
  }
  
  try {
    // Make a direct API call to Tomorrow.io
    const response = await axios.get('https://api.tomorrow.io/v4/weather/forecast', {
      params: {
        location: 'New York',
        apikey: weatherApiKey
      }
    });
    
    return {
      success: true,
      message: 'Weather API connection successful',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: `Weather API error: ${error.response?.data?.message || error.message}`,
      error: error.toString()
    };
  }
};

// Test Foursquare API
export const testFoursquareAPI = async () => {
  const foursquareApiKey = process.env.REACT_APP_FOURSQUARE_API_KEY;
  if (!foursquareApiKey) {
    return {
      success: false,
      message: 'Foursquare API key is missing'
    };
  }
  
  try {
    // Make a direct API call to Foursquare
    const response = await axios.get('https://api.foursquare.com/v3/places/search', {
      params: {
        query: 'coffee',
        limit: 1
      },
      headers: {
        'Authorization': foursquareApiKey
      }
    });
    
    return {
      success: true,
      message: 'Foursquare API connection successful',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: `Foursquare API error: ${error.response?.data?.message || error.message}`,
      error: error.toString()
    };
  }
};

// Test GROQ API
export const testGroqAPI = async () => {
  const groqApiKey = process.env.REACT_APP_GROQ_API_KEY;
  if (!groqApiKey) {
    return {
      success: false,
      message: 'GROQ API key is missing'
    };
  }
  
  try {
    // Make a direct API call to GROQ
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Hello, can you give me a brief greeting?"
        }
      ],
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      message: 'GROQ API connection successful',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: `GROQ API error: ${error.response?.data?.message || error.message}`,
      error: error.toString()
    };
  }
};

// Run all tests
export const runAllTests = async () => {
  const results = {
    firebase: testFirebaseConfig(),
    weather: await testWeatherAPI(),
    foursquare: await testFoursquareAPI(),
    groq: await testGroqAPI()
  };
  
  return results;
};

export default runAllTests;
