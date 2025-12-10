@echo off
echo ================================
echo VALUE RIDE - Current Links
echo ================================
echo.
echo 🌐 Website: http://localhost:8000
echo 🔥 Spark Web UI: http://localhost:4041
echo 🚀 API Server: http://localhost:5000
echo.
echo ================================
echo Services Status:
echo ================================

:: Check if services are running
netstat -an | find ":8000" >nul
if %errorlevel%==0 (
    echo ✅ Website Server: RUNNING
) else (
    echo ❌ Website Server: NOT RUNNING
)

netstat -an | find ":5000" >nul
if %errorlevel%==0 (
    echo ✅ API Server: RUNNING
) else (
    echo ❌ API Server: NOT RUNNING
)

netstat -an | find ":4041" >nul
if %errorlevel%==0 (
    echo ✅ Spark Web UI: RUNNING (Port 4041)
) else (
    netstat -an | find ":4040" >nul
    if %errorlevel%==0 (
        echo ✅ Spark Web UI: RUNNING (Port 4040)
    ) else (
        echo ❌ Spark Web UI: NOT RUNNING
    )
)

echo.
echo ================================
echo Quick Actions:
echo ================================
echo 1. Open Website
echo 2. Open Spark Web UI
echo 3. Open API Server
echo 4. Start All Services
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    start http://localhost:8000
) else if "%choice%"=="2" (
    start http://localhost:4041
    start http://localhost:4040
) else if "%choice%"=="3" (
    start http://localhost:5000
) else if "%choice%"=="4" (
    start launch_value_ride.bat
) else if "%choice%"=="5" (
    echo Goodbye!
) else (
    echo Invalid choice!
)

pause