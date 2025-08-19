from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import logging
from api_helpers import get_weather_forecast, get_groq_response, get_location_search, get_route

from fastapi import APIRouter

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("backend")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Only allow your frontend origin
    allow_credentials=True,                   # This must be True!
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],  # Expose all headers to the client
    max_age=3600  # Cache preflight response for 1 hour
)

api_router = APIRouter(prefix="/api")

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code} for {request.method} {request.url}")
    return response

class HelpRequest(BaseModel):
    message: str
    conversation_history: Optional[list] = []
    context: Optional[Dict[str, Any]] = None

@api_router.post("/chatbot/help")
async def get_help(request: HelpRequest):
    try:
        # Create a system message
        system_message = "You are a helpful travel assistant that provides information about destinations, travel tips, and recommendations."
        
        # Format the messages for the API
        messages = [
            {"role": "system", "content": system_message}
        ]
        
        # Add conversation history
        if request.conversation_history:
            messages.extend(request.conversation_history)
            
        # Add the current message
        messages.append({"role": "user", "content": request.message})
        
        # Get response from the API helper function
        response = get_groq_response(messages)
        
        if response.get("success"):
            return {"response": response.get("content")}
        else:
            logger.error(f"GROQ API error: {response.get('error')}")
            return {"error": response.get("error", "Failed to get response")}
    except Exception as e:
        logger.error(f"Exception in /api/chatbot/help: {str(e)}")
        return {"error": str(e)}

@api_router.get("/weather")
async def get_weather(city: str = Query(..., description="The city name to fetch weather for")):
    try:
        weather_data = get_weather_forecast(city)
        if "error" in weather_data:
            raise HTTPException(status_code=400, detail=weather_data["error"])
        return weather_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/locations/search")
async def search_locations(query: str = Query(..., description="The search query for locations")):
    try:
        location_data = get_location_search(query)
        if not location_data.get("success", False):
            raise HTTPException(status_code=400, detail=location_data.get("error", "Failed to search locations"))
        return location_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/route")
async def find_route(
    origin: str = Query(..., description="Starting location (address or coordinates)"),
    destination: str = Query(..., description="Ending location (address or coordinates)")
):
    try:
        route_data = get_route(origin, destination)
        if not route_data.get("success", False):
            raise HTTPException(status_code=400, detail=route_data.get("error", "Failed to find route"))
        return route_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/chat/completions")
async def chat_completions(request: Request):
    try:
        body = await request.json()
        messages = body.get("messages", [])
        if not messages:
            return {"success": False, "error": "No messages provided"}

        # Add a more specific system message for itinerary generation
        if any("itinerary" in msg.get("content", "").lower() for msg in messages):
            # Add a system message specifically for itinerary generation
            system_message = {
                "role": "system",
                "content": """You are a travel itinerary generator. When generating itineraries, you MUST:
1. Return ONLY valid JSON with no additional text, explanations, or markdown formatting
2. Do NOT wrap the JSON in code blocks (```json or ```)
3. Ensure all JSON syntax is correct - proper quotes, commas, brackets
4. Validate that your response can be parsed by JSON.parse()
5. Use double quotes for all strings and property names
6. Ensure all arrays and objects are properly closed
7. Do not include trailing commas
8. If you cannot generate valid JSON, return a simple error message instead"""
            }
            
            # Insert the system message at the beginning
            messages.insert(0, system_message)

        response = get_groq_response(messages)  # Function name kept for compatibility
        if response.get("success"):
            return {"success": True, "content": response.get("content")}
        else:
            return {"success": False, "error": response.get("error", "Failed to get response")}
    except Exception as e:
        logger.error(f"Error in chat completions: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

@api_router.post("/test-groq")
async def test_groq():
    """Test endpoint to verify GROQ API is working"""
    try:
        test_messages = [
            {
                "role": "system",
                "content": "You are a test assistant. Return a simple JSON response: {\"test\": \"success\"}"
            },
            {
                "role": "user", 
                "content": "Generate a simple test response"
            }
        ]
        
        response = get_groq_response(test_messages)
        logger.info(f"Test GROQ response: {response}")
        return response
    except Exception as e:
        logger.error(f"Test GROQ failed: {str(e)}")
        return {"success": False, "error": str(e)}

app.include_router(api_router)

from fastapi.responses import Response
from fastapi import Request

class HelpRequest(BaseModel):
    message: str
    conversation_history: Optional[list] = []
    context: Optional[Dict[str, Any]] = None

import logging

logger = logging.getLogger("backend")

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code} for {request.method} {request.url}")
    return response

