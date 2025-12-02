# La Repostería de lo Inimaginable - Manual Técnico

## Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instalación y Configuración](#instalación-y-configuración)
- [Despliegue](#despliegue)
- [Administración y Monitoreo](#administración-y-monitoreo)
- [Documentación Adicional](#documentación-adicional)

---

## Descripción General

*La Repostería de lo Inimaginable* es una plataforma e-commerce especializada en ventas online de productos de repostería. El sistema permite a los clientes navegar por catálogos de productos organizados por categorías, gestionar carritos de compra y realizar pedidos con información de entrega. Los usuarios administrativos pueden gestionar el inventario de productos, rastrear pedidos y mantener cuentas de clientes.

### Características Principales
- ✅ Catálogo de productos con sistema de categorías
- ✅ Carrito de compras con persistencia
- ✅ Sistema de checkout y gestión de pedidos
- ✅ Panel administrativo completo
- ✅ Autenticación JWT
- ✅ Arquitectura de microservicios
- ✅ Optimizado para hardware de recursos limitados (Raspberry Pi)

---

## Arquitectura del Sistema

El sistema implementa una *arquitectura de microservicios* con tres servicios Node.js independientes que comparten una única instancia de base de datos MariaDB.

### Diagrama de Arquitectura


Internet (Puerto 81) → Router → Raspberry Pi → Nginx (Puerto 81)
                                                    ↓
                        ┌───────────────────────────┼───────────────────────────┐
                        ↓                           ↓                           ↓
                Main Service                  Products API                  Cart API
                (Puerto 3000)                 (Puerto 3001)                (Puerto 3002)
                        ↓                           ↓                           ↓
                        └───────────────────────────┼───────────────────────────┘
                                                    ↓
                                            MariaDB (Puerto 3306)


### Descripción de Servicios

| Servicio | Puerto | Responsabilidades |
|----------|--------|-------------------|
| *reposteria-main* | 3000 | Frontend, operaciones admin, gestión de usuarios/pedidos |
| *reposteria-productos* | 3001 | Catálogo de productos, categorías, autenticación JWT |
| *reposteria-carrito* | 3002 | Operaciones de carrito, checkout, creación de pedidos |

### Orquestación

- *PM2*: Gestor de procesos para reinicio automático y monitoreo
- *Nginx*: Reverse proxy en puerto 81 para enrutamiento de peticiones
- *Base de Datos Compartida*: Instancia única de MariaDB para todos los servicios

---

## Stack Tecnológico

### Backend
- *Node.js* v16+
- *Express.js* - Framework web
- *MariaDB/MySQL* - Base de datos relacional
- *JWT* - Autenticación y autorización
- *bcrypt* - Hash de contraseñas

### Frontend
- *HTML5/CSS3/JavaScript* - Interfaz de usuario
- *Fetch API* - Comunicación con backend

### DevOps & Infraestructura
- *PM2* - Gestor de procesos Node.js
- *Nginx* - Servidor web y reverse proxy
- *Raspberry Pi* - Hardware de despliegue
- *NoIP* - DNS dinámico (opcional)

### Herramientas de Desarrollo
- *Git* - Control de versiones
- *npm* - Gestor de paquetes

---

## Estructura del Proyecto


La_Reposteria_De_Lo_Inimaginable/
│
├── server.js                      # Servidor principal (puerto 3000)
├── ecosystem.config.json          # Configuración PM2
├── deploy.sh                      # Script de despliegue
├── nginx-reposteria.conf          # Configuración Nginx
├── package.json                   # Dependencias servicio principal
│
├── .env.production               # Template variables de entorno
├── .env                          # Variables de entorno (no versionado)
│
├── config/
│   └── db.js                     # Pool de conexiones MySQL
│
├── database/
│   └── setup_completo.sql        # Schema e inicialización DB
│
├── routes/                       # Rutas del servicio principal
│   ├── admin.routes.js
│   ├── usuarios.routes.js
│   └── pedidos.routes.js
│
├── public/                       # Assets estáticos (Nginx)
│   ├── index.html                # Página principal
│   ├── carrito.html              # Vista del carrito
│   ├── admin/                    # Panel administrativo
│   ├── css/
│   ├── js/
│   └── img/
│
├── api_productos/                # Microservicio de productos
│   ├── server.js
│   ├── package.json
│   ├── .env.production
│   ├── .env
│   └── routes/
│       ├── productos.routes.js
│       ├── categorias.routes.js
│       └── auth.routes.js
│
├── api_carrito/                  # Microservicio de carrito
│   ├── server.js
│   ├── package.json
│   ├── .env.production
│   ├── .env
│   └── routes/
│       ├── carrito.routes.js
│       └── checkout.routes.js
│
└── logs/                         # Logs centralizados PM2
    ├── main-error.log
    ├── main-out.log
    ├── productos-error.log
    ├── productos-out.log
    ├── carrito-error.log
    └── carrito-out.log


---

## Requisitos del Sistema

### Hardware Mínimo
- *Raspberry Pi 3B+* o superior
- *1GB RAM* mínimo (recomendado 2GB+)
- *16GB microSD* (recomendado Clase 10)
- *Conexión Ethernet/WiFi*

### Software Base
- *Raspberry Pi OS* (Debian-based)
- *Node.js* v16.x o superior
- *npm* v8.x o superior
- *MariaDB/MySQL* v10.x o superior
- *Nginx* v1.18 o superior
- *PM2* (instalado globalmente)
- *Git*

### Permisos y Acceso
- Usuario con permisos sudo
- Acceso SSH configurado
- Puerto 81 disponible
- Port forwarding configurado en router (para acceso externo)

---

## Instalación y Configuración

### 1. Preparación del Sistema

bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js y npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MariaDB
sudo apt install -y mariadb-server
sudo mysql_secure_installation

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2 globalmente
sudo npm install -g pm2

# Configurar PM2 para inicio automático
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u pi --hp /home/pi


### 2. Clonar Repositorio

bash
cd ~
git clone https://github.com/juanchito712/La_Reposteria_De_Lo_Inimaginable.git
cd La_Reposteria_De_Lo_Inimaginable


### 3. Configurar Base de Datos

bash
# Crear base de datos y usuario
sudo mysql -u root -p

# Dentro de MySQL:
CREATE DATABASE la_reposteria;
CREATE USER 'reposteria_user'@'localhost' IDENTIFIED BY 'TU_PASSWORD_SEGURA';
GRANT ALL PRIVILEGES ON la_reposteria.* TO 'reposteria_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Importar schema
mysql -u reposteria_user -p la_reposteria < database/setup_completo.sql


### 4. Configurar Variables de Entorno

#### Servicio Principal
bash
cp .env.production .env
nano .env


Configurar:
env
# Base de Datos
DB_HOST=localhost
DB_USER=reposteria_user
DB_PASSWORD=TU_PASSWORD_SEGURA_AQUI
DB_NAME=la_reposteria
DB_PORT=3306

# Puerto del Servicio
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=CAMBIAR_POR_CLAVE_SUPER_SEGURA_PRODUCCION_2024
JWT_EXPIRES_IN=24h

# URLs de Microservicios
API_PRODUCTOS_URL=http://localhost:3001
API_CARRITO_URL=http://localhost:3002

# Logs
LOG_LEVEL=info


#### API de Productos
bash
cp api_productos/.env.production api_productos/.env
nano api_productos/.env


Configurar (mismos valores de DB, JWT_SECRET y PORT=3001)

#### API de Carrito
bash
cp api_carrito/.env.production api_carrito/.env
nano api_carrito/.env


Configurar (mismos valores de DB, JWT_SECRET y PORT=3002)

### 5. Instalar Dependencias

bash
# Instalar todas las dependencias
npm run install:all

# O manualmente:
npm install
cd api_productos && npm install && cd ..
cd api_carrito && npm install && cd ..


### 6. Configurar Nginx

bash
# Copiar configuración
sudo cp nginx-reposteria.conf /etc/nginx/sites-available/reposteria
sudo ln -s /etc/nginx/sites-available/reposteria /etc/nginx/sites-enabled/

# Verificar sintaxis
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx


---

## Despliegue

### Despliegue Automatizado

El script deploy.sh automatiza el proceso completo:

bash
chmod +x deploy.sh
./deploy.sh


El script ejecuta:
1. ✅ Instalación de dependencias de todos los servicios
2. ✅ Inicio de servicios con PM2 usando ecosystem.config.json
3. ✅ Guardado de configuración PM2
4. ✅ Configuración de inicio automático

### Despliegue Manual

bash
# Iniciar servicios con PM2
pm2 start ecosystem.config.json

# Guardar configuración
pm2 save

# Verificar estado
pm2 status


### Configuración de PM2

El archivo ecosystem.config.json define:

json
{
  "apps": [
    {
      "name": "reposteria-main",
      "script": "./server.js",
      "instances": 1,
      "autorestart": true,
      "watch": false,
      "max_memory_restart": "200M",
      "env": { "NODE_ENV": "production" },
      "error_file": "./logs/main-error.log",
      "out_file": "./logs/main-out.log",
      "time": true
    },
    {
      "name": "reposteria-productos",
      "script": "./api_productos/server.js",
      "instances": 1,
      "autorestart": true,
      "watch": false,
      "max_memory_restart": "150M"
    },
    {
      "name": "reposteria-carrito",
      "script": "./api_carrito/server.js",
      "instances": 1,
      "autorestart": true,
      "watch": false,
      "max_memory_restart": "150M"
    }
  ]
}


---

## Administración y Monitoreo

### Comandos PM2 Esenciales

bash
# Ver estado de servicios
pm2 status

# Ver logs en tiempo real
pm2 logs

# Ver logs de un servicio específico
pm2 logs reposteria-main

# Reiniciar todos los servicios
pm2 restart all

# Reiniciar servicio específico
pm2 restart reposteria-main

# Detener servicios
pm2 stop all

# Eliminar servicios de PM2
pm2 delete all

# Monitoreo en tiempo real
pm2 monit


### Ubicación de Logs

Todos los logs se centralizan en el directorio logs/:

| Archivo | Contenido |
|---------|-----------|
| main-error.log | Errores del servicio principal |
| main-out.log | Output del servicio principal |
| productos-error.log | Errores API productos |
| productos-out.log | Output API productos |
| carrito-error.log | Errores API carrito |
| carrito-out.log | Output API carrito |

Formato de timestamps: YYYY-MM-DD HH:mm:ss Z

### Verificación de Servicios

bash
# Verificar puertos activos
netstat -tlnp | grep -E '3000|3001|3002|81'

# Verificar estado de Nginx
sudo systemctl status nginx

# Verificar estado de MariaDB
sudo systemctl status mariadb

# Probar conectividad de servicios
curl http://localhost:3000
curl http://localhost:3001/api/productos
curl http://localhost:3002/api/carrito


### Acceso al Sistema

| Tipo de Acceso | URL | Descripción |
|----------------|-----|-------------|
| *Local (Raspberry Pi)* | http://localhost:81 | Acceso directo desde el Pi |
| *Red Local* | http://192.168.X.X:81 | Desde dispositivos en la misma LAN |
| *Internet (IP)* | http://PUBLIC_IP:81 | Acceso directo vía IP pública |
| *Internet (Dominio)* | http://dominio.noip.com:81 | Acceso vía DNS dinámico |

*Nota:* El puerto 81 debe especificarse explícitamente en todas las URLs.

---

## Enrutamiento Nginx

Nginx enruta las peticiones según estos patrones:

| Ruta | Destino | Descripción |
|------|---------|-------------|
| /css/*, /js/*, /img/* | Sistema de archivos | Assets estáticos (caché 1 año) |
| /api/productos/* | Puerto 3001 | API de productos |
| /api/categorias/* | Puerto 3001 | API de categorías |
| /api/auth/* | Puerto 3001 | Autenticación |
| /api/carrito/* | Puerto 3002 | API de carrito |
| /*, /admin/* | Puerto 3000 | Servicio principal y frontend |

---

## Seguridad

### Consideraciones Importantes

1. *Cambiar Credenciales Predeterminadas*
   - Modificar JWT_SECRET en todos los .env
   - Usar contraseña fuerte para usuario MySQL
   - Cambiar contraseña del usuario pi de Raspberry Pi

2. *Firewall*
   bash
   sudo ufw allow 81/tcp
   sudo ufw enable
   

3. *HTTPS (Recomendado para producción)*
   - Configurar certificado SSL con Let's Encrypt
   - Modificar configuración de Nginx para usar puerto 443

4. *Actualizaciones*
   bash
   # Sistema
   sudo apt update && sudo apt upgrade -y
   
   # Dependencias Node.js
   npm audit fix
   

---

## Troubleshooting

### Problema: Servicios no inician

bash
# Verificar logs de PM2
pm2 logs --err

# Verificar permisos
ls -la /home/pi/La_Reposteria_De_Lo_Inimaginable

# Reinstalar dependencias
rm -rf node_modules api_*/node_modules
npm run install:all


### Problema: Error de conexión a base de datos

bash
# Verificar que MariaDB esté corriendo
sudo systemctl status mariadb

# Probar conexión manualmente
mysql -u reposteria_user -p -h localhost

# Verificar credenciales en archivos .env
cat .env | grep DB_


### Problema: Puerto 81 no responde

bash
# Verificar estado de Nginx
sudo systemctl status nginx

# Verificar sintaxis de configuración
sudo nginx -t

# Revisar logs de Nginx
sudo tail -f /var/log/nginx/error.log


### Problema: Alta memoria en Raspberry Pi

bash
# Ver uso de memoria
free -h

# Ajustar límites en ecosystem.config.json
# max_memory_restart: "150M" (reducir si es necesario)

# Reiniciar servicios
pm2 restart all


---

## Mantenimiento

### Backup de Base de Datos

bash
# Crear backup
mysqldump -u reposteria_user -p la_reposteria > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u reposteria_user -p la_reposteria < backup_20240101.sql


### Actualización del Código

bash
cd ~/La_Reposteria_De_Lo_Inimaginable
git pull origin main
npm run install:all
pm2 restart all


---

## Documentación Adicional

Para información detallada sobre aspectos específicos del sistema, consultar:

- **[System Architecture](https://deepwiki.com/juanchito712/La_Reposteria_De_Lo_Inimaginable/2-system-architecture)** - Responsabilidades de servicios y patrones de comunicación
- **[Getting Started](https://deepwiki.com/juanchito712/La_Reposteria_De_Lo_Inimaginable/3-getting-started)** - Procedimientos de despliegue y configuración
- *[DESPLIEGUE_RASPBERRY.md](./DESPLIEGUE_RASPBERRY.md)* - Guía completa de despliegue en Raspberry Pi

---

## Información del Proyecto

- *Repositorio:* [github.com/juanchito712/La_Reposteria_De_Lo_Inimaginable](https://github.com/juanchito712/La_Reposteria_De_Lo_Inimaginable)
- *Documentación Wiki:* [deepwiki.com/juanchito712/La_Reposteria_De_Lo_Inimaginable](https://deepwiki.com/juanchito712/La_Reposteria_De_Lo_Inimaginable)
- *Autor:* juanchito712

---

## Licencia

Este proyecto está diseñado para despliegue de pequeñas empresas utilizando tecnologías open-source. Consultar el repositorio para detalles de licencia específicos.

---
