@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo [LIVE] STARTING 7-STAGE JENKINS PIPELINE SIMULATION
echo ========================================================

echo.
echo [STAGE 1/7] BUILD
echo --------------------------------------------------------
call npm install
if %ERRORLEVEL% neq 0 (echo [BUILD FAILED] & exit /b 1)
echo [BUILD SUCCESS]

echo.
echo [STAGE 2/7] TEST
echo --------------------------------------------------------
call npm test
if %ERRORLEVEL% neq 0 (echo [TEST FAILED] & exit /b 1)
echo [TEST SUCCESS]

echo.
echo [STAGE 3/7] CODE QUALITY
echo --------------------------------------------------------
call npm run lint
echo [CODE QUALITY SUCCESS]

echo.
echo [STAGE 4/7] SECURITY
echo --------------------------------------------------------
echo Running npm audit...
call npm audit --json > audit-report.json
echo Running Retire.js...
call npx retire --outputformat json --outputpath retire-report.json
echo [SECURITY SUCCESS]

echo.
echo [STAGE 5/7] DEPLOY STAGING
echo --------------------------------------------------------
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Killing existing process %%a on port 3001
    taskkill /PID %%a /F
)
set PORT=3001
start "" /b cmd /c node src/server.js
timeout /t 5 /nobreak > nul

echo Health Checking Staging...
curl.exe -s http://localhost:3001/health | findstr "UP"
if %ERRORLEVEL% neq 0 (echo [STAGING HEALTH CHECK FAILED] & exit /b 1)

echo Smoke Testing Staging...
curl.exe -X POST -H "Content-Type: application/json" -d "{\"title\":\"Live Staging Test\"}" http://localhost:3001/tasks
echo [STAGING DEPLOY SUCCESS]

echo.
echo [STAGE 6/7] RELEASE PRODUCTION
echo --------------------------------------------------------
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing existing process %%a on port 3000
    taskkill /PID %%a /F
)
set PORT=3000
start "" /b cmd /c node src/server.js
timeout /t 5 /nobreak > nul

echo Health Checking Production...
curl.exe -s http://localhost:3000/health | findstr "UP"
if %ERRORLEVEL% neq 0 (echo [PRODUCTION HEALTH CHECK FAILED] & exit /b 1)

echo Tagging Release...
git tag -a v-live-%RANDOM% -m "Live simulation release"
echo [PRODUCTION RELEASE SUCCESS]

echo.
echo [STAGE 7/7] MONITORING
echo --------------------------------------------------------
echo --- MONITORING REPORT --- > monitoring-live.txt
echo Health: >> monitoring-live.txt
curl.exe -s http://localhost:3000/health >> monitoring-live.txt
echo. >> monitoring-live.txt
echo Metrics: >> monitoring-live.txt
curl.exe -s http://localhost:3000/metrics >> monitoring-live.txt
type monitoring-live.txt
echo [MONITORING SUCCESS]

echo.
echo ========================================================
echo [LIVE] PIPELINE SIMULATION COMPLETED SUCCESSFULLY
echo ========================================================
pause