@app.post("/api/chatbot/help")
async def get_help(request: HelpRequest):
    try:
        # Create a system message
        system_message = "You are a helpful travel assistant that provides information about destinations, travel tips, and recommendations."
        
        # Format the messages for the API
        messages = [
            {"role": "system", "content": system_message}
        ]
        
        # Add conversation history
        if request.conversation_history:
            messages.extend(request.conversation_history)
            
        # Add the current message
        messages.append({"role": "user", "content": request.message})
        
        # Get response from the API helper function
        response = get_groq_response(messages)
        
        if response.get("success"):
            return {"response": response.get("content")}
        else:
            logger.error(f"GROQ API error: {response.get('error')}")
            return {"error": response.get("error", "Failed to get response")}
    except Exception as e:
        logger.error(f"Exception in /api/chatbot/help: {str(e)}")
        return {"error": str(e)}

@app.get("/api/weather")
async def get_weather(city: str = Query(..., description="The city name to fetch weather for")):
    try:
        weather_data = get_weather_forecast(city)
        if "error" in weather_data:
            raise HTTPException(status_code=400, detail=weather_data["error"])
        return weather_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/locations/search")
async def search_locations(query: str = Query(..., description="The search query for locations")):
    try:
        location_data = get_location_search(query)
        if not location_data.get("success", False):
            raise HTTPException(status_code=400, detail=location_data.get("error", "Failed to search locations"))
        return location_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/route")
async def find_route(
    origin: str = Query(..., description="Starting location (address or coordinates)"),
    destination: str = Query(..., description="Ending location (address or coordinates)")
):
    try:
        route_data = get_route(origin, destination)
        if not route_data.get("success", False):
            raise HTTPException(status_code=400, detail=route_data.get("error", "Failed to find route"))
        return route_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/completions")
async def chat_completions(request: Request):
    try:
        body = await request.json()
        messages = body.get("messages", [])
        if not messages:
            return {"success": False, "error": "No messages provided"}

        # Add a more specific system message for itinerary generation
        if any("itinerary" in msg.get("content", "").lower() for msg in messages):
            # Add a system message specifically for itinerary generation
            system_message = {
                "role": "system",
                "content": """You are a travel itinerary generator. When generating itineraries, you MUST:
1. Return ONLY valid JSON with no additional text, explanations, or markdown formatting
2. Do NOT wrap the JSON in code blocks (```json or ```)
3. Ensure all JSON syntax is correct - proper quotes, commas, brackets
4. Validate that your response can be parsed by JSON.parse()
5. Use double quotes for all strings and property names
6. Ensure all arrays and objects are properly closed
7. Do not include trailing commas
8. If you cannot generate valid JSON, return a simple error message instead"""
            }
            
            # Insert the system message at the beginning
            messages.insert(0, system_message)

        response = get_groq_response(messages)  # Function name kept for compatibility
        if response.get("success"):
            return {"success": True, "content": response.get("content")}
        else:
            return {"success": False, "error": response.get("error", "Failed to get response")}
    except Exception as e:
        logger.error(f"Error in chat completions: {str(e)}")
        return {"success": False, "error": str(e)}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

from fastapi.responses import JSONResponse
from fastapi.requests import Request
from fastapi.exception_handlers import RequestValidationError
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import status

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error occurred."},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
