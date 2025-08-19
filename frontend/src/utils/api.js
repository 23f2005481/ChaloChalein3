const API_BASE_URL = 'http://localhost:5000/api';

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

export const getWeather = async (city) => {
  try {
    const url = new URL(`${API_BASE_URL}/weather`);
    url.searchParams.append('city', city);
    
    console.log('Fetching weather from:', url.toString());
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: defaultHeaders
    });
    
    const data = await handleResponse(response);
    console.log('Weather API Response:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      location: data.location,
      temperature: data.temperature,
      description: data.description,
      icon: data.icon
    };
  } catch (error) {
    console.error('Weather API Error:', error);
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
};

// OpenStreetMap Nominatim Geocoding
export const searchLocations = async (query) => {
  try {
    console.log('Searching locations with Nominatim for:', query);
    
    // Use Nominatim for geocoding
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`;
    
    const response = await fetch(nominatimUrl);
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Nominatim response:', data);
    
    if (!Array.isArray(data) || data.length === 0) {
      return { success: true, locations: [] };
    }
    
    const locations = data.map((item, index) => ({
      id: item.place_id || index,
      name: item.display_name.split(',')[0] || item.name || 'Unknown location',
      address: item.display_name || 'No address available',
      position: {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      },
      category: item.type || 'place',
      rating: 4.2,
      bbox: item.boundingbox
    }));
    
    return { success: true, locations };
  } catch (error) {
    console.error('Nominatim API Error:', error);
    throw new Error(`Failed to search locations: ${error.message}`);
  }
};

// OpenStreetMap OSRM Routing
export const getRoute = async (origin, destination, profile = 'driving') => {
  try {
    console.log('Getting route from OSRM:', { origin, destination, profile });
    
    // Format coordinates for OSRM
    let originStr, destStr;
    
    if (Array.isArray(origin)) {
      originStr = `${origin[1]},${origin[0]}`; // lat,lon
    } else if (typeof origin === 'object' && origin.lat && origin.lng) {
      originStr = `${origin.lat},${origin.lng}`;
    } else if (typeof origin === 'string') {
      originStr = origin;
    } else {
      throw new Error('Invalid origin format');
    }
    
    if (Array.isArray(destination)) {
      destStr = `${destination[1]},${destination[0]}`; // lat,lon
    } else if (typeof destination === 'object' && destination.lat && destination.lng) {
      destStr = `${destination.lat},${destination.lng}`;
    } else if (typeof destination === 'string') {
      destStr = destination;
    } else {
      throw new Error('Invalid destination format');
    }
    
    // OSRM routing API
    const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${originStr};${destStr}?overview=full&geometries=geojson&steps=true`;
    
    const response = await fetch(osrmUrl);
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('OSRM response:', data);
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const geometry = route.geometry;
      
      // Convert GeoJSON coordinates to Leaflet format [lat, lng]
      const polyline = geometry.coordinates.map(coord => [coord[1], coord[0]]);
      
      return {
        success: true,
        distance: route.distance, // meters
        duration: route.duration, // seconds
        polyline: polyline,
        raw_data: data
      };
    } else {
      throw new Error('No route found');
    }
  } catch (error) {
    console.error('OSRM API Error:', error);
    throw new Error(`Failed to calculate route: ${error.message}`);
  }
};

// OpenStreetMap Overpass API for POI recommendations
export const getRecommendations = async (query, center = null, radiusKm = 5) => {
  try {
    console.log('Getting POI recommendations from Overpass for:', query);
    
    let bbox = null;
    let centerCoords = null;
    
    // If we have a center, use it; otherwise geocode the query to get bbox
    if (center) {
      centerCoords = center;
    } else if (query) {
      // Get bbox from Nominatim
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
      const response = await fetch(nominatimUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0 && data[0].boundingbox) {
          bbox = data[0].boundingbox; // [minLat, maxLat, minLon, maxLon]
        }
      }
    }
    
    if (!bbox && !centerCoords) {
      throw new Error('Could not determine search area');
    }
    
    // Build Overpass query for POIs
    const poiQueries = [
      'node["tourism"="attraction"]',
      'node["tourism"="hotel"]',
      'node["amenity"="restaurant"]',
      'node["amenity"="cafe"]',
      'node["leisure"="amusement_park"]',
      'node["tourism"="museum"]',
      'node["leisure"="park"]',
      'node["shop"="mall"]'
    ];
    
    let overpassQuery;
    if (bbox) {
      // Use bbox: south,west,north,east
      const [minLat, maxLat, minLon, maxLon] = bbox;
      overpassQuery = `[out:json][timeout:25];(${poiQueries.join(';')})(area:${minLat},${minLon},${maxLat},${maxLon});out center 50;`;
    } else {
      // Use radius around center
      const radius = radiusKm * 1000; // meters
      overpassQuery = `[out:json][timeout:25];(${poiQueries.join(';')})(around:${radius},${centerCoords[0]},${centerCoords[1]});out center 50;`;
    }
    
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: overpassQuery
    });
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Overpass response:', data);
    
    const items = [];
    if (data.elements) {
      data.elements.forEach((element, index) => {
        const tags = element.tags || {};
        const lat = element.lat || (element.center && element.center.lat);
        const lon = element.lon || (element.center && element.center.lon);
        
        if (lat && lon) {
          // Determine category
          let category = 'place';
          if (tags.tourism === 'attraction') category = 'attraction';
          else if (tags.tourism === 'hotel') category = 'hotel';
          else if (tags.amenity === 'restaurant') category = 'restaurant';
          else if (tags.amenity === 'cafe') category = 'cafe';
          else if (tags.leisure === 'amusement_park') category = 'amusement_park';
          else if (tags.tourism === 'museum') category = 'museum';
          else if (tags.leisure === 'park') category = 'park';
          else if (tags.shop === 'mall') category = 'shopping';
          
          items.push({
            id: element.id || index,
            name: tags.name || tags.brand || category,
            address: tags['addr:full'] || tags['addr:street'] || '',
            position: { lat, lng: lon },
            category,
            rating: 4.2
          });
        }
      });
    }
    
    // Limit to top 100 items
    return items.slice(0, 100);
  } catch (error) {
    console.error('Overpass API Error:', error);
    console.log('Falling back to empty recommendations');
    return [];
  }
};

export const getGroqResponse = async (messages) => {
  try {
    const url = `${API_BASE_URL}/groq`;
    const requestBody = {
      messages: messages
    };
    
    console.log('Sending request to backend GROQ endpoint:', url);
    console.log('Request body:', requestBody);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await handleResponse(response);
    console.log('Backend GROQ API Response:', data);
    
    if (!data.success || !data.content) {
      throw new Error(data.error || 'No response received from chatbot');
    }
    
    return data.content;
  } catch (error) {
    console.error('Backend GROQ API Error:', error);
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
};

export const checkApiHealth = async () => {
  try {
    const url = `${API_BASE_URL}/health`;
    console.log('Checking API health at:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: defaultHeaders
    });
    
    const data = await handleResponse(response);
    console.log('Health Check Response:', data);
    return data.status === 'healthy';
  } catch (error) {
    console.error('Health Check Error:', error);
    return false;
  }
}; 