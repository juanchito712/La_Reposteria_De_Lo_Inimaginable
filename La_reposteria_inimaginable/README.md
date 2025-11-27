# 🍰 La Repostería de lo Inimaginable

Sistema completo de repostería con gestión de productos, carrito de compras y pedidos.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ instalado
- MySQL 8.0+ instalado
- Navegador web moderno

### Instalación y Ejecución

1. **Importar la base de datos:**
   ```bash
   mysql -u root -p < database/setup_completo.sql
   ```

2. **Iniciar el sistema:**
   ```bash
   iniciar.bat
   ```
   
   Este comando automáticamente:
   - ✅ Instala todas las dependencias necesarias
   - ✅ Crea archivos `.env` si no existen
   - ✅ Inicia los 3 servicios en ventanas separadas

3. **Acceder al sistema:**
   - 🌐 Frontend: http://localhost:3000
   - 📦 API Productos: http://localhost:3001
   - 🛒 API Carrito: http://localhost:3002

## 👤 Usuarios de Prueba

### Administrador
- **Usuario:** admin@placeresocultos.com
- **Contraseña:** admin123
- **Acceso:** Panel de administración completo

### Cliente
- **Usuario:** cliente@test.com
- **Contraseña:** cliente123
- **Acceso:** Compras y carrito

## 🏗️ Arquitectura del Sistema

```
La_reposteria_inimaginable/
├── iniciar.bat              # Script principal de inicio
├── server.js                # Servidor principal (Puerto 3000)
├── package.json             # Dependencias del servidor principal
│
├── api_productos/           # API de Productos (Puerto 3001)
│   ├── server.js
│   ├── package.json
│   └── controllers/
│
├── api_carrito/             # API de Carrito (Puerto 3002)
│   ├── server.js
│   ├── package.json
│   └── controllers/
│
├── database/
│   ├── setup_completo.sql   # Base de datos completa
│   └── README.md            # Instrucciones de BD
│
└── public/                  # Frontend
    ├── index.html
    ├── login.html
    ├── register.html
    ├── admin/               # Panel de administración
    ├── css/
    ├── js/
    └── img/
```

## ✨ Características Principales

### Para Clientes
- 🛍️ **Catálogo de productos** con filtros por categoría
- 🎠 **Carrusel automático** de productos destacados
- 🛒 **Carrito flotante** con gestión en tiempo real
- ➕➖ **Ajuste de cantidades** directamente en el carrito
- 📦 **Realizar pedidos** con dirección y teléfono
- 📊 **Validación de stock** automática
- 💰 **Cálculo de totales** en tiempo real

### Para Administradores
- 📊 **Dashboard** con estadísticas
- 📦 **Gestión de productos** (CRUD completo)
- 👥 **Gestión de usuarios**
- 🛍️ **Gestión de pedidos** con cambio de estados
- 📁 **Gestión de categorías**
- 🖼️ **Carga de imágenes** para productos

## 🔧 Configuración

### Base de Datos (MySQL)
Los archivos `.env` se crean automáticamente con:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=la_reposteria
DB_PORT=3306
```

Si necesitas cambiar la contraseña de MySQL, edita los archivos:
- `.env` (servidor principal)
- `api_productos/.env`
- `api_carrito/.env`

## 📝 Scripts Disponibles

### Desde el directorio raíz:
```bash
# Iniciar todo el sistema
iniciar.bat

# O usar npm scripts:
npm run start:principal   # Solo servidor principal
npm run start:productos   # Solo API productos
npm run start:carrito     # Solo API carrito
```

## 🛑 Detener el Sistema

Para detener todos los servicios:
1. Cierra las 3 ventanas CMD que se abrieron
2. O presiona `Ctrl+C` en cada ventana

## 📚 Tecnologías Utilizadas

### Backend
- Node.js + Express
- MySQL2 (con soporte de promesas)
- JWT para autenticación
- Bcrypt para encriptación
- Multer para carga de archivos
- Nodemailer para emails
- CORS habilitado

### Frontend
- HTML5 + CSS3
- JavaScript (Vanilla)
- Bootstrap 5.3
- Font Awesome 6
- SweetAlert2

## 🔒 Seguridad

- ✅ Contraseñas encriptadas con bcrypt
- ✅ Autenticación JWT
- ✅ Validación de tokens en todas las rutas protegidas
- ✅ Protección CORS configurada
- ✅ Validación de datos en frontend y backend
- ✅ Sanitización de SQL con prepared statements

## 🐛 Solución de Problemas

### El sistema no inicia
1. Verifica que MySQL esté corriendo
2. Asegúrate de haber importado `database/setup_completo.sql`
3. Revisa que los puertos 3000, 3001 y 3002 estén disponibles

### Error de conexión a la base de datos
1. Verifica las credenciales en los archivos `.env`
2. Asegúrate de que la base de datos `la_reposteria` exista
3. Verifica que MySQL esté corriendo en el puerto 3306

### No puedo iniciar sesión
- Usa los usuarios de prueba proporcionados arriba
- Verifica que la tabla `cliente` tenga datos

## 📄 Licencia

Proyecto educativo - La Repostería de lo Inimaginable

## 👨‍💻 Autor

Desarrollado para presentación del sistema de repostería

---

**¿Necesitas ayuda?** Revisa la documentación en la carpeta `Documentación/`
