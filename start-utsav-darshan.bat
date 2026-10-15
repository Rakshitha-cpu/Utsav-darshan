@echo off
echo ========================================================
echo   STARTING UTSAV DARSHAN FULL-STACK PLATFORM
echo ========================================================
echo.
echo [1/2] Starting Backend Server on http://localhost:5000...
start cmd /k "cd server && npm start"

echo [2/2] Starting Frontend Client on http://localhost:5173...
start cmd /k "cd client && npm run dev"

echo.
echo Both servers are starting! Open your browser at http://localhost:5173
echo ========================================================
pause
