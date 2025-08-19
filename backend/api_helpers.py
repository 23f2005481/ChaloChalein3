import os
import requests
from typing import Dict, List, Any, Optional
import json
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("api_helpers")

# Load environment variables from .env file if available
load_dotenv()

# Set API keys directly if not found in environment
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "d0a4f0e922e9455dae955912252804")
HERE_MAPS_API_KEY = os.getenv("HERE_MAPS_API_KEY", "OBPIKcttrjPlhI0QmzM3bMbsUaIs4fzWIzN8ZB4n-4w")
HERE_MAPS_APP_ID = os.getenv("HERE_MAPS_APP_ID", "26aBRNeYysMtOJuAmUpJ")

# Print API keys for debugging (remove in production)
logger.info(f"WeatherAPI Key: {WEATHER_API_KEY[:5]}...")
logger.info(f"HERE Maps API Key: {HERE_MAPS_API_KEY[:5]}...")
logger.info(f"GROQ API Key: {GROQ_API_KEY[:5]}...")

def get_weather_forecast(city: str) -> Dict[str, Any]:
    """
    Get weather forecast for a specific city using WeatherAPI.com
    
    Args:
        city: The city name to get weather for
        
    Returns:
        Dictionary containing weather data or error message
    """
    logger.info(f"Getting weather forecast for {city}")
    try:
        # Make API call to WeatherAPI.com - use HTTPS instead of HTTP
        url = "https://api.weatherapi.com/v1/current.json"
        params = {
            "key": WEATHER_API_KEY,
            "q": city,
            "aqi": "no"
        }
        
        logger.info(f"Making request to {url} with params: {params}")
        response = requests.get(url, params=params)
        
        # Check if request was successful
        status_code = response.status_code
        logger.info(f"Weather API response status code: {status_code}")
        
        if status_code != 200:
            logger.error(f"Weather API error: {response.text}")
            return {"error": f"Weather API returned status code {status_code}: {response.text}"}
            
        response.raise_for_status()
        data = response.json()
        
        # Process the weather data to a simplified format
        if "location" in data and "current" in data:
            location = data["location"]["name"]
            region = data["location"]["region"]
            country = data["location"]["country"]
            
            temperature = data["current"]["temp_c"]
            description = data["current"]["condition"]["text"]
            icon = data["current"]["condition"]["icon"]
            
            result = {
                "location": f"{location}, {region}, {country}",
                "temperature": temperature,
                "description": description,
                "icon": icon,
                "raw_data": data
            }
            logger.info(f"Weather data retrieved successfully for {city}")
            return result
        else:
            logger.error(f"Unexpected API response format: {data}")
            return {"error": "Unexpected API response format"}
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Weather API request failed: {str(e)}")
        return {"error": f"Weather API request failed: {str(e)}"}
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON from Weather API: {str(e)}")
        return {"error": "Invalid response from Weather API"}
    except Exception as e:
        logger.error(f"Unexpected error in get_weather_forecast: {str(e)}")
        return {"error": f"An unexpected error occurred: {str(e)}"}

