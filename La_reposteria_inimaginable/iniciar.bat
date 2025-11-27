@echo off
title La Reposteria Inimaginable - Sistema Completo
color 0A
cls

echo ============================================
echo   LA REPOSTERIA DE LO INIMAGINABLE
echo   Sistema de Gestion Completo
echo ============================================
echo.

:: Ir al directorio del script
cd /d "%~dp0"

echo [PASO 1/4] Verificando Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js no esta instalado!
    echo Por favor instala Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
node --version
echo ✓ Node.js encontrado
echo.

echo [PASO 2/4] Instalando dependencias...
echo.

:: Instalar dependencias del servidor principal
echo   → Servidor Principal (Puerto 3000)...
if not exist node_modules (
    echo     Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Fallo instalacion del servidor principal
        pause
        exit /b 1
    )
) else (
    echo     Dependencias ya instaladas
)
echo   ✓ Servidor Principal: OK
echo.

:: Instalar dependencias de API Productos
echo   → API Productos (Puerto 3001)...
cd api_productos
if not exist node_modules (
    echo     Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Fallo instalacion de API Productos
        cd ..
        pause
        exit /b 1
    )
) else (
    echo     Dependencias ya instaladas
)
cd ..
echo   ✓ API Productos: OK
echo.

:: Instalar dependencias de API Carrito
echo   → API Carrito (Puerto 3002)...
cd api_carrito
if not exist node_modules (
    echo     Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Fallo instalacion de API Carrito
        cd ..
        pause
        exit /b 1
    )
) else (
    echo     Dependencias ya instaladas
)
cd ..
echo   ✓ API Carrito: OK
echo.
echo.

echo [PASO 3/4] Verificando archivos .env...
echo.

:: Verificar .env del servidor principal
if not exist .env (
    echo   ! Creando .env para Servidor Principal...
    copy .env.example .env >nul
    echo   ✓ Archivo .env creado
)

:: Verificar .env de API Productos
if not exist api_productos\.env (
    echo   ! Creando .env para API Productos...
    copy api_productos\.env.example api_productos\.env >nul
    echo   ✓ Archivo .env creado
)

:: Verificar .env de API Carrito
if not exist api_carrito\.env (
    echo   ! Creando .env para API Carrito...
    copy api_carrito\.env.example api_carrito\.env >nul
    echo   ✓ Archivo .env creado
)
echo.

echo [PASO 4/4] Iniciando servicios...
echo.
echo   Esto abrira 3 ventanas de terminal:
echo   1. Servidor Principal (Puerto 3000) - Frontend
echo   2. API Productos (Puerto 3001) - Gestion de productos
echo   3. API Carrito (Puerto 3002) - Carrito de compras
echo.

:: Iniciar API Carrito
echo   → Iniciando API Carrito (Puerto 3002)...
start "🛒 API CARRITO :3002" cmd /k "cd /d "%~dp0api_carrito" && echo Iniciando API Carrito... && npx nodemon server.js"
timeout /t 2 /nobreak >nul

:: Iniciar API Productos
echo   → Iniciando API Productos (Puerto 3001)...
start "📦 API PRODUCTOS :3001" cmd /k "cd /d "%~dp0api_productos" && echo Iniciando API Productos... && npx nodemon server.js"
timeout /t 2 /nobreak >nul

:: Iniciar Servidor Principal
echo   → Iniciando Servidor Principal (Puerto 3000)...
start "🏠 SERVIDOR PRINCIPAL :3000" cmd /k "cd /d "%~dp0" && echo Iniciando Servidor Principal... && npx nodemon server.js"
timeout /t 1 /nobreak >nul

echo.
echo ============================================
echo   ✓ SISTEMA INICIADO CORRECTAMENTE!
echo ============================================
echo.
echo   Servicios disponibles:
echo   ───────────────────────────────────────
echo   🏠 Frontend:      http://localhost:3000
echo   📦 API Productos: http://localhost:3001
echo   🛒 API Carrito:   http://localhost:3002
echo.
echo   IMPORTANTE:
echo   - Para DETENER todos los servicios:
echo     Cierra las 3 ventanas de CMD que se abrieron
echo.
echo   - Para iniciar servicios por separado:
echo     npm run start:principal
echo     npm run start:productos
echo     npm run start:carrito
echo.
echo ============================================
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul

:: Abrir el navegador
start http://localhost:3000

echo.
echo Navegador abierto en http://localhost:3000
echo.
echo Esta ventana se cerrara en 5 segundos...
timeout /t 5 /nobreak >nul
