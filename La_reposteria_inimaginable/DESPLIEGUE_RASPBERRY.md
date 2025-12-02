# 🚀 Guía de Despliegue - La Repostería Inimaginable
## Raspberry Pi con Nginx (Puerto 81)

---

## 📋 Pre-requisitos en la Raspberry Pi

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (versión 18 o superior)
curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2

# MariaDB (ya lo tienes instalado, reemplaza MySQL)
sudo systemctl enable mariadb
sudo systemctl start mariadb

# Habilitar SSH
sudo systemctl enable ssh
sudo systemctl start ssh

# Firewall (opcional - si no tienes ufw instalado, no es necesario)
# sudo apt install -y ufw
# sudo ufw allow 22/tcp
# sudo ufw allow 80/tcp
# sudo ufw allow 81/tcp
# sudo ufw --force enable

# Nginx ya debería estar instalado (puerto 80 ocupado)
```

---

## 📦 Paso 1: Transferir el Proyecto

```bash
# Desde tu PC, comprimir el proyecto (sin node_modules)
# Ya debes tenerlo en tu PC

# En la Raspberry, crear directorio
mkdir -p ~/proyectos
cd ~/proyectos

# Transferir usando SCP, USB, o Git

# Opción 1 - SCP desde tu PC Windows (PowerShell):
# En PowerShell desde tu PC:
cd C:\Users\SENA\Desktop\La_Reposteria_De_Lo_Inimaginable-main
scp -r La_reposteria_inimaginable proximidad@192.168.1.50:~/proyectos/

# Si te pide contraseña, ingresa la contraseña de tu usuario 'proximidad'
# El comando copiará todo el proyecto a la Raspberry

# Opción 2 - Git (si tienes repo):
# git clone tu-repo.git La_reposteria_inimaginable

# Opción 3 - USB:
# Copiar desde USB a ~/proyectos/
```

---

## 🗄️ Paso 2: Configurar la Base de Datos (MariaDB)

```bash
# Entrar a MariaDB
sudo mysql

# Ejecutar estos comandos en MariaDB:
CREATE DATABASE la_reposteria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'reposteria_user'@'localhost' IDENTIFIED BY 'TuPasswordSegura123!';

GRANT ALL PRIVILEGES ON la_reposteria.* TO 'reposteria_user'@'localhost';

FLUSH PRIVILEGES;

EXIT;

# Importar la base de datos
# NOTA: Si clonaste con git, la ruta tiene doble carpeta:
cd ~/proyectos/La_reposteria_inimaginable/La_reposteria_inimaginable
# O si la moviste correctamente:
# cd ~/proyectos/La_reposteria_inimaginable

mysql -u reposteria_user -p la_reposteria < database/setup_completo.sql

# Verificar que se importó correctamente
mysql -u reposteria_user -p -e "USE la_reposteria; SHOW TABLES;"
```

---

## ⚙️ Paso 3: Configurar Variables de Entorno

```bash
cd ~/proyectos/La_reposteria_inimaginable

# Copiar archivos de producción como .env
cp .env.production .env
cp api_productos/.env.production api_productos/.env
cp api_carrito/.env.production api_carrito/.env

# Editar TODOS los .env con tus datos reales
nano .env
# Cambiar: DB_PASSWORD, JWT_SECRET

nano api_productos/.env
# Cambiar: DB_PASSWORD, JWT_SECRET

nano api_carrito/.env
# Cambiar: DB_PASSWORD, JWT_SECRET
```

---

## 📦 Paso 4: Instalar Dependencias

```bash
cd ~/proyectos/La_reposteria_inimaginable

# Instalar dependencias en todos los servicios
npm run install:all

# O manualmente:
npm install
cd api_productos && npm install && cd ..
cd api_carrito && npm install && cd ..
```

---

## 🔧 Paso 5: Configurar PM2

```bash
cd ~/proyectos/La_reposteria_inimaginable

# Editar ecosystem.config.json con la ruta COMPLETA
nano ecosystem.config.json

# Cambiar TODAS las rutas "/ruta/completa/al/proyecto/" por:
# /home/proximidad/proyectos/La_reposteria_inimaginable

# Ejemplo:
# "cwd": "/home/proximidad/proyectos/La_reposteria_inimaginable"

# Crear carpeta de logs
mkdir -p logs

# Iniciar los 3 servicios con PM2
pm2 start ecosystem.config.json

