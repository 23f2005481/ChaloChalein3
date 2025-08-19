# Frontend Integration Guide

This guide explains how to integrate the backend APIs with your frontend application.

## Available Files

- **api-integration.js**: ES6 module version for modern frameworks (React, Vue, Angular, etc.)
- **common.js**: Non-module version for direct inclusion via `<script>` tags

## Option 1: Using ES6 Modules (React, Vue.js, Angular, etc.)

### Step 1: Copy the API Integration File

Copy the `api-integration.js` file to your frontend project's source directory.

### Step 2: Import and Use in Components

```javascript
// In your component file (e.g., App.js, Weather.js, etc.)
import { getWeather, searchLocations, getRoute, getGroqResponse } from './path/to/api-integration';

// Example usage in a React component
function WeatherComponent() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchWeather(city) {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeather(city);
      setWeather(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Component JSX with form and display logic
  // ...
}
```

## Option 2: Using Direct Script Inclusion (HTML, jQuery, etc.)

### Step 1: Copy the Common.js File

Copy the `common.js` file to your frontend project's scripts directory.

### Step 2: Include in HTML

```html
<script src="path/to/common.js"></script>
```

### Step 3: Use the ChaloChalein Namespace

```html
<script>
  // Access APIs via the ChaloChalein.API namespace
  async function searchForLocation() {
    const query = document.getElementById('locationInput').value;
    
    try {
      const result = await ChaloChalein.API.searchLocations(query);
      displayLocations(result.locations);
    } catch (error) {
      console.error('Error searching for locations:', error);
      alert('Could not find locations: ' + error.message);
    }
  }
  
  // Other function implementations
  // ...
</script>
```

## Using the APIs

### Weather API

```javascript
// Get weather for a city
const weatherData = await getWeather('London');
// or with common.js:
const weatherData = await ChaloChalein.API.getWeather('London');

console.log(weatherData.temperature); // Access temperature
console.log(weatherData.description); // Access weather description
console.log(weatherData.icon);        // Access weather icon URL
```

### Location Search API

```javascript
// Search for locations
const locations = await searchLocations('Eiffel Tower');
// or with common.js:
const locations = await ChaloChalein.API.searchLocations('Eiffel Tower');

// locations.locations is an array of location objects with:
// - name: Location name
// - address: Full address
// - position: {lat, lng} coordinates
locations.locations.forEach(location => {
  console.log(location.name, location.position);
});
```

### Routing API

```javascript
// Get route between coordinates (must be lat,lng format)
const routeData = await getRoute('52.52001,13.40495', '48.13743,11.57549');
// or with common.js:
const routeData = await ChaloChalein.API.getRoute('52.52001,13.40495', '48.13743,11.57549');

console.log(routeData.distance);  // Distance in meters
console.log(routeData.duration);  // Duration in seconds
console.log(routeData.polyline);  // Encoded polyline for map display
```

### GROQ API

```javascript
// Get AI assistant response
const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Suggest a weekend itinerary for Berlin." }
];

const response = await getGroqResponse(messages);
// or with common.js:
const response = await ChaloChalein.API.getGroqResponse(messages);

console.log(response.content); // AI-generated response text
```

## Error Handling

All API functions will throw errors if the request fails. Always use try/catch blocks:

```javascript
try {
  const data = await getWeather('London');
  // Handle success
} catch (error) {
  // Handle error
  console.error('API Error:', error.message);
  // Show error message to user
}
```

## Checking API Server Health

You can check if the API server is running before making requests:

```javascript
const isServerUp = await checkApiHealth();
// or with common.js:
const isServerUp = await ChaloChalein.API.checkApiHealth();

if (!isServerUp) {
  // Show a message that the server is down
  alert('The API server is currently unavailable. Please try again later.');
}
```

## Troubleshooting

1. **CORS Errors**: If you see CORS errors in your browser console, ensure the backend server is running with CORS enabled (already configured).

2. **Network Errors**: Make sure the API server is running at http://localhost:5000. If you're using a different port or host, update the `API_BASE_URL` variable in the integration files.

3. **Data Format Issues**: Check the console for detailed error messages. The API functions include error logging.

4. **Server Not Running**: Run the server with `python server.py` in the backend directory. 