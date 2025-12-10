@echo off
echo ================================
echo VALUE RIDE - Full Setup
echo ================================
echo.
echo Starting VALUE RIDE with Spark Integration...
echo.
echo This will start:
echo 1. Spark Backend + API (port 5000)
echo 2. Spark Web UI (port 4040/4041)  
echo 3. Website Server (port 8000)
echo.

echo [1/3] Starting Spark Backend...
start "VALUE RIDE Spark Backend" cmd /k "cd /d %~dp0 && python spark_app.py"

echo [2/3] Waiting for Spark to initialize...
timeout /t 8 /nobreak > nul

echo [3/3] Starting Website Server...
start "VALUE RIDE Website" cmd /k "cd /d %~dp0 && python -m http.server 8000"

echo.
echo ================================
echo 🎉 VALUE RIDE is now starting!
echo ================================
echo.
echo Waiting for services to be ready...
timeout /t 3 /nobreak > nul

echo Services should now be available at:
echo 🔥 Spark Web UI: http://localhost:4041 (or 4040)
echo 🌐 API Server: http://localhost:5000  
echo 📊 Website: http://localhost:8000
echo.
echo Opening website in browser...
timeout /t 2 /nobreak > nul
start http://localhost:8000

echo.
echo ================================
echo Setup complete! 
echo Press Ctrl+C in any terminal window to stop that service.
echo Close this window when done.
echo ================================
pause
