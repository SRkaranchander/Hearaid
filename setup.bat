@echo off
echo Installing Backend Dependencies...
cd server
call npm install

echo.
echo Installing Frontend Dependencies...
cd ..\client
call npm install

echo.
echo Setup Complete!
echo.
echo To start the application:
echo 1. Start MongoDB (if not running)
echo 2. In one terminal: cd server && npm run seed && npm start
echo 3. In another terminal: cd client && npm start
echo.
pause
