import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const GROQ_API_URL = process.env.REACT_APP_GROQ_API_URL || 'http://localhost:5000/api';
// GROQ_API_KEY no longer needed with your backend implementation

import { 
  Steps, Form, DatePicker, Button, Card, Row, Col, 
  Input, Radio, Tag, Spin, message, Typography, Tabs, 
  List, Space, Avatar, Modal, Statistic, Alert
} from 'antd';
import dayjs from 'dayjs';
import { 
  EnvironmentOutlined, CalendarOutlined, CarOutlined, 
  HeartOutlined, RocketOutlined, EditOutlined,
  PlusOutlined, CloudOutlined, CompassOutlined,
  MessageOutlined, SendOutlined, CustomerServiceOutlined
} from '@ant-design/icons';
import MapComponent from './MapComponent';
import { getWeather, searchLocations, getRoute, getGroqResponse } from '../utils/api';

// Destructure Typography components
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;

const TravelPlanner = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: localStorage.getItem('selectedDestination') || '',
    startDate: dayjs(),
    endDate: dayjs().add(7, 'day'),
    transportation: 'flight',
    companions: 'solo',
    interests: [],
    notes: ''
  });
  
  // State for API responses
  const [weatherData, setWeatherData] = useState(null);
  const [locations, setLocations] = useState([]);

  const [rawResponse, setRawResponse] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [searchInitiated, setSearchInitiated] = useState(false);
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [helpMessages, setHelpMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [helpInput, setHelpInput] = useState('');

  // Calculate trip duration
  const duration = formData.endDate.diff(formData.startDate, 'day') + 1;

  // Interest options
  const interestOptions = [
    { label: 'History', value: 'history', icon: '🏛️' },
    { label: 'Art', value: 'art', icon: '🎨' },
    { label: 'Food', value: 'food', icon: '🍽️' },
    { label: 'Nature', value: 'nature', icon: '🌿' },
    { label: 'Adventure', value: 'adventure', icon: '🧗' },
    { label: 'Shopping', value: 'shopping', icon: '🛍️' },
    { label: 'Nightlife', value: 'nightlife', icon: '🌃' },
    { label: 'Relaxation', value: 'relaxation', icon: '🧘' },
    { label: 'Family', value: 'family', icon: '👨‍👩‍👧‍👦' },
    { label: 'Culture', value: 'culture', icon: '🎭' }
  ];
  
  // Transportation options
  const transportationOptions = [
    { label: 'Flight', value: 'flight', icon: '✈️' },
    { label: 'Train', value: 'train', icon: '🚆' },
    { label: 'Bus', value: 'bus', icon: '🚌' },
    { label: 'Car', value: 'car', icon: '🚗' }
  ];
  
  // Companion options
  const companionOptions = [
    { label: 'Solo', value: 'solo', icon: '🧍' },
    { label: 'Couple', value: 'couple', icon: '👫' },
    { label: 'Family', value: 'family', icon: '👨‍👩‍👧' },
    { label: 'Friends', value: 'friends', icon: '👥' }
  ];

  const fetchWeatherData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching weather for:', formData.destination);
      
      const data = await getWeather(formData.destination);
      console.log('Weather data:', data);
      
      const processedData = {
        location: data.location,
        current: { 
          temp: data.temperature,
          conditions: data.description,
          icon: data.icon || ''
        },
        forecast: data.forecast || []
      };
      
      setWeatherData(processedData);
    } catch (error) {
      console.error('Error fetching weather:', error);
      message.error('Could not fetch weather data');
      
      // Fallback data
      setWeatherData({
        location: formData.destination,
        current: { 
          temp: 25, 
          conditions: 'Partly Cloudy',
          icon: 'partly-cloudy'
        },
        forecast: Array(7).fill().map((_, i) => ({
          day: dayjs().add(i + 1, 'day').format('ddd'),
          temp: Math.round(20 + Math.random() * 10),
          conditions: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'][Math.floor(Math.random() * 4)]
        }))
      });
    } finally {
      setLoading(false);
    }
  }, [formData.destination]);

  // Fetch location suggestions
  const fetchLocationSuggestions = useCallback(async () => {
    try {
      setLoading(true);
  
      const data = await searchLocations(formData.destination);
      console.log('Location data:', data);
      
      const processedLocations = data.locations.map(location => ({
        id: location.id,
        name: location.name,
        address: location.address,
        category: location.category || 'Attraction',
        position: [location.position.lat, location.position.lng],
        rating: location.rating || 4.0,
        photo: location.photo || 'https://via.placeholder.com/150'
      }));
      
      setLocations(processedLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      message.error('Could not fetch location suggestions');
      
      // Fallback data
      setLocations([
        {
          id: 'place1',
          name: 'Popular Attraction 1',
          address: formData.destination,
          category: 'Attraction',
          position: [51.505, -0.09],
          rating: 4.5,
          photo: 'https://via.placeholder.com/150'       }
      ]);
    } finally {
      setLoading(false);
    }
  }, [formData.destination]);

  // Utility function to create a valid JSON itinerary from scratch
  const createDefaultItinerary = () => {
    const days = [];
    const duration = formData.endDate.diff(formData.startDate, 'day') + 1;
    
    // Default budget values based on destination type
    const isMajorCity = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Jaipur', 'Tokyo', 'New York', 'London', 'Paris', 'Rome', 'Barcelona', 'Sydney', 'Dubai', 'Singapore'].some(
      city => formData.destination.toLowerCase().includes(city.toLowerCase())
    );
    
    const isInternational = ['Japan', 'USA', 'UK', 'France', 'Italy', 'Spain', 'Australia', 'UAE', 'Singapore', 'Thailand', 'Malaysia', 'Indonesia', 'Europe', 'America', 'Tokyo', 'New York', 'London', 'Paris', 'Rome', 'Barcelona', 'Sydney', 'Dubai', 'Singapore'].some(
      location => formData.destination.toLowerCase().includes(location.toLowerCase())
    );
    
    // Higher budgets for international and major city destinations
    const dailyBudget = isInternational ? 15000 : (isMajorCity ? 8000 : 5000);
    const accommodationCost = isInternational ? 8000 * duration : (isMajorCity ? 4000 * duration : 2500 * duration);
    const foodCost = isInternational ? 3000 * duration : (isMajorCity ? 2000 * duration : 1200 * duration);
    const activityCost = isInternational ? 2500 * duration : (isMajorCity ? 1500 * duration : 800 * duration);
    const transportationCost = isInternational ? 1500 * duration : (isMajorCity ? 800 * duration : 500 * duration);
    const miscCost = Math.round(0.1 * (accommodationCost + foodCost + activityCost + transportationCost));
    
    const totalBudget = accommodationCost + foodCost + activityCost + transportationCost + miscCost;
    
    const dayTitles = [
      "Arrival and Orientation",
      "Historic Landmarks Exploration",
      "Cultural Immersion Day",
      "Local Cuisine and Shopping",
      "Nature and Outdoor Adventure",
      "Art and Museum Tour",
      "Relaxation and Scenic Views"
    ];
    
    for (let i = 0; i < duration; i++) {
      // Clone the date to avoid modifying the original
      const currentDate = formData.startDate.clone().add(i, 'day');
      const formattedDate = currentDate.format('YYYY-MM-DD');
      const dayTitle = dayTitles[i % dayTitles.length];
      
      const activities = [
        {
          time: "09:00",
          title: "Morning Exploration",
          description: `Start your day exploring the highlights of ${formData.destination}. Spend the morning visiting key landmarks and getting oriented with the city layout. The morning hours offer the best lighting for photography and smaller crowds at popular attractions.`,
          duration: "3 hours",
          tips: "Start early to avoid crowds and bring comfortable walking shoes.",
          cost: "Free or varies by attraction",
          costINR: isInternational ? "2000" : (isMajorCity ? "1000" : "500"),
          location: {
            name: "City Center",
            address: `${formData.destination} Main Square`
          }
        },
        {
          time: "12:30",
          title: "Local Cuisine Experience",
          description: `Enjoy authentic ${formData.destination} cuisine at a well-regarded local restaurant. This is a perfect opportunity to try regional specialties and rest after your morning activities. Many restaurants offer lunch specials that are more affordable than dinner menus.`,
          duration: "1.5 hours",
          tips: "Ask for the daily specials and try the local wine or beverage pairings.",
          cost: "$$",
          costINR: isInternational ? "1500" : (isMajorCity ? "800" : "400"),
          location: {
            name: "Local Cuisine Restaurant",
            address: `${formData.destination} Restaurant District`
          }
        },
        {
          time: "14:00",
          title: "Afternoon Cultural Activity",
          description: `Visit a museum or cultural site that aligns with your interest in ${formData.interests.join(', ')}. This afternoon timing allows you to spend a few hours immersed in the culture and history of the region, enhanced by your morning context of the city.`,
          duration: "3 hours",
          tips: "Many museums offer discounted tickets in the afternoon. Check if they have a guided tour available.",
          cost: "$10-20 entrance fee",
          costINR: isInternational ? "1500" : (isMajorCity ? "700" : "300"),
          location: {
            name: "Cultural Attraction",
            address: `${formData.destination} Cultural District`
          }
        },
        {
          time: "19:00",
          title: "Evening Dining and Entertainment",
          description: `Experience the vibrant evening atmosphere of ${formData.destination} with dinner at a recommended restaurant followed by a leisurely stroll or evening entertainment option. The city takes on a different character in the evening with beautiful lighting and a relaxed ambiance.`,
          duration: "2-3 hours",
          tips: "Make reservations in advance, especially during peak tourist season.",
          cost: "$$$",
          costINR: isInternational ? "3000" : (isMajorCity ? "1500" : "800"),
          location: {
            name: "Evening Venue",
            address: `${formData.destination} Evening District`
          }
        }
      ];
      
      days.push({
        day: i + 1,
        date: formattedDate,
        title: dayTitle,
        description: `Day ${i+1} focuses on ${dayTitle.toLowerCase()}, giving you a perfect balance of structured activities and free time to explore at your own pace.`,
        dailyBudgetINR: dailyBudget.toString(),
        activities
      });
    }
    
    return {
      destination: formData.destination,
      totalBudgetINR: totalBudget.toString(),
      budgetBreakdown: {
        accommodation: accommodationCost.toString(),
        food: foodCost.toString(),
        activities: activityCost.toString(),
        transportation: transportationCost.toString(),
        miscellaneous: miscCost.toString()
      },
      days
    };
  };

  // Generate itinerary
  const generateItinerary = async () => {
    setLoading(true);
    try {
      // Compose prompt for itinerary generation
      const prompt = `Create a highly detailed travel itinerary for a trip to ${formData.destination} from ${formData.startDate.format('YYYY-MM-DD')} to ${formData.endDate.format('YYYY-MM-DD')}. The traveler is interested in ${formData.interests.join(', ')} and will be traveling with ${formData.companions}. Preferred transportation is ${formData.transportation}. Additional notes: ${formData.notes || 'None'}.

For EACH activity, please provide:
1. A detailed description (at least 2-3 sentences) including historical context, what to expect, and why it's worth visiting
2. Practical details (opening hours, estimated duration, entry fees if applicable)
3. Insider tips or special recommendations
4. Specific location information
5. Estimated cost in Indian Rupees (INR) for the activity, including entry fees, food, transportation, etc.

Additionally, please provide:
- A daily budget estimate in Indian Rupees (INR) that includes accommodation, meals, activities, and local transportation
- A total trip budget estimate in Indian Rupees (INR)

Please provide a day-by-day plan with activities and locations in the following JSON format:
{
  "destination": "${formData.destination}",
  "totalBudgetINR": "50000",
  "budgetBreakdown": {
    "accommodation": "20000",
    "food": "15000",
    "activities": "8000",
    "transportation": "5000",
    "miscellaneous": "2000"
  },
  "days": [
    {
      "day": 1,
      "date": "${formData.startDate.format('YYYY-MM-DD')}",
      "dailyBudgetINR": "25000",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity Title",
          "description": "Detailed description of the activity",
          "duration": "2 hours",
          "tips": "Helpful tips for this activity",
          "cost": "1000",
          "location": {
            "name": "Location Name",
            "address": "Full address"
          }
        }
      ]
    }
  ]
}
      
IMPORTANT: Ensure your response is ONLY valid JSON with no additional text before or after the JSON object. Do not include markdown code blocks. Make sure all budget figures are in Indian Rupees (INR) with realistic estimates for ${formData.destination}.`;
      
      console.log("Sending itinerary request to backend:", prompt);
      
      // Call backend API to get itinerary
      const response = await axios.post('http://localhost:5000/api/chat/completions', {
        messages: [
          {
            role: "system",
            content: "You are a travel itinerary generator. Return ONLY a valid JSON object with no additional text or explanations. Do not wrap the JSON in code blocks. The JSON must be directly parseable by JSON.parse(). Be especially careful with arrays - ensure all array elements are properly separated by commas and there are no trailing commas. Always validate your JSON structure before returning it."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });
      
      console.log("Raw response from backend:", response.data);
      console.log("Response data type:", typeof response.data);
      console.log("Response data keys:", Object.keys(response.data || {}));
      console.log("Response status:", response.status);
      
      // Handle different response formats
      let responseData = response.data;
      if (responseData && typeof responseData === 'object') {
        // If response.data is already the content (direct response)
        if (responseData.content !== undefined) {
          // Standard format: {success: true, content: "..."}
          if (!responseData.success) {
            throw new Error(responseData.error || "Backend returned an error");
          }
        } else if (responseData.destination || responseData.days) {
          // Direct itinerary object
          responseData = { success: true, content: JSON.stringify(responseData) };
        } else {
          // Unknown format, try to stringify it
          console.log("Unknown response format, attempting to stringify:", responseData);
          responseData = { success: true, content: JSON.stringify(responseData) };
        }
      }
      
      if (!responseData || !responseData.content) {
        console.error("Invalid response format:", responseData);
        throw new Error("Invalid response format from the server");
      }
      
      let rawText = responseData.content || '';
      console.log("Raw text from GROQ:", rawText);
      
      // Check if this is a mock response
      if (rawText.includes('Times Square') && rawText.includes('Central Park')) {
        message.info("Using demo itinerary data. To get personalized AI-generated itineraries, please add a valid GROQ API key.");
      }
  
      // Store the raw response for display in case of error
      setRawResponse(rawText);
      
      // Clean up the text and parse JSON
      const parsed = parseItineraryJSON(rawText);
      
      if (parsed) {
        setItinerary(parsed);
        console.log("Successfully parsed itinerary:", parsed);
      } else {
        // Create a fallback itinerary from the raw text
        console.log("Creating fallback itinerary from text");
        const fallbackItinerary = createFallbackItinerary(rawText);
        setItinerary(fallbackItinerary);
        message.warning("The itinerary couldn't be parsed correctly. A fallback version has been created.");
      }
    } catch (err) {
      console.error("Error generating itinerary:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      
      let errorMessage = "Could not generate the itinerary. ";
      if (err.response) {
        errorMessage += `Server error: ${err.response.status} - ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += "Unknown error occurred";
      }
      
      message.error(errorMessage);
      
      // Create a default itinerary as last resort
      try {
        const defaultItinerary = createDefaultItinerary();
        console.log("Created default itinerary template:", defaultItinerary);
        setItinerary(defaultItinerary);
        setRawResponse(`Error generating itinerary: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
      } catch (fallbackError) {
        console.error("Even default itinerary creation failed:", fallbackError);
        setItinerary(null);
        setRawResponse(`Failed to create even a default itinerary. Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Robust JSON parsing function
  const parseItineraryJSON = (rawText) => {
    if (!rawText || typeof rawText !== 'string') {
      console.log("parseItineraryJSON: Invalid input", { rawText, type: typeof rawText });
      return null;
    }

    let cleanedText = rawText.trim();
    console.log("parseItineraryJSON: Original text length:", rawText.length);
    
    // Remove markdown code blocks
    cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/```$/gm, '').trim();
    console.log("parseItineraryJSON: After markdown cleanup, length:", cleanedText.length);
    
    // Try direct parsing first
    try {
      const parsed = JSON.parse(cleanedText);
      console.log("parseItineraryJSON: Direct parsing successful");
      if (isValidItinerary(parsed)) {
        console.log("parseItineraryJSON: Valid itinerary structure found");
        return parsed;
      } else {
        console.log("parseItineraryJSON: Parsed but invalid structure:", parsed);
      }
    } catch (error) {
      console.log("parseItineraryJSON: Direct JSON parsing failed:", error.message);
      console.log("parseItineraryJSON: Error position:", error.message.match(/position (\d+)/)?.[1]);
    }
    
    // Try to extract JSON object from text
    try {
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        const extractedJson = cleanedText.slice(firstBrace, lastBrace + 1);
        console.log("parseItineraryJSON: Extracted JSON length:", extractedJson.length);
        const parsed = JSON.parse(extractedJson);
        if (isValidItinerary(parsed)) {
          console.log("parseItineraryJSON: Extracted JSON parsing successful");
          return parsed;
        } else {
          console.log("parseItineraryJSON: Extracted but invalid structure:", parsed);
        }
      } else {
        console.log("parseItineraryJSON: No braces found in text");
      }
    } catch (error) {
      console.log("parseItineraryJSON: Extracted JSON parsing failed:", error.message);
    }
    
    // Try to fix common JSON issues
    try {
      const fixedJson = fixCommonJSONIssues(cleanedText);
      console.log("parseItineraryJSON: Fixed JSON length:", fixedJson.length);
      const parsed = JSON.parse(fixedJson);
      if (isValidItinerary(parsed)) {
        console.log("parseItineraryJSON: Fixed JSON parsing successful");
        return parsed;
      } else {
        console.log("parseItineraryJSON: Fixed but invalid structure:", parsed);
      }
    } catch (error) {
      console.log("parseItineraryJSON: Fixed JSON parsing failed:", error.message);
    }
    
    // Try comprehensive JSON fixing as last resort
    try {
      const comprehensiveFixed = comprehensiveJSONFix(cleanedText);
      console.log("parseItineraryJSON: Comprehensive fixed JSON length:", comprehensiveFixed.length);
      const parsed = JSON.parse(comprehensiveFixed);
      if (isValidItinerary(parsed)) {
        console.log("parseItineraryJSON: Comprehensive fixed JSON parsing successful");
        return parsed;
      } else {
        console.log("parseItineraryJSON: Comprehensive fixed but invalid structure:", parsed);
      }
    } catch (error) {
      console.log("parseItineraryJSON: Comprehensive fixed JSON parsing failed:", error.message);
    }
    
    console.log("parseItineraryJSON: All parsing attempts failed");
    return null;
  };

  // Validate itinerary structure
  const isValidItinerary = (data) => {
    return data && 
           typeof data === 'object' && 
           data.destination && 
           Array.isArray(data.days) && 
           data.days.length > 0;
  };

  // Fix common JSON formatting issues
  const fixCommonJSONIssues = (text) => {
    let fixed = text;
    
    // Fix missing commas between object properties
    fixed = fixed.replace(/}(\s*){/g, '},{');
    fixed = fixed.replace(/](\s*)\[/g, '],[');
    
    // Fix missing commas between array elements
    fixed = fixed.replace(/"(\s*)"/g, '","');
    
    // Fix trailing commas
    fixed = fixed.replace(/,(\s*)(}|\])/g, '$1$2');
    
    // Fix missing commas between string array elements
    fixed = fixed.replace(/}(\s*)\{/g, '},{');
    fixed = fixed.replace(/](\s*)\[/g, '],[');
    
    // Handle missing commas between string array elements
    fixed = fixed.replace(/"(\s+)"/g, '","');
    
    return fixed;
  };

  // More comprehensive JSON fixing function
  const comprehensiveJSONFix = (text) => {
    let fixed = text;
    
    // Remove any text before the first {
    const firstBrace = fixed.indexOf('{');
    if (firstBrace > 0) {
      fixed = fixed.substring(firstBrace);
    }
    
    // Remove any text after the last }
    const lastBrace = fixed.lastIndexOf('}');
    if (lastBrace > 0) {
      fixed = fixed.substring(0, lastBrace + 1);
    }
    
    // Fix missing commas between object properties
    fixed = fixed.replace(/}(\s*){/g, '},{');
    fixed = fixed.replace(/](\s*)\[/g, '],[');
    
    // Fix missing commas between array elements
    fixed = fixed.replace(/"(\s*)"/g, '","');
    
    // Fix trailing commas
    fixed = fixed.replace(/,(\s*)(}|\])/g, '$1$2');
    
    // Fix missing quotes around property names
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    
    // Fix single quotes to double quotes
    fixed = fixed.replace(/'/g, '"');
    
    // Fix missing quotes around string values
    fixed = fixed.replace(/:\s*([^",\{\}\[\]\s][^,\{\}\[\]]*[^",\{\}\[\]\s])\s*([,}\]])/g, ':"$1"$2');
    
    // Fix missing commas between properties
    fixed = fixed.replace(/"\s*}\s*"/g, '","');
    fixed = fixed.replace(/"\s*]\s*"/g, '","');
    
    // Fix missing commas between objects in arrays
    fixed = fixed.replace(/}\s*{/g, '},{');
    fixed = fixed.replace(/]\s*\[/g, '],[');
    
    return fixed;
  };

  // Create fallback itinerary from raw text
  const createFallbackItinerary = (rawText) => {
    const fallbackItinerary = {
      destination: formData.destination,
      totalBudgetINR: "Not available",
      budgetBreakdown: {
        accommodation: "Not provided",
        food: "Not provided",
        activities: "Not provided",
        transportation: "Not provided",
        miscellaneous: "Not provided"
      },
      days: []
    };
    
    // Try to extract day information
    const dayMatches = rawText.match(/day\s*\d+/gi) || [];
    const daysCount = Math.min(dayMatches.length, formData.endDate.diff(formData.startDate, 'day') + 1);
    
    if (daysCount === 0) {
      // Create at least one day
      const daysCount = formData.endDate.diff(formData.startDate, 'day') + 1;
      for (let i = 0; i < daysCount; i++) {
        fallbackItinerary.days.push({
          day: i + 1,
          date: formData.startDate.clone().add(i, 'day').format('YYYY-MM-DD'),
          dailyBudgetINR: "Not available",
          activities: [{
            time: "09:00",
            title: "Default Day Plan",
            description: "See raw text for details. This is a fallback itinerary created when structured content couldn't be parsed from the AI response.",
            duration: "Full day",
            tips: "Please try regenerating the itinerary for more detailed suggestions.",
            cost: "Information not available",
            location: { 
              name: "Location information unavailable",
              address: "Address not available" 
            }
          }]
        });
      }
    } else {
      // Create days based on extracted information
      for (let i = 0; i < daysCount; i++) {
        fallbackItinerary.days.push({
          day: i + 1,
          date: formData.startDate.clone().add(i, 'day').format('YYYY-MM-DD'),
          dailyBudgetINR: "Not available",
          activities: [{
            time: "09:00",
            title: `Day ${i + 1} Plan`,
            description: "See raw text for details. This is a fallback itinerary created when structured content couldn't be parsed from the AI response.",
            duration: "Full day",
            tips: "Please try regenerating the itinerary for more detailed suggestions.",
            cost: "Information not available",
            location: { 
              name: "Location information unavailable",
              address: "Address not available" 
            }
          }]
        });
      }
    }
    
    return fallbackItinerary;
  };
  


  // Effect to fetch weather and locations when search is initiated
  useEffect(() => {
    if (searchInitiated && formData.destination) {
      fetchWeatherData();
      fetchLocationSuggestions(); // Re-enabled to provide map data
      setSearchInitiated(false);
    }
  }, [searchInitiated, formData.destination, fetchWeatherData, fetchLocationSuggestions]);

  // Handle form data changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep === 3) {
      generateItinerary();
      setCurrentStep(4);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };
  // Handle previous step
  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Handle search button click
  const handleSearch = () => {
    if (formData.destination) {
      setSearchInitiated(true);
    }
  };

  // Check if current step is valid
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return !!formData.destination;
      case 1:
        return formData.startDate && formData.endDate;
      case 2:
        return !!formData.transportation;
      case 3:
        return formData.interests.length > 0;
      default:
        return true;
    }
  };

  // Chat message handler
  const handleHelpMessage = async (messageOrEvent) => {
    // Check if no message content or if input is empty
    if (!helpInput.trim() && typeof messageOrEvent !== 'string') {
      return;
    }
    
    // Get message content (either from parameter or from input state)
    const messageContent = typeof messageOrEvent === 'string' ? messageOrEvent : helpInput;
    
    const newMessage = { role: 'user', content: messageContent };
    setHelpMessages(prev => [...prev, newMessage]);
    setIsProcessing(true);

    try {
      // Prepare the context for the LLM
      const context = {
        destination: formData.destination,
        startDate: formData.startDate ? formData.startDate.format('YYYY-MM-DD') : null,
        endDate: formData.endDate ? formData.endDate.format('YYYY-MM-DD') : null,
        interests: formData.interests,
        companions: formData.companions,
        transportation: formData.transportation
      };

      console.log("Sending chat request to backend with context:", context);
      
      // Call API directly
      const response = await axios.post(`${GROQ_API_URL}/chat/completions`, {
        messages: [
          {
            role: "system",
            content: `You are a helpful travel assistant for ChaloChalein. 
            The user is planning a trip with the following details:
            - Destination: ${context.destination || 'Not specified'}
            - Travel Dates: ${context.startDate || 'Not specified'} to ${context.endDate || 'Not specified'}
            - Interests: ${context.interests?.join(', ') || 'Not specified'}
            - Traveling with: ${context.companions || 'Not specified'}
            - Transportation: ${context.transportation || 'Not specified'}

            Provide a detailed, personalized response to the user's query. 
            Use the context to make your response more relevant and helpful.
            Be conversational but professional.
            Include specific recommendations and tips when relevant.
            If the user asks about a specific destination, provide detailed information about that place.
            If the user asks about timing or seasons, consider the destination's climate and peak seasons.
            If the user asks about activities, suggest things that match their interests.
            Always be helpful and encouraging.`
          },
          {
            role: "user",
            content: messageContent
          }
        ]
      });

      console.log("Chat response from backend:", response.data);
      
      // Get the response from API
      // The chat/completions endpoint returns {success: true, content: "response text"}
      if (!response.data || !response.data.content) {
        throw new Error("Invalid response format from the server");
      }
      
      const finalResponse = response.data.content;

      // Add a small delay for a more natural feel
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHelpMessages(prev => [...prev, { role: 'assistant', content: finalResponse }]);
    } catch (error) {
      console.error('Error processing message:', error);
      let errorMessage = 'An unexpected error occurred';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Server responded with error:", error.response.data);
        errorMessage = error.response.data?.detail || error.response.data?.error || error.message;
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        errorMessage = "No response received from the server. Please check if the backend is running.";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
        errorMessage = error.message;
      }
      
      setHelpMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'm having trouble processing your request: ${errorMessage}. Please try again later.`
      }]);
    } finally {
      setIsProcessing(false);
      setHelpInput('');
    }
  };

  // Render destination step
  const renderDestinationStep = () => (
    <div className="step-content">
      <Title level={4}>Where would you like to go?</Title>
      <Paragraph>Enter your destination to start planning your perfect trip.</Paragraph>
      
      <Form layout="vertical">
        <Form.Item 
          label="Destination" 
          required
          validateStatus={formData.destination ? 'success' : 'error'}
          help={!formData.destination && 'Please enter a destination'}
        >
          <Input.Search
            size="large"
            placeholder="e.g., Paris, Tokyo, New York"
            prefix={<EnvironmentOutlined />}
            value={formData.destination}
            onChange={e => handleInputChange('destination', e.target.value)}
            onSearch={handleSearch}
            enterButton="Search"
            loading={loading}
          />
        </Form.Item>
        
        <div className="popular-destinations">
          <Text type="secondary">Popular destinations:</Text>
          <div className="tag-container">
            {['Paris', 'Bali', 'Tokyo', 'New York', 'Rome'].map(city => (
              <Tag
                key={city}
                color="blue"
                style={{ cursor: 'pointer', margin: '4px' }}
                onClick={() => {
                  handleInputChange('destination', city);
                  setSearchInitiated(true);
                }}
              >
                {city}
              </Tag>
            ))}
          </div>
        </div>
      </Form>
    </div>
  );

  // Render dates step
  const renderDatesStep = () => ( 
    <div className="step-content">
      <Title level={4}>When are you planning to visit {formData.destination}?</Title>
      <Paragraph>Select your travel dates to help us create the perfect itinerary.</Paragraph>
      
      <Form layout="vertical">
        <Form.Item 
          label="Travel Dates" 
          required
        >
          <DatePicker.RangePicker
            size="large"
            format="YYYY-MM-DD"
            value={[formData.startDate, formData.endDate]}
            onChange={(dates) => {
              if (dates) {
                handleInputChange('startDate', dates[0]);
                handleInputChange('endDate', dates[1]);
              }
            }}
            style={{ width: '100%' }}
          />
        </Form.Item>
        
        <div className="trip-summary">
          <Card size="small">
            <Text>Trip duration: <strong>{duration} days</strong></Text>
          </Card>
        </div>
      </Form>
    </div>
  );

  // Render transportation step
  const renderTransportationStep = () => (
    <div className="step-content">
      <Title level={4}>How will you be traveling?</Title>
      <Paragraph>Select your preferred mode of transportation.</Paragraph>
      
      <Form layout="vertical">
        <Form.Item label="Transportation">
          <Radio.Group 
            className="travel-mode-group"
            value={formData.transportation}
            onChange={e => handleInputChange('transportation', e.target.value)}
            size="large"
          >
            <Space direction="vertical">
              {transportationOptions.map(option => (
                <Radio.Button value={option.value} key={option.value}>
                  <Space>
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </Space>
                </Radio.Button>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item label="Who are you traveling with?">
          <Radio.Group 
            className="companion-group"
            value={formData.companions}
            onChange={e => handleInputChange('companions', e.target.value)}
            size="large"
          >
            <Space direction="vertical">
              {companionOptions.map(option => (
                <Radio.Button value={option.value} key={option.value}>
                  <Space>
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </Space>
                </Radio.Button>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </div>
  );

  // Render interests step
  const renderInterestsStep = () => (
    <div className="step-content">
      <Title level={4}>What are your interests?</Title>
      <Paragraph>Select activities and experiences you'd like to include in your trip.</Paragraph>
      
      <Form layout="vertical">
        <Form.Item 
          label="Interests" 
          required
          validateStatus={formData.interests.length > 0 ? 'success' : 'error'}
          help={formData.interests.length === 0 && 'Please select at least one interest'}
        >
          <div className="interest-tags">
            {interestOptions.map(option => {
              const isSelected = formData.interests.includes(option.value);
              return (
                <Tag
                  key={option.value}
                  color={isSelected ? 'blue' : 'default'}
                  style={{ 
                    cursor: 'pointer', 
                    margin: '8px', 
                    padding: '8px 12px',
                    fontSize: '16px'
                  }}
                  onClick={() => {
                    const newInterests = isSelected
                      ? formData.interests.filter(i => i !== option.value)
                      : [...formData.interests, option.value];
                    handleInputChange('interests', newInterests);
                  }}
                >
                  <Space>
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </Space>
                </Tag>
              );
            })}
          </div>
        </Form.Item>
        
        <Form.Item label="Additional Notes (Optional)">
          <Input.TextArea
            placeholder="Any specific preferences or requirements for your trip?"
            value={formData.notes}
            onChange={e => handleInputChange('notes', e.target.value)}
            rows={4}
          />
        </Form.Item>
      </Form>
    </div>
  );

  // Render itinerary step
  const renderItineraryStep = () => (
    <div className="step-content">
      <Title level={4}>Your Personalized Itinerary for {formData.destination}</Title>
      <Paragraph>Here's your day-by-day plan based on your preferences.</Paragraph>
      
      {itinerary && itinerary.days && Array.isArray(itinerary.days) ? (
        <div className="itinerary-container">
          <Tabs defaultActiveKey="0" tabPosition="left">
            {itinerary.days.map((day, index) => (
              <TabPane 
                tab={`Day ${day.day}: ${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`} 
                key={index}
              >
                <Card 
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Title level={4} style={{ margin: 0 }}>
                          Day {day.day}: {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Title>
                        {day.title && <Text type="secondary" style={{ fontSize: '16px' }}>{day.title}</Text>}
                      </div>
                      <Button icon={<EditOutlined />} size="small">Edit</Button>
                    </div>
                  }
                  style={{ marginBottom: '20px' }}
                >
                  {day.description && (
                    <Paragraph style={{ fontSize: '16px', marginBottom: '20px' }}>
                      {day.description}
                    </Paragraph>
                  )}
                  
                  {/* Calculate and display daily budget from activities */}
                  {(() => {
                    let dailyTotal = 0;
                    if (day.activities && Array.isArray(day.activities)) {
                      day.activities.forEach(activity => {
                        if (activity.cost) {
                          const cost = parseInt(activity.cost.toString().replace(/[^0-9]/g, ''));
                          if (!isNaN(cost)) {
                            dailyTotal += cost;
                          }
                        }
                      });
                    }
                    
                    // Show calculated budget if available, otherwise show the provided dailyBudgetINR
                    const budgetToShow = dailyTotal > 0 ? dailyTotal : day.dailyBudgetINR;
                    
                    if (budgetToShow) {
                      return (
                        <Alert
                          message={
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Estimated Daily Budget</span>
                              <span style={{ fontWeight: 'bold' }}>
                                {(() => {
                                  try {
                                    if (dailyTotal > 0) {
                                      // Show calculated budget
                                      return dailyTotal.toLocaleString('en-IN') + ' ₹';
                                    } else {
                                      // Show provided budget
                                      const numStr = day.dailyBudgetINR.toString().replace(/[^0-9]/g, '');
                                      const num = parseInt(numStr);
                                      return isNaN(num) ? day.dailyBudgetINR : num.toLocaleString('en-IN') + ' ₹';
                                    }
                                  } catch (e) {
                                    return budgetToShow;
                                  }
                                })()}
                              </span>
                            </div>
                          }
                          type={dailyTotal > 0 ? "success" : "info"}
                          style={{ marginBottom: '16px' }}
                          description={dailyTotal > 0 ? "Calculated from actual activity costs" : "Estimated budget"}
                        />
                      );
                    }
                    return null;
                  })()}
                  
                  {day.activities.map((activity, actIndex) => (
                    <Card 
                      key={actIndex}
                      type="inner" 
                      style={{ marginBottom: '16px', borderLeft: `4px solid ${getActivityColor(activity.time)}` }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Header with time and title */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <Title level={5} style={{ margin: 0 }}>
                            {activity.title || activity.description.split('.')[0]}
                          </Title>
                          <Tag color={getActivityColor(activity.time)}>
                            {activity.time}
                            {activity.duration && ` (${activity.duration})`}
                          </Tag>
                        </div>
                        
                        {/* Location information */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                          <div>
                            <Text strong>{activity.location.name}</Text>
                            {activity.location.address && (
                              <div><Text type="secondary">{activity.location.address}</Text></div>
                            )}
                          </div>
                        </div>
                        
                        {/* Activity description */}
                        <Paragraph style={{ margin: '8px 0' }}>
                          {activity.description}
                        </Paragraph>
                        
                        {/* Details row */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
                          {activity.cost && (
                            <div>
                              <Text type="secondary" strong>Cost:</Text> {activity.cost}
                            </div>
                          )}
                          {activity.costINR && (
                            <div>
                              <Text type="secondary" strong>Cost in INR:</Text>
                              <Text style={{ color: '#1890ff', fontWeight: 'bold' }}> 
                                {(() => {
                                  try {
                                    const numStr = activity.costINR.toString().replace(/[^0-9]/g, '');
                                    const num = parseInt(numStr);
                                    return isNaN(num) ? activity.costINR : num.toLocaleString('en-IN') + ' ₹';
                                  } catch (e) {
                                    return activity.costINR;
                                  }
                                })()}
                              </Text>
                            </div>
                          )}
                          {activity.tips && (
                            <div style={{ flex: '1 0 100%' }}>
                              <Text type="secondary" strong>Tips:</Text> {activity.tips}
                            </div>
                          )}
                        </div>
                        
                        {/* Tags */}
                        <div className="activity-tags" style={{ marginTop: '8px' }}>
                          {getActivityTags(activity.description || '').map(tag => (
                            <Tag color="blue" key={tag}>{tag}</Tag>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </Card>
              </TabPane>
            ))}
          </Tabs>
          
          <div className="itinerary-actions" style={{ marginTop: '24px' }}>
            <Space>
              <Button type="primary" className="save-itinerary" onClick={() => saveItinerary()}>Save Itinerary</Button>
              <Button icon={<PlusOutlined />} className="add-activity">Add Activity</Button>
              <Button onClick={() => shareItinerary()} className="share-button">Share</Button>
              <Button onClick={() => printItinerary()} className="print-button">Print</Button>
              <Button 
                onClick={async () => {
                  try {
                    setLoading(true);
                    const response = await axios.post('http://localhost:5000/api/test-groq');
                    console.log("Test GROQ response:", response.data);
                    if (response.data.success) {
                      if (response.data.content.includes('Times Square')) {
                        message.success("Backend is working! Using demo data (GROQ API key not configured).");
                      } else {
                        message.success("Backend and GROQ API are working correctly!");
                      }
                    } else {
                      message.error(`Backend test failed: ${response.data.error}`);
                    }
                  } catch (error) {
                    console.error("Test failed:", error);
                    message.error(`Test failed: ${error.message}`);
                  } finally {
                    setLoading(false);
                  }
                }}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
              >
                Test Backend
              </Button>
            </Space>
          </div>
        </div>
      ) : rawResponse ? (
        <div className="raw-itinerary-json" style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f0f0f0', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
          <Title level={5}>Raw Itinerary Response (Parsing Failed)</Title>
          <div style={{ marginBottom: '16px' }}>
            <Text type="secondary">
              The response couldn't be parsed as valid JSON. Here's the raw response from the server:
            </Text>
          </div>
          
          {/* Show parsing diagnostics */}
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
            <Text strong>Parsing Diagnostics:</Text>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Response length: {rawResponse.length} characters</li>
              <li>Contains JSON braces: {rawResponse.includes('{') && rawResponse.includes('}') ? 'Yes' : 'No'}</li>
              <li>Contains markdown: {rawResponse.includes('```') ? 'Yes' : 'No'}</li>
              <li>First brace position: {rawResponse.indexOf('{') !== -1 ? rawResponse.indexOf('{') : 'Not found'}</li>
              <li>Last brace position: {rawResponse.lastIndexOf('}') !== -1 ? rawResponse.lastIndexOf('}') : 'Not found'}</li>
            </ul>
          </div>
          
          <Card style={{ maxHeight: '500px', overflow: 'auto' }}>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{rawResponse}</pre>
          </Card>
          
          <div style={{ marginTop: '16px' }}>
            <Space>
              <Button 
                type="primary" 
                onClick={() => generateItinerary()} 
                icon={<RocketOutlined />}
              >
                Try Generating Again
              </Button>
              <Button 
                onClick={() => {
                  // Try to manually fix common issues
                  const fixed = comprehensiveJSONFix(rawResponse);
                  try {
                    const parsed = JSON.parse(fixed);
                    if (isValidItinerary(parsed)) {
                      setItinerary(parsed);
                      setRawResponse(null);
                      message.success('Successfully parsed manually fixed JSON!');
                    } else {
                      message.error('Manual fix failed - invalid structure');
                    }
                  } catch (error) {
                    message.error(`Manual fix failed: ${error.message}`);
                  }
                }}
              >
                Try Manual Fix
              </Button>
            </Space>
          </div>
        </div>
      ) : (
        <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            Generating your personalized itinerary...
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to get time period for badge classes
  const getTimePeriod = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 15) return 'lunch';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  // Helper function to get color based on time of day
  const getActivityColor = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return '#1890ff'; // Morning - blue
    if (hour < 15) return '#52c41a'; // Lunch - green
    if (hour < 18) return '#722ed1'; // Afternoon - purple
    return '#fa8c16'; // Evening - orange
  };

  // Helper function to extract activity tags
  const getActivityTags = (description) => {
    const tags = [];
    const lowerDesc = description.toLowerCase();
    
    // Activity type tags
    if (lowerDesc.includes('visit') || lowerDesc.includes('explore') || lowerDesc.includes('tour')) 
      tags.push('Sightseeing');
    if (lowerDesc.includes('lunch') || lowerDesc.includes('dinner') || lowerDesc.includes('breakfast') || lowerDesc.includes('café') || lowerDesc.includes('restaurant')) 
      tags.push('Dining');
    if (lowerDesc.includes('museum') || lowerDesc.includes('gallery') || lowerDesc.includes('exhibition')) 
      tags.push('Museum');
    if (lowerDesc.includes('park') || lowerDesc.includes('garden') || lowerDesc.includes('nature')) 
      tags.push('Outdoors');
    if (lowerDesc.includes('shop') || lowerDesc.includes('market') || lowerDesc.includes('store')) 
      tags.push('Shopping');
    
    // Return at most 2 tags
    return tags.slice(0, 2);
  };

  // Save itinerary to localStorage
  const saveItinerary = () => {
    try {
      localStorage.setItem('savedItinerary', JSON.stringify({
        destination: formData.destination,
        dates: [formData.startDate.format('YYYY-MM-DD'), formData.endDate.format('YYYY-MM-DD')],
        itinerary: itinerary
      }));
      message.success('Itinerary saved successfully!');
    } catch (error) {
      console.error('Error saving itinerary:', error);
      message.error('Could not save itinerary');
    }
  };

  // Share itinerary
  const shareItinerary = () => {
    message.info('Sharing functionality will be implemented in a future update');
  };

  // Print itinerary
  const printItinerary = () => {
    window.print();
  };

  // Render budget summary component
  const renderBudgetSummary = () => {
    if (!itinerary) return null;
    
    // Calculate total budget from itinerary activities
    let totalBudget = 0;
    let accommodationCost = 0;
    let foodCost = 0;
    let activitiesCost = 0;
    let transportationCost = 0;
    
    if (itinerary && Array.isArray(itinerary)) {
      itinerary.forEach(day => {
        if (day.activities && Array.isArray(day.activities)) {
          day.activities.forEach(activity => {
            if (activity.cost) {
              const cost = parseInt(activity.cost.toString().replace(/[^0-9]/g, ''));
              if (!isNaN(cost)) {
                totalBudget += cost;
                
                // Categorize costs based on activity type
                const activityType = (activity.title || '').toLowerCase();
                if (activityType.includes('hotel') || activityType.includes('accommodation') || activityType.includes('stay')) {
                  accommodationCost += cost;
                } else if (activityType.includes('lunch') || activityType.includes('dinner') || activityType.includes('breakfast') || activityType.includes('food') || activityType.includes('restaurant')) {
                  foodCost += cost;
                } else if (activityType.includes('flight') || activityType.includes('train') || activityType.includes('bus') || activityType.includes('car') || activityType.includes('transport')) {
                  transportationCost += cost;
                } else {
                  activitiesCost += cost;
                }
              }
            }
          });
        }
      });
    }
    
    // If no costs found in activities, try to use the existing budget structure
    if (totalBudget === 0 && itinerary.totalBudgetINR) {
      const existingBudget = parseInt(itinerary.totalBudgetINR.toString().replace(/[^0-9]/g, ''));
      if (!isNaN(existingBudget)) {
        totalBudget = existingBudget;
      }
    }
    
    // If still no budget, try to calculate from daily budgets
    if (totalBudget === 0 && itinerary.days && Array.isArray(itinerary.days)) {
      itinerary.days.forEach(day => {
        if (day.dailyBudgetINR) {
          const dailyBudget = parseInt(day.dailyBudgetINR.toString().replace(/[^0-9]/g, ''));
          if (!isNaN(dailyBudget)) {
            totalBudget += dailyBudget;
          }
        }
      });
    }
    
    const budgetBreakdown = {
      accommodation: accommodationCost > 0 ? accommodationCost.toString() : "Not provided",
      food: foodCost > 0 ? foodCost.toString() : "Not provided",
      activities: activitiesCost > 0 ? activitiesCost.toString() : "Not provided",
      transportation: transportationCost > 0 ? transportationCost.toString() : "Not provided",
      miscellaneous: "Not provided"
    };
    
    // Format the budget string to show only numbers
    const formatBudget = (budgetStr) => {
      if (!budgetStr) return "Not available";
      
      // Extract the number and format with commas for thousands
      const numericValue = parseInt(budgetStr.toString().replace(/[^0-9]/g, ''));
      if (isNaN(numericValue)) return budgetStr;
      
      return numericValue.toLocaleString('en-IN') + " ₹";
    };
    
    return (
      <Card 
        title={<Title level={4}>Estimated Trip Budget</Title>}
        style={{ marginBottom: '24px' }}
        className="budget-summary-card"
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
            {totalBudget > 0 ? formatBudget(totalBudget.toString()) : "Not available"}
          </Title>
          <Text type="secondary">Total estimated cost in Indian Rupees</Text>
        </div>
        
        <Title level={5}>Budget Breakdown</Title>
        <div className="budget-breakdown" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <Card size="small" style={{ width: 'calc(50% - 8px)' }}>
            <Statistic 
              title="Accommodation" 
              value={formatBudget(budgetBreakdown.accommodation)} 
              valueStyle={{ fontSize: '18px' }}
            />
          </Card>
          <Card size="small" style={{ width: 'calc(50% - 8px)' }}>
            <Statistic 
              title="Food" 
              value={formatBudget(budgetBreakdown.food)} 
              valueStyle={{ fontSize: '18px' }}
            />
          </Card>
          <Card size="small" style={{ width: 'calc(50% - 8px)' }}>
            <Statistic 
              title="Activities" 
              value={formatBudget(budgetBreakdown.activities)} 
              valueStyle={{ fontSize: '18px' }}
            />
          </Card>
          <Card size="small" style={{ width: 'calc(50% - 8px)' }}>
            <Statistic 
              title="Transportation" 
              value={formatBudget(budgetBreakdown.transportation)} 
              valueStyle={{ fontSize: '18px' }}
            />
          </Card>
        </div>
        
        <Alert
          message="Budget Note"
          description="This budget is calculated from the actual costs in your itinerary. Actual expenses may vary based on your choices, season of travel, and accommodation preferences."
          type="info"
          showIcon
        />
      </Card>
    );
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderDestinationStep();
      case 1:
        return renderDatesStep();
      case 2:
        return renderTransportationStep();
      case 3:
        return renderInterestsStep();
      case 4:
        return renderItineraryStep();
      default:
        return null;
    }
  };

  // Render sidebar content
  const renderSidebar = () => (
    <div className="planner-sidebar">
      {weatherData && (
        <div className="weather-card">
          <div className="weather-icon">
            <CloudOutlined style={{ fontSize: '2rem' }} />
          </div>
          <div className="weather-details">
            <div className="weather-location">{weatherData.location}</div>
            <div className="temp">{weatherData.current.temp}°C</div>
            <div className="conditions">{weatherData.current.conditions}</div>
          </div>
        </div>
      )}
      
      {locations.length > 0 && (
        <div className="map-container">
          <div style={{ marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
            <CompassOutlined style={{ marginRight: '0.5rem' }} />
            Suggested Locations
          </div>
          <div className="map" style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <MapComponent 
              searchQuery={formData.destination}
              locations={locations.map(loc => ({
                id: loc.id,
                name: loc.name,
                position: [loc.position[0], loc.position[1]],
                category: loc.category || 'attraction',
                rating: loc.rating
              }))}
              center={[locations[0].position[0], locations[0].position[1]]}
              height="400px"
              itinerary={itinerary}
            />
          </div>
        </div>
      )}

      <div className="trip-summary-card">
        <h2>Trip Summary</h2>
        
        <div className="trip-info-item">
          <div className="trip-info-label">Destination:</div>
          <div className="trip-info-value">{formData.destination}</div>
        </div>
        
        <div className="trip-info-item">
          <div className="trip-info-label">Dates:</div>
          <div className="trip-info-value">
            {formData.startDate.format('MMM D')} - {formData.endDate.format('MMM D, YYYY')}
          </div>
        </div>
        
        <div className="trip-info-item">
          <div className="trip-info-label">Duration:</div>
          <div className="trip-info-value">{duration} days</div>
        </div>
        
        <div className="trip-info-item">
          <div className="trip-info-label">Transportation:</div>
          <div className="trip-info-value">
            {transportationOptions.find(opt => opt.value === formData.transportation)?.label || formData.transportation}
          </div>
        </div>
        
        <div className="trip-info-item">
          <div className="trip-info-label">Traveling with:</div>
          <div className="trip-info-value">
            {companionOptions.find(opt => opt.value === formData.companions)?.label || formData.companions}
          </div>
        </div>
        
        {formData.interests.length > 0 && (
          <div className="trip-info-item">
            <div className="trip-info-label">Interests:</div>
            <div className="trip-info-value">
              {formData.interests.map(interest => {
                const interestOption = interestOptions.find(opt => opt.value === interest);
                return (
                  <Tag key={interest} style={{ marginBottom: '0.5rem' }}>
                    {interestOption?.icon} {interestOption?.label}
                  </Tag>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {renderBudgetSummary()}
    </div>
  );

  // Render chat
  const renderChat = () => {
    return (
      <>
        <div 
          className="floating-chat-button" 
          onClick={() => setIsChatOpen(true)}
        >
          <Button type="primary" shape="circle" icon={<CustomerServiceOutlined className="chat-icon" />} />
          <span className="chat-label">Ask me</span>
        </div>

        <Modal
          title={
            <div className="chat-modal-header">
              <div className="chat-modal-title">Travel Assistant</div>
            </div>
          }
          open={isChatOpen}
          onCancel={() => setIsChatOpen(false)}
          footer={null}
          className="chat-modal"
          width={400}
          style={{ top: 20 }}
          styles={{ body: { padding: 0, height: '500px', display: 'flex', flexDirection: 'column' } }}
        >
          <div className="chat-messages">
            {helpMessages.length === 0 ? (
              <div className="welcome-message">
                <div className="welcome-icon">✨</div>
                <div>
                  <p>Hi there! I'm your personal travel assistant.</p>
                  <p>Let me help you plan your trip to {formData.destination || 'your dream destination'}.</p>
                  <p className="welcome-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ) : (
              helpMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`chat-message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}
                >
                  {msg.content}
                </div>
              ))
            )}
            
            {isProcessing && (
              <div className="chat-message bot-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
          
          <div className="chat-input">
            <Input 
              placeholder="Type your message..." 
              value={helpInput} 
              onChange={(e) => setHelpInput(e.target.value)}
              onPressEnter={() => handleHelpMessage()}
              disabled={isProcessing}
            />
            <Button 
              type="primary" 
              onClick={() => handleHelpMessage()}
              disabled={isProcessing || !helpInput.trim()}
              icon={<SendOutlined />}
              className="send-button"
            />
          </div>
        </Modal>
      </>
    );
  };

  return (
    <div className="travel-planner">
      <div className="planner-header">
        <Title level={2}>Plan Your Trip to {formData.destination || 'Your Dream Destination'}</Title>
        <Steps current={currentStep} style={{ maxWidth: '800px', margin: '24px auto' }}>
          <Step title="Destination" icon={<EnvironmentOutlined />} />
          <Step title="Dates" icon={<CalendarOutlined />} />
          <Step title="Travel" icon={<CarOutlined />} />
          <Step title="Interests" icon={<HeartOutlined />} />
          <Step title="Itinerary" icon={<RocketOutlined />} />
        </Steps>
      </div>

      <div className="travel-planner-layout">
        {/* Main content area */}
        <div className="planner-main">
          <div className="step-card" style={{ borderRadius: '12px', padding: '1.5rem' }}>
            {loading && currentStep !== 4 ? (
              <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px', color: '#ffffff' }}>
                  Loading...
                </div>
              </div>
            ) : (
              renderStepContent()
            )}
            
            <div className="step-actions">
              <div className="step-buttons">
                {currentStep > 0 && (
                  <Button 
                    onClick={handlePrev}
                    style={{ marginRight: '8px' }}
                    className="prev-button"
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < 4 && (
                  <Button 
                    type="primary" 
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className={`next-button${currentStep === 3 ? ' generate-itinerary-button' : ''}`}
                  >
                    {currentStep === 3 ? 'Generate Itinerary' : 'Next'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar area */}
        <div className="planner-sidebar">
          {renderSidebar()}
        </div>
      </div>

      {/* Chat */}
      {renderChat()}
    </div>
  );
};

export default TravelPlanner;