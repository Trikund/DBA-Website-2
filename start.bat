@echo off
echo Starting Digital Byte Academy Full-Stack LMS...
echo ===============================================

echo [1/2] Starting Backend Server on port 5000...
cd backend
start cmd /k "npm start"
cd ..

echo [2/2] Starting Frontend React App on port 5173...
cd frontend
start cmd /k "npm run dev"
cd ..

echo ===============================================
echo Both servers are starting in separate windows.
echo Opening your Landing Page in the browser...
start landing_page\index.html

echo Done! When you click "Sign In", it will take you to the new Dashboards.
pause
