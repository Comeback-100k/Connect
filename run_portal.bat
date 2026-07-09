@echo off
title Connect Portal Launcher
echo =======================================================================
echo              CONNECT COLLABORATION PORTAL LAUNCHER
echo =======================================================================
echo.

:: Set paths to the portable JDK and Node environments
set "JAVA_HOME=%~dp0tools\jdk-21.0.11+10"
set "NODE_PATH=%~dp0tools\node-v22.12.0-win-x64"
set "PATH=%JAVA_HOME%\bin;%NODE_PATH%;%PATH%"

echo Checking environment configurations...
java -version
echo.
node -v
echo.

:: Extract non-loopback local LAN IP Address using PowerShell
for /f "usebackq tokens=*" %%i in (`powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.InterfaceAlias -notlike '*Loopback*' } | Select-Object -ExpandProperty IPAddress | Select-Object -First 1"`) do set "LOCAL_IP=%%i"

if "%LOCAL_IP%"=="" (
    set "LOCAL_IP=localhost"
    echo [WARNING] Could not determine local LAN IP address. 
    echo Mobile connection will require manually replacing 'localhost' with your computer's IP address.
) else (
    echo [INFO] Detected Local LAN IP: %LOCAL_IP%
    echo To access this portal from your mobile phone:
    echo 1. Ensure your phone is connected to the same Wi-Fi network.
    echo 2. Open this address on your mobile browser: http://%LOCAL_IP%:5173
)
echo.

:: 1. Launch Spring Boot API Backend
echo Launching Spring Boot backend API on port 8080...
if exist "backend\target\connect-0.0.1-SNAPSHOT.jar" (
    echo [INFO] Running pre-compiled JAR for maximum speed...
    start "Connect Backend API" cmd /k "java -Xmx512m -jar backend\target\connect-0.0.1-SNAPSHOT.jar"
) else (
    echo [INFO] JAR not found, compiling and running via Maven...
    start "Connect Backend API" cmd /k "backend\mvnw.cmd spring-boot:run -Dspring-boot.run.jvmArguments=\"-Xmx512m\" -f backend/pom.xml"
)

:: 2. Launch React Vite Frontend (Exposed to network host)
echo Launching React frontend client on port 5173...
start "Connect React Client" cmd /k "cd frontend && npm run dev -- --host --port 5173"

echo.
echo Waiting 3 seconds for Tomcat and Vite servers to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Opening Connect in your web browser...
start http://localhost:5173/

echo.
echo Done! Keep the server command windows open while using the portal.
echo Press any key to exit this launcher...
pause >nul