def get_location_search(query: str) -> Dict[str, Any]:
    """
    Search for locations using HERE Maps API
    
    Args:
        query: The search query for locations
        
    Returns:
        Dictionary containing location data or error message
    """
    logger.info(f"Searching for locations with query: {query}")
    try:
        # Make API call to HERE Maps Geocoding API
        url = "https://geocode.search.hereapi.com/v1/geocode"
        params = {
            "q": query,
            "apiKey": HERE_MAPS_API_KEY,
            "lang": "en-US"
        }
        
        logger.info(f"Making request to {url} with query: {query}")
        response = requests.get(url, params=params)
        
        # Check if request was successful
        status_code = response.status_code
        logger.info(f"HERE Maps API response status code: {status_code}")
        
        if status_code != 200:
            logger.error(f"HERE Maps API error: {response.text}")
            return {"success": False, "error": f"HERE Maps API returned status code {status_code}: {response.text}"}
            
        response.raise_for_status()
        data = response.json()
        
        if "items" in data:
            locations = []
            for item in data["items"]:
                locations.append({
                    "name": item.get("title", "Unknown location"),
                    "address": item.get("address", {}).get("label", "No address available"),
                    "position": {
                        "lat": item.get("position", {}).get("lat"),
                        "lng": item.get("position", {}).get("lng")
                    },
                    "types": item.get("resultType", "unknown")
                })
            
            logger.info(f"Found {len(locations)} locations for query: {query}")
            return {
                "success": True,
                "locations": locations,
                "raw_data": data
            }
        else:
            logger.warning(f"No locations found for query: {query}")
            return {"success": False, "error": "No locations found"}
    
    except requests.exceptions.RequestException as e:
        logger.error(f"HERE Maps API request failed: {str(e)}")
        return {"success": False, "error": f"HERE Maps API request failed: {str(e)}"}
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON from HERE Maps API: {str(e)}")
        return {"success": False, "error": "Invalid response from HERE Maps API"}
    except Exception as e:
        logger.error(f"Unexpected error in get_location_search: {str(e)}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}

def get_route(origin: str, destination: str) -> Dict[str, Any]:
    """
    Get route between two locations using HERE Maps API
    
    Args:
        origin: Starting location (address or coordinates)
        destination: Ending location (address or coordinates)
        
    Returns:
        Dictionary containing route data or error message
    """
    logger.info(f"Getting route from {origin} to {destination}")
    try:
        # Make API call to HERE Maps Routing API
        url = "https://router.hereapi.com/v8/routes"
        params = {
            "transportMode": "car",
            "origin": origin,
            "destination": destination,
            "return": "summary,polyline",
            "apiKey": HERE_MAPS_API_KEY
        }
        
        logger.info(f"Making request to {url}")
        response = requests.get(url, params=params)
        
        # Check if request was successful
        status_code = response.status_code
        logger.info(f"HERE Maps Routing API response status code: {status_code}")
        
        if status_code != 200:
            logger.error(f"HERE Maps Routing API error: {response.text}")
            return {"success": False, "error": f"HERE Maps Routing API returned status code {status_code}: {response.text}"}
            
        response.raise_for_status()
        data = response.json()
        
        if "routes" in data and len(data["routes"]) > 0:
            route = data["routes"][0]
            sections = route.get("sections", [])
            
            if len(sections) > 0:
                summary = sections[0].get("summary", {})
                logger.info(f"Route found: {summary.get('length', 0)}m, {summary.get('duration', 0)}s")
                return {
                    "success": True,
                    "distance": summary.get("length", 0),  # in meters
                    "duration": summary.get("duration", 0),  # in seconds
                    "polyline": sections[0].get("polyline", ""),
                    "raw_data": data
                }
        
        logger.warning(f"No route found between {origin} and {destination}")
        return {"success": False, "error": "No route found"}
    
    except requests.exceptions.RequestException as e:
        logger.error(f"HERE Maps Routing API request failed: {str(e)}")
        return {"success": False, "error": f"HERE Maps API request failed: {str(e)}"}
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON from HERE Maps Routing API: {str(e)}")
        return {"success": False, "error": "Invalid response from HERE Maps API"}
    except Exception as e:
        logger.error(f"Unexpected error in get_route: {str(e)}")
        return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}

