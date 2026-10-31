@echo off
start "PharmaCare API" /min cmd /c "set PORT=5000&& cd /d D:\Pharmacy-system-architecture-and-webapp-development\server && node dist\server.js"
timeout /t 3 /nobreak >nul
start "PharmaCare Web" /min cmd /c "set PORT=3000&& cd /d D:\Pharmacy-system-architecture-and-webapp-development\client && npm run start"
timeout /t 3 /nobreak >nul
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000
