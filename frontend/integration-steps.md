# API Integration Steps

Follow these steps to integrate the backend APIs into your frontend:

## HTML/Vanilla JavaScript Setup
If you're using plain HTML and JavaScript:

1. **Copy API files to your project**
   - The files `common.js` and `api-integration.js` have already been copied to `frontend/js/`
   - No need to reinstall dependencies

2. **Include the scripts in your HTML**
   ```html
   <script src="js/common.js"></script>
   ```

3. **Use the API functions**
   ```javascript
   // Check if the API server is running
   checkApiHealth().then(isUp => {
     console.log("API server is running:", isUp);
   });
   
   // Get weather for a city
   getWeather("London").then(data => {
     console.log("Weather data:", data);
   });
   
   // Search for locations
   searchLocations("Berlin").then(data => {
     console.log("Location results:", data);
   });
   
   // Get a route between coordinates
   getRoute("52.52001,13.40495", "48.13743,11.57549").then(data => {
     console.log("Route data:", data);
   });
   
   // Use the GROQ AI API
   const messages = [
     { role: "system", content: "You are a helpful assistant." },
     { role: "user", content: "Hello, how are you?" }
   ];
   getGroqResponse(messages).then(data => {
     console.log("AI response:", data.content);
   });
   ```

4. **Example page**
   - Check out `frontend/api-example.html` for a working example
   - You can open this file directly in your browser to test

## React/Modern Framework Setup
If you're using React or another modern framework:

1. **Import the API module**
   ```javascript
   import { 
     getWeather, 
     searchLocations, 
     getRoute, 
     getGroqResponse, 
     checkApiHealth 
   } from './js/api-integration';
   ```

2. **Use with React hooks**
   ```javascript
   const [weather, setWeather] = useState(null);
   
   useEffect(() => {
     async function fetchData() {
       const data = await getWeather("London");
       setWeather(data);
     }
     
     fetchData();
   }, []);
   ```

3. **Example React components**
   - Check out `frontend/ReactExample.jsx` for complete examples
   - These components show how to properly handle loading states, errors, and data display

## Server Requirements
For the APIs to work properly:

1. **Make sure the Flask server is running**
   - In a terminal, navigate to the backend directory 
   - Run `python server.py`
   - The server must be running for the API calls to work

2. **Check for CORS issues**
   - If you're having issues with CORS, make sure you're running your frontend on the same domain as the backend
   - Or use a CORS proxy
   - The backend is configured to allow all origins by default

## Troubleshooting

- **"API server is not responding"** - Make sure the Flask server is running
- **CORS errors** - Check your browser console and server logs
- **Invalid coordinates** - For routing, use the format "lat,lng" (e.g., "52.52001,13.40495")
- **API errors** - Check your network tab for detailed error messages

## Next Steps

1. **Customize the styling** to match your application
2. **Add error handling** for edge cases
3. **Extend functionality** as needed for your specific use case 