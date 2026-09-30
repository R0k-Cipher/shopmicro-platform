@echo off
chcp 65001 >nul
title ShopMicro Platform - Démarrage

echo.
echo ========================================
echo    🏪 SHOPMICRO PLATFORM - WINDOWS
echo ========================================
echo.

echo Vérification des prérequis...

:: Vérifier Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker n'est pas installé!
    echo 📥 Téléchargez Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

:: Vérifier Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé!
    echo 📥 Téléchargez Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo ✅ Prérequis vérifiés!
echo.

echo 🐳 Démarrage des services avec Docker Compose...
docker-compose down
docker-compose up -d

echo.
echo ⏳ Attente du démarrage des services...
timeout /t 10 /nobreak >nul

echo.
echo 📊 Vérification du statut des services...
docker-compose ps

echo.
echo 🌐 Plateforme démarrée avec succès!
echo.
echo 📍 URLs d'accès:
echo    API Gateway: http://localhost:8080
echo    Health Check: http://localhost:8080/health
echo.
echo 🧪 Pour tester: scripts\test-scenario.bat
echo.
echo Appuyez sur une touche pour ouvrir la documentation...
pause >nul

start http://localhost:8080/health
