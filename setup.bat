@echo off
echo ================================
echo VALUE RIDE with Spark Web UI
echo ================================
echo.

echo Checking for required files...
if exist "index.html" (
    echo ✓ index.html found
) else (
    echo ✗ index.html not found!
    pause
    exit /b 1
)

if exist "spark_app.py" (
    echo ✓ spark_app.py found
) else (
    echo ✗ spark_app.py not found!
    pause
    exit /b 1
)

if exist "used_car_dataset_cleaned.csv" (
    echo ✓ CSV dataset found
) else (
    echo ✗ CSV dataset not found!
    pause
    exit /b 1
)

echo.
echo All files are present!
echo.
echo ================================
echo Setup Options:
echo ================================
echo 1. Full Setup (Spark Backend + Website)
echo 2. Website Only (Static Files)
echo 3. Install Python Dependencies
echo 4. Check Prerequisites
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo ============= FULL SETUP =============
    echo Starting VALUE RIDE with Spark integration...
    echo.
    echo This will start:
    echo 1. Spark Backend API (port 5000)
    echo 2. Spark Web UI (port 4040)
    echo 3. Website Server (port 8000)
    echo.
    echo Press Ctrl+C in any terminal to stop that service
    echo.
    
    echo Starting Spark Backend...
    start "VALUE RIDE Spark Backend" cmd /k "python spark_app.py"
    
    timeout /t 3 /nobreak > nul
    
    echo Starting Website Server...
    start "VALUE RIDE Website" cmd /k "python -m http.server 8000"
    
    echo.
    echo ================================
    echo 🎉 VALUE RIDE is now running!
    echo ================================
    echo 🔥 Spark Web UI: http://localhost:4040
    echo 🌐 API Server: http://localhost:5000
    echo 📊 Website: http://localhost:8000
    echo ================================
    echo.
    echo Opening website in browser...
    timeout /t 2 /nobreak > nul
    start http://localhost:8000
    
) else if "%choice%"=="2" (
    echo Starting Website Only (No Spark)...
    echo Website will be available at: http://localhost:8000
    echo.
    start "VALUE RIDE Website" cmd /k "python -m http.server 8000"
    timeout /t 2 /nobreak > nul
    start http://localhost:8000
    
) else if "%choice%"=="3" (
    echo Installing Python dependencies...
    echo.
    pip install -r requirements.txt
    echo.
    echo Dependencies installed! You can now run option 1.
    pause
    
) else if "%choice%"=="4" (
    echo ================================
    echo Checking Prerequisites...
    echo ================================
    
    python --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Python not found! Please install Python 3.7+
    ) else (
        echo ✅ Python found
        python --version
    )
    
    echo.
    pip --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ pip not found! Please install pip
    ) else (
        echo ✅ pip found
    )
    
    echo.
    echo Checking Java (required for Spark)...
    java -version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Java not found! Please install Java 8 or 11 for Spark
        echo Download from: https://adoptium.net/
    ) else (
        echo ✅ Java found
        java -version
    )
    
    echo.
    echo ================================
    echo Prerequisites Check Complete
    echo ================================
    echo.
    echo To install Python dependencies, run option 3
    echo To start the full application, run option 1
    pause
    
) else if "%choice%"=="5" (
    echo Goodbye!
) else (
    echo Invalid choice! Please run the script again.
)

pause
