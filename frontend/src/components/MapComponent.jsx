// src/components/MapComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { searchLocations, getRoute, getRecommendations } from '../utils/api';

// Fix for default marker icon issue in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different categories
const createCustomIcon = (category) => {
  const colors = {
    attraction: '#1890ff',
    hotel: '#722ed1',
    restaurant: '#52c41a',
    cafe: '#13c2c2',
    amusement_park: '#fa8c16',
    museum: '#eb2f96',
    park: '#52c41a',
    shopping: '#f5222d',
    place: '#1890ff'
  };
  
  const color = colors[category] || colors.place;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    ">📍</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const MapComponent = ({ 
  searchQuery = '', 
  origin = null, 
  destination = null,
  center = [51.505, -0.09], 
  zoom = 11,
  height = '400px',
  showSearchResults = true,
  showRoute = true,
  routeProfile = 'driving',
  itinerary = [] // New prop for itinerary places
}) => {
  const [locations, setLocations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [route, setRoute] = useState(null);
  const [itineraryRoutes, setItineraryRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const mapRef = useRef(null);

  // Search locations and get recommendations when searchQuery changes
  useEffect(() => {
    if (searchQuery && showSearchResults) {
      setLoading(true);
      
      // Fetch both locations and recommendations in parallel
      Promise.allSettled([
        searchLocations(searchQuery),
        getRecommendations(searchQuery)
      ]).then(results => {
        const [locResult, recResult] = results;
        
        // Handle locations
        if (locResult.status === 'fulfilled' && locResult.value.success) {
          const locs = locResult.value.locations || [];
          setLocations(locs);
          
          // Set map center to the first location (main destination)
          if (locs.length > 0) {
            const mainLocation = locs[0];
            setMapCenter([mainLocation.position.lat, mainLocation.position.lng]);
          }
        } else {
          setLocations([]);
        }
        
        // Handle recommendations
        if (recResult.status === 'fulfilled') {
          setRecommendations(recResult.value || []);
        } else {
          setRecommendations([]);
        }
        
        setError(null);
      }).catch(err => {
        console.error('Error fetching map data:', err);
        setError(err.message);
        setLocations([]);
        setRecommendations([]);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [searchQuery, showSearchResults]);

  // Get route when origin and destination change
  useEffect(() => {
    if (origin && destination && showRoute) {
      setLoading(true);
      getRoute(origin, destination, routeProfile)
        .then(data => {
          setRoute(data);
          setError(null);
        })
        .catch(err => {
          console.error('Error fetching route:', err);
          setRoute(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [origin, destination, showRoute, routeProfile]);

  // Calculate routes between itinerary places
  useEffect(() => {
    if (itinerary && itinerary.length > 0) {
      calculateItineraryRoutes();
    }
  }, [itinerary]);

  const calculateItineraryRoutes = async () => {
    if (!itinerary || itinerary.length < 2) return;
    
    const routes = [];
    
    for (let i = 0; i < itinerary.length - 1; i++) {
      const currentPlace = itinerary[i];
      const nextPlace = itinerary[i + 1];
      
      // Extract location names from itinerary
      const currentName = currentPlace.title || currentPlace.name || currentPlace.location;
      const nextName = nextPlace.title || nextPlace.name || nextPlace.location;
      
      if (currentName && nextName) {
        try {
          // Search for both locations to get coordinates
          const [currentLoc, nextLoc] = await Promise.all([
            searchLocations(currentName),
            searchLocations(nextName)
          ]);
          
          if (currentLoc.success && currentLoc.locations.length > 0 && 
              nextLoc.success && nextLoc.locations.length > 0) {
            
            const origin = currentLoc.locations[0].position;
            const dest = nextLoc.locations[0].position;
            
            // Get route between these two places
            const routeData = await getRoute(origin, dest, routeProfile);
            
            if (routeData && routeData.success) {
              routes.push({
                from: currentName,
                to: nextName,
                route: routeData,
                origin: origin,
                destination: dest
              });
            }
          }
        } catch (error) {
          console.error(`Error calculating route from ${currentName} to ${nextName}:`, error);
        }
      }
    }
    
    setItineraryRoutes(routes);
  };

  // Fit map to show all locations and recommendations
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    
    // Collect all points: main destination, recommendations, and itinerary places
    const allPoints = [...locations, ...recommendations];
    
    // Add itinerary places to the points array
    if (itinerary && itinerary.length > 0) {
      itinerary.forEach(day => {
        if (day.activities && Array.isArray(day.activities)) {
          day.activities.forEach(activity => {
            if (activity.location && activity.location.coordinates) {
              allPoints.push({
                position: {
                  lat: activity.location.coordinates.lat,
                  lng: activity.location.coordinates.lng
                }
              });
            }
          });
        }
      });
    }
    
    if (allPoints.length === 0) return;
    
    if (allPoints.length === 1) {
      // Single point: zoom to city level
      const point = allPoints[0];
      map.setView([point.position.lat, point.position.lng], 11);
    } else {
      // Multiple points: fit bounds with padding
      const bounds = L.latLngBounds(
        allPoints.map(point => [point.position.lat, point.position.lng])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [locations, recommendations, itinerary]);

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters) => {
    if (!meters) return 'Unknown';
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  if (loading) {
    return (
      <div style={{ 
        height, 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗺️</div>
          <div>Loading map data...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      <MapContainer 
        ref={mapRef}
        center={mapCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        zoomControl={false}
        attributionControl={true}
      >
        {/* OpenStreetMap tile layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Main destination marker */}
        {locations.length > 0 && (
          <Marker 
            key="main-destination"
            position={[locations[0].position.lat, locations[0].position.lng]}
            icon={L.divIcon({
              className: 'main-destination-marker',
              html: `<div style="
                background-color: #f5222d;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                border: 4px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
              ">🎯</div>`,
              iconSize: [25, 25],
              iconAnchor: [12.5, 12.5],
            })}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#f5222d' }}>
                  🎯 {locations[0].name}
                </h3>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                  📍 Main Destination
                </p>
                {locations[0].address && (
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                    📍 {locations[0].address}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Itinerary place markers */}
        {itinerary && itinerary.length > 0 && itinerary.map((day, dayIndex) => {
          if (day.activities && Array.isArray(day.activities)) {
            return day.activities.map((activity, activityIndex) => {
              if (activity.location && activity.location.coordinates) {
                return (
                  <Marker
                    key={`itinerary-${dayIndex}-${activityIndex}`}
                    position={[activity.location.coordinates.lat, activity.location.coordinates.lng]}
                    icon={L.divIcon({
                      className: 'itinerary-place-marker',
                      html: `<div style="
                        background-color: #fa8c16;
                        width: 22px;
                        height: 22px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 12px;
                      ">📍</div>`,
                      iconSize: [22, 22],
                      iconAnchor: [11, 11],
                    })}
                  >
                    <Popup>
                      <div style={{ minWidth: '200px' }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#fa8c16' }}>
                          📍 {activity.title || activity.name}
                        </h3>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                          <strong>Day {dayIndex + 1}</strong> - {activity.time || 'TBD'}
                        </p>
                        {activity.location && activity.location.address && (
                          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                            📍 {activity.location.address}
                          </p>
                        )}
                        {activity.cost && (
                          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#52c41a' }}>
                            💰 Cost: ₹{activity.cost}
                          </p>
                        )}
                        <div style={{ marginTop: '8px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            backgroundColor: '#fa8c16',
                            color: 'white',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            Itinerary Place
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            });
          }
          return null;
        })}

        {/* Recommendation markers */}
        {recommendations.map((item, index) => (
          <Marker
            key={`rec_${item.id || index}`}
            position={[item.position.lat, item.position.lng]}
            icon={createCustomIcon(item.category)}
            eventHandlers={{ click: () => handleMarkerClick(item) }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>{item.name}</h3>
                {item.address && (
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>📍 {item.address}</p>
                )}
                <div style={{ marginTop: 8 }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px',
                    backgroundColor: '#52c41a',
                    color: 'white', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
                  }}>{item.category}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Itinerary route polylines */}
        {itineraryRoutes.map((routeData, index) => (
          <Polyline
            key={`itinerary-route-${index}`}
            positions={routeData.route.polyline}
            color="#fa8c16"
            weight={3}
            opacity={0.7}
            dashArray="5, 5"
          />
        ))}

        {/* Main route polyline */}
        {route && Array.isArray(route.polyline) && route.polyline.length > 0 && (
          <Polyline
            positions={route.polyline}
            color="#1890ff"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
          />
        )}

        {/* Origin and destination markers */}
        {origin && (
          <CircleMarker
            center={Array.isArray(origin) ? origin : [origin.lat, origin.lng]}
            radius={8}
            fillColor="#52c41a"
            color="#52c41a"
            weight={2}
            opacity={1}
            fillOpacity={0.8}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: '#52c41a' }}>🚀</div>
                <div>Starting Point</div>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {destination && (
          <CircleMarker
            center={Array.isArray(destination) ? destination : [destination.lat, destination.lng]}
            radius={8}
            fillColor="#f5222d"
            color="#f5222d"
            weight={2}
            opacity={1}
            fillOpacity={0.8}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: '#f5222d' }}>🎯</div>
                <div>Destination</div>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {/* Custom zoom control */}
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Map legend */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Map Legend</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#f5222d',
            marginRight: '6px'
          }}></div>
          <span>Main Destination</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#fa8c16',
            marginRight: '6px'
          }}></div>
          <span>Itinerary Places</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#1890ff',
            marginRight: '6px'
          }}></div>
          <span>Attractions</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#52c41a',
            marginRight: '6px'
          }}></div>
          <span>Restaurants</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#722ed1',
            marginRight: '6px'
          }}></div>
          <span>Hotels</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#fa8c16',
            marginRight: '6px'
          }}></div>
          <span>Itinerary Routes</span>
        </div>
      </div>

      {/* Itinerary routes information */}
      {itineraryRoutes.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Itinerary Routes</div>
          {itineraryRoutes.map((routeData, index) => (
            <div key={index} style={{ marginBottom: '8px', fontSize: '12px' }}>
              <div style={{ fontWeight: 'bold', color: '#fa8c16' }}>
                {routeData.from} → {routeData.to}
              </div>
              <div>Distance: {formatDistance(routeData.route.distance)}</div>
              <div>Duration: {formatDuration(routeData.route.duration)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Route information */}
      {route && (
        <div style={{
          position: 'absolute',
          bottom: itineraryRoutes.length > 0 ? '220px' : '10px',
          left: '10px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Route Info</div>
          <div style={{ fontSize: '12px' }}>
            <div>Distance: {formatDistance(route.distance)}</div>
            <div>Duration: {formatDuration(route.duration)}</div>
            <div>Profile: {routeProfile}</div>
          </div>
        </div>
      )}

      {/* Selected location info */}
      {selectedLocation && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '250px',
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#1890ff' }}>
                {selectedLocation.name}
              </h4>
              {selectedLocation.address && (
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                  {selectedLocation.address}
                </p>
              )}
              <div style={{ marginTop: '8px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 6px',
                  backgroundColor: '#1890ff',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '11px'
                }}>
                  {selectedLocation.category}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#999',
                padding: '0',
                marginLeft: '8px'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent; 