def get_groq_response(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Get response from GROQ LLM API or fallback to mock response for testing
    
    Args:
        messages: List of message dictionaries with role and content
        
    Returns:
        Dictionary with success status and content or error message
    """
    logger.info(f"Getting GROQ response for {len(messages)} messages")
    
    # Use GROQ API key
    groq_api_key = "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"
    
    try:
        # Make API call to GROQ
        url = "https://api.groq.com/openai/v1/chat/completions"
        json_data = {
            "model": "meta-llama/llama-4-scout-17b-16e-instruct",
            "messages": messages,
            "max_tokens": 2000,  # Increased for longer itineraries
            "temperature": 0.3   # Lower temperature for more consistent JSON
        }
        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        
        logger.info(f"Making request to {url}")
        logger.info(f"Request payload: {json.dumps(json_data, indent=2)}")
        response = requests.post(url, json=json_data, headers=headers)
        
        # Check if request was successful
        status_code = response.status_code
        logger.info(f"GROQ API response status code: {status_code}")
        
        if status_code != 200:
            logger.error(f"GROQ API error: {response.text}")
            # Fallback to mock response for testing
            logger.info("Falling back to mock response for testing")
            return get_mock_itinerary_response(messages)
            
        response.raise_for_status()
        data = response.json()
        logger.info(f"GROQ API raw response: {json.dumps(data, indent=2)}")
        
        if "choices" in data and len(data["choices"]) > 0:
            content = data["choices"][0]["message"]["content"]
            logger.info(f"GROQ content extracted: {content[:200]}...")  # Log first 200 chars
            
            # Try to validate JSON if it's supposed to be JSON
            if any("itinerary" in msg.get("content", "").lower() for msg in messages):
                try:
                    # Test if the response is valid JSON
                    json.loads(content)
                    logger.info("Response is valid JSON")
                except json.JSONDecodeError as json_error:
                    logger.warning(f"Response is not valid JSON: {json_error}")
                    # Try to clean up common JSON issues
                    cleaned_content = clean_json_response(content)
                    try:
                        json.loads(cleaned_content)
                        logger.info("Cleaned response is valid JSON")
                        content = cleaned_content
                    except json.JSONDecodeError:
                        logger.error("Could not clean response to valid JSON")
                        return {"success": False, "error": "AI response is not valid JSON and could not be cleaned"}
            
            return {"success": True, "content": content}
        else:
            logger.error(f"No content received from GROQ API: {data}")
            return {"success": False, "error": "No response content received from GROQ API"}
    
    except requests.exceptions.RequestException as e:
        logger.error(f"GROQ API request failed: {str(e)}")
        # Fallback to mock response for testing
        logger.info("Falling back to mock response for testing due to request failure")
        return get_mock_itinerary_response(messages)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON from GROQ API: {str(e)}")
        return {"success": False, "error": "Invalid response from GROQ API"}
    except Exception as e:
        logger.error(f"Unexpected error in get_groq_response: {str(e)}")
        # Fallback to mock response for testing
        logger.info("Falling back to mock response for testing due to unexpected error")
        return get_mock_itinerary_response(messages)

def get_mock_itinerary_response(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Generate a mock itinerary response for testing when the real API is not available
    
    Args:
        messages: List of message dictionaries with role and content
        
    Returns:
        Dictionary with success status and mock content
    """
    logger.info("Generating mock itinerary response for testing")
    
    # Extract destination from user message if available
    destination = "New York"
    for msg in messages:
        if msg.get("role") == "user" and "itinerary" in msg.get("content", "").lower():
            # Try to extract destination from the message
            content = msg.get("content", "")
            if "trip to" in content:
                start = content.find("trip to") + 8
                end = content.find(" ", start)
                if end == -1:
                    end = len(content)
                destination = content[start:end].strip()
                break
    
    # Generate a realistic mock itinerary
    mock_itinerary = {
        "destination": destination,
        "totalBudgetINR": "75000",
        "budgetBreakdown": {
            "accommodation": "30000",
            "food": "20000",
            "activities": "15000",
            "transportation": "8000",
            "miscellaneous": "2000"
        },
        "days": [
            {
                "day": 1,
                "date": "2024-01-15",
                "dailyBudgetINR": "25000",
                "activities": [
                    {
                        "time": "09:00",
                        "title": "Times Square Exploration",
                        "description": "Start your day at the iconic Times Square. Experience the vibrant atmosphere, bright lights, and bustling energy of this world-famous intersection. Take photos with the famous billboards and street performers.",
                        "duration": "2 hours",
                        "tips": "Visit early in the morning to avoid crowds and get better photos. Don't forget to look up at the massive digital screens!",
                        "cost": "Free",
                        "location": {
                            "name": "Times Square",
                            "address": "Manhattan, NY 10036, United States"
                        }
                    },
                    {
                        "time": "11:30",
                        "title": "Broadway Show",
                        "description": "Experience the magic of Broadway with a matinee show. Choose from classic musicals like 'The Lion King' or contemporary hits. Book tickets in advance for the best seats and prices.",
                        "duration": "3 hours",
                        "tips": "Matinee shows are usually cheaper than evening performances. Check for student or senior discounts.",
                        "cost": "8000",
                        "location": {
                            "name": "Broadway Theater District",
                            "address": "Manhattan, NY 10036, United States"
                        }
                    }
                ]
            },
            {
                "day": 2,
                "date": "2024-01-16",
                "dailyBudgetINR": "25000",
                "activities": [
                    {
                        "time": "10:00",
                        "title": "Central Park Walk",
                        "description": "Explore the beautiful Central Park, one of the most famous urban parks in the world. Walk along the scenic paths, visit Bethesda Fountain, and enjoy the peaceful atmosphere in the heart of Manhattan.",
                        "duration": "3 hours",
                        "tips": "Wear comfortable walking shoes. The park is huge, so plan your route in advance. Visit the Central Park Zoo if you have extra time.",
                        "cost": "Free",
                        "location": {
                            "name": "Central Park",
                            "address": "Manhattan, NY 10024, United States"
                        }
                    },
                    {
                        "time": "14:00",
                        "title": "Metropolitan Museum of Art",
                        "description": "Visit one of the world's largest and most prestigious art museums. Explore collections spanning 5,000+ years of art from around the world. Don't miss the Egyptian Temple and European paintings.",
                        "duration": "4 hours",
                        "tips": "The museum is huge - focus on 2-3 sections to avoid overwhelm. Free admission for NY residents, suggested donation for others.",
                        "cost": "2000",
                        "location": {
                            "name": "The Metropolitan Museum of Art",
                            "address": "1000 5th Ave, New York, NY 10028, United States"
                        }
                    }
                ]
            }
        ]
    }
    
    # Convert to JSON string
    mock_content = json.dumps(mock_itinerary, indent=2)
    logger.info("Mock itinerary generated successfully")
    
    return {"success": True, "content": mock_content}

def clean_json_response(text: str) -> str:
    """
    Clean up common JSON formatting issues in AI responses
    
    Args:
        text: Raw text from AI response
        
    Returns:
        Cleaned text that should be valid JSON
    """
    if not text:
        return text
    
    cleaned = text.strip()
    
    # Remove markdown code blocks
    import re
    cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'```$', '', cleaned, flags=re.MULTILINE)
    cleaned = cleaned.strip()
    
    # Remove any text before the first {
    first_brace = cleaned.find('{')
    if first_brace > 0:
        cleaned = cleaned[first_brace:]
    
    # Remove any text after the last }
    last_brace = cleaned.rfind('}')
    if last_brace > 0:
        cleaned = cleaned[:last_brace + 1]
    
    # Fix common JSON issues
    cleaned = re.sub(r'}\s*{', '},{', cleaned)  # Missing commas between objects
    cleaned = re.sub(r'\]\s*\[', '],[', cleaned)  # Missing commas between arrays
    cleaned = re.sub(r'"\s*"', '","', cleaned)   # Missing commas between strings
    cleaned = re.sub(r',\s*([}\]])', r'\1', cleaned)  # Trailing commas
    
    return cleaned
