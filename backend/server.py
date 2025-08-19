#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS
from api_helpers import (
    get_weather_forecast,
    get_location_search,
    get_route,
    get_groq_response
)
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("api_server")

app = Flask(__name__)
# Enable CORS for all origins with specific methods and headers
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept", "Authorization"],
        "supports_credentials": True
    }
})

@app.route('/api/weather', methods=['GET', 'OPTIONS'])
def weather():
    """Get weather for a city"""
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
        
    city = request.args.get('city')
    if not city:
        return jsonify({"error": "City parameter is required"}), 400
    
    try:
        result = get_weather_forecast(city)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Weather API error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/locations/search', methods=['GET', 'OPTIONS'])
def location_search():
    """Search for locations"""
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
        
    query = request.args.get('query')
    if not query:
        return jsonify({"success": False, "error": "Query parameter is required"}), 400
    
    try:
        result = get_location_search(query)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Location search error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/route', methods=['GET', 'OPTIONS'])
def route():
    """Get route between two points"""
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
        
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    
    if not origin or not destination:
        return jsonify({
            "success": False, 
            "error": "Both origin and destination parameters are required"
        }), 400
    
    try:
        result = get_route(origin, destination)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Route API error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/groq', methods=['POST', 'OPTIONS'])
def groq():
    """Get response from GROQ API"""
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
        
    data = request.get_json()
    if not data or 'messages' not in data:
        return jsonify({
            "success": False, 
            "error": "Request body must contain a 'messages' array"
        }), 400
    
    try:
        messages = data['messages']
        result = get_groq_response(messages)
        return jsonify(result)
    except Exception as e:
        logger.error(f"GROQ API error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/completions', methods=['POST', 'OPTIONS'])
def chat_completions():
    """Get AI chat completions"""
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
        
    data = request.get_json()
    if not data or 'messages' not in data:
        return jsonify({
            "success": False, 
            "error": "Request body must contain a 'messages' array"
        }), 400
    
    try:
        messages = data['messages']
        result = get_groq_response(messages)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Chat completions API error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health_check():
    """Health check endpoint"""
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    return jsonify({"status": "ok", "message": "API server is running"})

# Handle 404 errors
@app.errorhandler(404)
def not_found(error):
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    return jsonify({"error": "Not Found", "message": "The requested URL was not found on the server"}), 404

if __name__ == '__main__':
    logger.info("Starting API server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True) 