@echo off
setlocal enabledelayedexpansion
title Online Event Ticketing Platform - Setup and Runner
chcp 65001 >nul

:: Check if direct argument passed
if /i "%~1"=="1" goto DOCKER_RUN
if /i "%~1"=="docker" goto DOCKER_RUN
if /i "%~1"=="2" goto HYBRID_RUN
if /i "%~1"=="dev" goto HYBRID_RUN
if /i "%~1"=="hybrid" goto HYBRID_RUN
if /i "%~1"=="3" goto DB_SETUP
if /i "%~1"=="db" goto DB_SETUP
if /i "%~1"=="seed" goto DB_SETUP
if /i "%~1"=="4" goto RUN_TESTS
if /i "%~1"=="test" goto RUN_TESTS
if /i "%~1"=="tests" goto RUN_TESTS
if /i "%~1"=="5" goto STOP_SERVICES
if /i "%~1"=="stop" goto STOP_SERVICES
if /i "%~1"=="down" goto STOP_SERVICES
if /i "%~1"=="6" goto VIEW_DOCS
if /i "%~1"=="docs" goto VIEW_DOCS

:MENU
cls
echo ===============================================================================
echo     ONLINE EVENT TICKETING PLATFORM - SYSTEM SETUP ^& RUNNER
echo ===============================================================================
echo.
echo   [1] Full Docker Deployment (All Services + DB + Redis + Frontend) [Recommended]
echo   [2] Local Hybrid Mode (Postgres/Redis in Docker + Local Backend + Vite Frontend)
echo   [3] Database Setup (Prisma Push ^& Seed Demo Data)
echo   [4] Run Full Test Suite (Jest Concurrency, Multi-Device, Pricing ^& Events)
echo   [5] Stop All Running Docker Services
echo   [6] View Service Health ^& Swagger API Docs
echo   [0] Exit
echo.
echo ===============================================================================
set /p "CHOICE=Select an option [1-6, default=1]: "

if "%CHOICE%"=="" set CHOICE=1
if "%CHOICE%"=="1" goto DOCKER_RUN
if "%CHOICE%"=="2" goto HYBRID_RUN
if "%CHOICE%"=="3" goto DB_SETUP
if "%CHOICE%"=="4" goto RUN_TESTS
if "%CHOICE%"=="5" goto STOP_SERVICES
if "%CHOICE%"=="6" goto VIEW_DOCS
if "%CHOICE%"=="0" goto EXIT
goto MENU

:: ===============================================================================
:: Check System Prerequisites
:: ===============================================================================
:CHECK_PREREQS
echo [INFO] Checking environment prerequisites...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js 20+.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed or not in PATH.
    pause
    exit /b 1
)

where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Docker is not in PATH. Docker features will be unavailable.
)

if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env from .env.example...
        copy .env.example .env >nul
    )
)

if not exist "node_modules" (
    echo [INFO] Installing root dependencies...
    call npm install
)

if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    call npm install --prefix frontend
)

exit /b 0

:: ===============================================================================
:: Option 1: Full Docker Stack
:: ===============================================================================
:DOCKER_RUN
call :CHECK_PREREQS
echo.
echo ===============================================================================
echo [INFO] Building and starting all containers via Docker Compose...
echo ===============================================================================
echo.

docker compose down >nul 2>&1
docker compose up -d --build

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Full Docker Compose failed. Falling back to backend-only compose...
    docker compose -f docker-compose.backend.yml up -d --build
)

echo.
echo [INFO] Waiting for PostgreSQL and Redis to be healthy...
timeout /t 10 /nobreak >nul

echo [INFO] Syncing database schema...
call npx prisma db push --schema=./backend/prisma/schema.prisma --skip-generate

echo.
echo ===============================================================================
echo [SUCCESS] All services are online!
echo ===============================================================================
echo   - Frontend Web App:     http://localhost:3000
echo   - API Gateway:          http://localhost:8000
echo   - Swagger API Docs:     http://localhost:8000/docs
echo   - Health Check:         http://localhost:8000/api/health
echo.
echo   Demo Login Accounts:
echo     Audience:  user@example.com      / password123
echo     Organizer: organizer@example.com / password123
echo     Admin:     admin@example.com     / password123
echo ===============================================================================
echo.
if not "%~1"=="" exit /b 0
echo Press any key to open the application in your browser...
pause >nul
start http://localhost:3000
goto END

:: ===============================================================================
:: Option 2: Local Hybrid Mode
:: ===============================================================================
:HYBRID_RUN
call :CHECK_PREREQS
echo.
echo [INFO] Starting PostgreSQL and Redis containers...
docker compose -f docker-compose.backend.yml up -d postgres redis

echo [INFO] Waiting for database readiness...
timeout /t 6 /nobreak >nul

echo [INFO] Syncing schema and generating Prisma client...
call npx prisma db push --schema=./backend/prisma/schema.prisma
call npm run build

echo [INFO] Starting Gateway and Microservices in background...
start "Ticketing API Gateway" cmd /k "npm run start:gateway"
start "Ticketing Frontend (Vite)" cmd /k "npm run start:frontend"

timeout /t 5 /nobreak >nul
echo.
echo [SUCCESS] Local hybrid environment started!
echo Frontend: http://localhost:3000
echo API Gateway: http://localhost:8000
if not "%~1"=="" exit /b 0
start http://localhost:3000
goto END

:: ===============================================================================
:: Option 3: Database Setup & Seed
:: ===============================================================================
:DB_SETUP
call :CHECK_PREREQS
echo.
echo [INFO] Pushing Prisma schema to database...
call npx prisma db push --schema=./backend/prisma/schema.prisma

echo [INFO] Seeding database with demo users, events, and seats...
call npm run seed

echo.
echo [SUCCESS] Database setup and seed completed!
if not "%~1"=="" exit /b 0
pause
goto MENU

:: ===============================================================================
:: Option 4: Run Tests
:: ===============================================================================
:RUN_TESTS
call :CHECK_PREREQS
echo.
echo ===============================================================================
echo [INFO] Running Complete Automated Test Suite (Jest + Supertest)...
echo ===============================================================================
echo.
call npm test
echo.
if not "%~1"=="" exit /b 0
pause
goto MENU

:: ===============================================================================
:: Option 5: Stop Services
:: ===============================================================================
:STOP_SERVICES
echo.
echo [INFO] Stopping all containers...
docker compose down
docker compose -f docker-compose.backend.yml down
echo [SUCCESS] All containers stopped.
if not "%~1"=="" exit /b 0
pause
goto MENU

:: ===============================================================================
:: Option 6: View Docs
:: ===============================================================================
:VIEW_DOCS
echo [INFO] Opening Swagger API documentation...
start http://localhost:8000/docs
start http://localhost:8000/api/health
if not "%~1"=="" exit /b 0
goto MENU

:EXIT
echo Exiting...
exit /b 0

:END
echo.
echo Press any key to return to menu...
pause >nul
goto MENU
