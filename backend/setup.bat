@echo off
echo Setting up ChaloChalein backend API server...

echo.
echo Installing required dependencies...
pip install -r requirements.txt

echo.
echo Starting the API server...
start python server.py

echo.
echo Server started! Access the test page at:
echo http://localhost:5000
echo.
echo Opening test page in browser...
timeout /t 2 > nul
start test-frontend.html

echo.
echo API integration JavaScript file is available at:
echo api-integration.js
echo.
echo Copy this file to your frontend project and import the functions to connect to the backend.
echo.
echo Press any key to close this window...
pause > nul 