# Backend API Server

This API server exposes several third-party APIs through a unified REST interface for the frontend.

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set up environment variables (optional - default keys are included in the code):
   Create a `.env` file with the following:
   ```
   WEATHER_API_KEY=your_weatherapi_key
   HERE_MAPS_API_KEY=your_here_maps_key
   GROQ_API_KEY=your_groq_api_key
   ```

3. Start the server:
   ```
   python server.py
   ```
   
   The server will run on http://localhost:5000

## API Endpoints

### 1. Weather API
- **URL**: `/api/weather`
- **Method**: GET
- **Query Params**: `city` (required)
- **Example**: `GET /api/weather?city=London`

### 2. Location Search API
- **URL**: `/api/location/search`
- **Method**: GET
- **Query Params**: `query` (required)
- **Example**: `GET /api/location/search?query=Eiffel%20Tower`

### 3. Routing API
- **URL**: `/api/route`
- **Method**: GET
- **Query Params**: 
  - `origin` (required): Coordinates in format "latitude,longitude"
  - `destination` (required): Coordinates in format "latitude,longitude"
- **Example**: `GET /api/route?origin=52.52001,13.40495&destination=48.13743,11.57549`

### 4. GROQ API
- **URL**: `/api/groq`
- **Method**: POST
- **Body**: JSON object with `messages` array
- **Example**:
  ```json
  {
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }
  ```

### 5. Health Check
- **URL**: `/api/health`
- **Method**: GET
- **Example**: `GET /api/health` 