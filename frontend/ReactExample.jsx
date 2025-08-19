// React component examples using the API helpers
import React, { useState, useEffect } from 'react';
import { getWeather, searchLocations, getRoute, getGroqResponse, checkApiHealth } from './js/api-integration';

// Server status component
export function ServerStatus() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    async function checkServer() {
      try {
        const isUp = await checkApiHealth();
        setStatus(isUp ? 'online' : 'offline');
      } catch (error) {
        setStatus('error');
      }
    }
    
    checkServer();
  }, []);

  return (
    <div className="server-status">
      {status === 'checking' && <p>Checking server status...</p>}
      {status === 'online' && <p className="success">✅ API Server is running</p>}
      {status === 'offline' && <p className="error">❌ API Server is not responding</p>}
      {status === 'error' && <p className="error">❌ Error checking server status</p>}
    </div>
  );
}

// Weather component
export function WeatherWidget() {
  const [city, setCity] = useState('London');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    if (!city.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getWeather(city);
      setWeather(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-widget">
      <h2>Weather Information</h2>
      <div className="input-group">
        <input 
          type="text" 
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
        />
        <button onClick={fetchWeather} disabled={loading}>
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {weather && (
        <div className="weather-result">
          <h3>{weather.location}</h3>
          <p><strong>Temperature:</strong> {weather.temperature}°C</p>
          <p><strong>Weather:</strong> {weather.description}</p>
          {weather.icon && <img src={weather.icon} alt={weather.description} />}
        </div>
      )}
    </div>
  );
}

// Location search component
export function LocationSearch() {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await searchLocations(query);
      setLocations(data.locations || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="location-search">
      <h2>Location Search</h2>
      <div className="input-group">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a place"
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {locations.length > 0 && (
        <div className="location-results">
          <h3>Search Results:</h3>
          <ul>
            {locations.map((location, index) => (
              <li key={index}>
                <strong>{location.name}</strong>
                <p>{location.address}</p>
                <p>Coordinates: {location.position.lat}, {location.position.lng}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Routing component
export function RouteCalculator() {
  const [origin, setOrigin] = useState('52.52001,13.40495');
  const [destination, setDestination] = useState('48.13743,11.57549');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateRoute = async () => {
    if (!origin.trim() || !destination.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getRoute(origin, destination);
      setRoute(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="route-calculator">
      <h2>Route Calculator</h2>
      <div className="input-group">
        <label>
          Origin (lat,lng):
          <input 
            type="text" 
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. 52.52001,13.40495"
          />
        </label>
        
        <label>
          Destination (lat,lng):
          <input 
            type="text" 
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. 48.13743,11.57549"
          />
        </label>
        
        <button onClick={calculateRoute} disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Route'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {route && (
        <div className="route-result">
          <h3>Route Information:</h3>
          <p><strong>Distance:</strong> {(route.distance / 1000).toFixed(2)} km</p>
          <p><strong>Duration:</strong> {Math.floor(route.duration / 3600)}h {Math.floor((route.duration % 3600) / 60)}m</p>
          <p><strong>Polyline:</strong> Available for map rendering</p>
          {/* You would typically render the route on a map here using a library like Leaflet or Google Maps */}
        </div>
      )}
    </div>
  );
}

// AI Assistant component
export function AIAssistant() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getResponse = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: input }
      ];
      
      const data = await getGroqResponse(messages);
      setResponse(data.content);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant">
      <h2>AI Assistant</h2>
      <div className="input-group">
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          rows={3}
        />
        <button onClick={getResponse} disabled={loading}>
          {loading ? 'Getting response...' : 'Get AI Response'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {response && (
        <div className="ai-response">
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

// Example App component using all the widgets
export default function App() {
  return (
    <div className="app">
      <h1>ChaloChalein App</h1>
      <ServerStatus />
      <div className="widgets">
        <WeatherWidget />
        <LocationSearch />
        <RouteCalculator />
        <AIAssistant />
      </div>
    </div>
  );
} 