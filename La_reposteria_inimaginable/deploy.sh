#!/bin/bash

# Script de despliegue rápido para Raspberry Pi
# La Repostería Inimaginable

echo "🍰 Iniciando despliegue de La Repostería Inimaginable..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# Obtener ruta absoluta del proyecto
PROJECT_PATH=$(pwd)
echo -e "${GREEN}📁 Ruta del proyecto: $PROJECT_PATH${NC}"

# Paso 1: Instalar dependencias
echo -e "\n${YELLOW}📦 Instalando dependencias...${NC}"
npm run install:all

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
fi

# Paso 2: Crear carpeta de logs
echo -e "\n${YELLOW}📝 Creando carpeta de logs...${NC}"
mkdir -p logs

# Paso 3: Actualizar rutas en ecosystem.config.json
echo -e "\n${YELLOW}⚙️  Configurando PM2...${NC}"
sed -i "s|/ruta/completa/al/proyecto/La_reposteria_inimaginable|$PROJECT_PATH|g" ecosystem.config.json

# Paso 4: Verificar archivos .env
echo -e "\n${YELLOW}🔍 Verificando archivos .env...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No existe .env, copiando desde .env.production${NC}"
    cp .env.production .env
    echo -e "${RED}🔧 IMPORTANTE: Edita .env con tus credenciales reales${NC}"
fi

if [ ! -f "api_productos/.env" ]; then
    echo -e "${YELLOW}⚠️  No existe api_productos/.env, copiando...${NC}"
    cp api_productos/.env.production api_productos/.env
    echo -e "${RED}🔧 IMPORTANTE: Edita api_productos/.env con tus credenciales${NC}"
fi

if [ ! -f "api_carrito/.env" ]; then
    echo -e "${YELLOW}⚠️  No existe api_carrito/.env, copiando...${NC}"
    cp api_carrito/.env.production api_carrito/.env
    echo -e "${RED}🔧 IMPORTANTE: Edita api_carrito/.env con tus credenciales${NC}"
fi

# Paso 5: Iniciar servicios con PM2
echo -e "\n${YELLOW}🚀 Iniciando servicios con PM2...${NC}"
pm2 start ecosystem.config.json

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error iniciando servicios con PM2${NC}"
    exit 1
fi

# Paso 6: Guardar configuración PM2
echo -e "\n${YELLOW}💾 Guardando configuración PM2...${NC}"
pm2 save

# Paso 7: Mostrar estado
echo -e "\n${GREEN}✅ Servicios iniciados!${NC}"
pm2 status

# Paso 8: Configurar Nginx
echo -e "\n${YELLOW}🌐 Configurando Nginx...${NC}"

# Actualizar rutas en nginx config
sed -i "s|/ruta/completa/al/proyecto/La_reposteria_inimaginable|$PROJECT_PATH|g" nginx-reposteria.conf

echo -e "${GREEN}Archivo nginx-reposteria.conf actualizado${NC}"
echo -e "\n${YELLOW}Para completar la configuración de Nginx, ejecuta:${NC}"
echo -e "${GREEN}sudo cp nginx-reposteria.conf /etc/nginx/sites-available/reposteria${NC}"
echo -e "${GREEN}sudo ln -s /etc/nginx/sites-available/reposteria /etc/nginx/sites-enabled/${NC}"
echo -e "${GREEN}sudo nginx -t${NC}"
echo -e "${GREEN}sudo systemctl reload nginx${NC}"

# Paso 9: Información final
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DESPLIEGUE COMPLETADO${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\n${YELLOW}📋 Próximos pasos:${NC}"
echo -e "1. ${GREEN}Edita los archivos .env con tus credenciales reales${NC}"
echo -e "2. ${GREEN}Importa la base de datos: mysql -u reposteria_user -p < database/setup_completo.sql${NC}"
echo -e "3. ${GREEN}Configura Nginx con los comandos mostrados arriba${NC}"
echo -e "4. ${GREEN}Configura port forwarding en tu router: Puerto 81 → IP Raspberry:81${NC}"
echo -e "\n${YELLOW}🔍 Comandos útiles:${NC}"
echo -e "  ${GREEN}pm2 status${NC}      - Ver estado de servicios"
echo -e "  ${GREEN}pm2 logs${NC}        - Ver logs en tiempo real"
echo -e "  ${GREEN}pm2 restart all${NC} - Reiniciar todos los servicios"
echo -e "  ${GREEN}pm2 monit${NC}       - Monitor de recursos"
echo -e "\n${YELLOW}🌍 Accede a tu aplicación en:${NC}"
echo -e "  ${GREEN}http://localhost:81${NC}"
echo -e "  ${GREEN}http://TU_IP:81${NC}"
echo -e "  ${GREEN}http://tu-dominio.noip.com:81${NC}"
echo -e "\n${GREEN}🎉 ¡Todo listo, mi lider!${NC}\n"