# Ver el estado
pm2 status

# Ver logs en tiempo real
pm2 logs

# Guardar configuración para que inicie automáticamente
pm2 save
pm2 startup
# Ejecuta el comando que PM2 te muestre
```

---

## 🌐 Paso 6: Configurar Nginx

```bash
# Copiar configuración de Nginx
sudo cp ~/proyectos/La_reposteria_inimaginable/nginx-reposteria.conf \
  /etc/nginx/sites-available/reposteria

# Editar el archivo con la ruta correcta
sudo nano /etc/nginx/sites-available/reposteria

# Cambiar TODAS las rutas "/ruta/completa/al/proyecto/" por:
# /home/proximidad/proyectos/La_reposteria_inimaginable

# Activar el sitio
sudo ln -s /etc/nginx/sites-available/reposteria /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Si todo está OK, recargar Nginx
sudo systemctl reload nginx
```

---

## 🔥 Paso 7: Configurar Firewall (opcional)

```bash
# Solo si instalaste ufw:
sudo apt install -y ufw
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 81/tcp
sudo ufw enable
sudo ufw status
```

---

## 🌍 Paso 8: Port Forwarding en el Router

En tu router, crea una nueva regla:

```
Nombre: Reposteria
Puerto Externo: 81
Puerto Interno: 81
IP Interna: 192.168.X.X (IP de tu Raspberry)
Protocolo: TCP
```

---

## ✅ Paso 9: Verificar Todo Funciona

```bash
# Ver logs de PM2
pm2 logs

# Ver estado de los servicios
pm2 status

# Probar desde la Raspberry:
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health

# Probar Nginx:
curl http://localhost:81
```

**Desde tu navegador:**
- Local en Raspberry: `http://localhost:81`
- Desde tu red local: `http://IP_RASPBERRY:81`
- Desde internet: `http://TU_IP_PUBLICA:81` o `http://tu-dominio.noip.com:81`

---

## 🔧 Comandos Útiles PM2

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs

# Reiniciar un servicio
pm2 restart reposteria-main
pm2 restart reposteria-productos
pm2 restart reposteria-carrito

# Reiniciar todos
pm2 restart all

# Detener todos
pm2 stop all

# Monitorear recursos
pm2 monit
```

---

## 🐛 Solución de Problemas

### Error: Cannot connect to MariaDB
```bash
# Verificar que MariaDB esté corriendo
sudo systemctl status mariadb

# Verificar credenciales en .env
nano .env

# Probar conexión
mysql -u reposteria_user -p -e "USE la_reposteria; SHOW TABLES;"
```

### Error: Puerto 81 ocupado
```bash
# Ver qué está usando el puerto
sudo netstat -tulpn | grep :81

# Cambiar puerto en nginx-reposteria.conf
sudo nano /etc/nginx/sites-available/reposteria
# Cambiar: listen 81; por otro puerto como 82
```

### Error: PM2 no inicia servicios
```bash
# Ver logs detallados
pm2 logs --err

# Verificar rutas en ecosystem.config.json
nano ecosystem.config.json
```

### No puedo acceder desde internet
```bash
# Verificar IP pública
curl ifconfig.me

# Verificar port forwarding en router
# Puerto 81 debe estar redirigido a la IP local de la Raspberry

# Verificar firewall
sudo ufw status
```

---

## 🎉 ¡Listo!

Tu proyecto debería estar funcionando en:
- **Puerto 80**: Tu otro proyecto
- **Puerto 81**: La Repostería Inimaginable

**Acceso:**
- `http://tu-ip-publica:80` → Proyecto 1
- `http://tu-ip-publica:81` → Proyecto 2
- `http://tu-dominio.noip.com:81` → Repostería

---

## 📝 Notas Importantes

1. ✅ **Los 3 servicios corren internamente** en puertos 3000, 3001, 3002
2. ✅ **Nginx escucha en puerto 81** y redirecciona al correcto
3. ✅ **PM2 mantiene los servicios vivos** y los reinicia si fallan
4. ✅ **Todo funciona con una sola IP** usando diferentes puertos
5. ✅ **No-IP solo necesitas agregr `:81`** para acceder

---

## 🔒 Seguridad (Opcional pero Recomendado)

```bash
# Cambiar a HTTPS con Let's Encrypt (requiere dominio)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.noip.com
```
