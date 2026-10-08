@echo off
echo ========================================
echo   HearAid Community - Starting...
echo ========================================
echo.

echo Checking MongoDB...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo WARNING: MongoDB service is not running!
    echo Please start MongoDB first.
    echo.
    pause
    exit
)

echo MongoDB is running ✓
echo.

echo Starting Backend Server...
start "HearAid Backend" cmd /k "cd server && npm start"
timeout /t 3 >nul

echo Starting Frontend...
start "HearAid Frontend" cmd /k "cd client && npm start"

echo.
echo ========================================
echo   Both servers are starting...
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
