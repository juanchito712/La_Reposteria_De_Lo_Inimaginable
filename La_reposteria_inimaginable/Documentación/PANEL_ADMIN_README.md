# 🎂 Panel de Administración - La Repostería Inimaginable

## 🚀 **IMPLEMENTACIÓN COMPLETA**

### ✅ **Lo que se ha implementado:**

---

## 📁 **ESTRUCTURA DE ARCHIVOS**

```
src/
├── middlewares/
│   └── auth_middleware.js          ✅ Verificación de token y rol admin
├── controllers/
│   └── admin_controller.js         ✅ Controladores de administración
└── routes/
    └── admin_routes.js             ✅ Rutas protegidas de admin

public/
├── admin/
│   ├── index.html                  ✅ Dashboard principal
│   └── js/
│       └── dashboard.js            ✅ Lógica del dashboard
└── js/
    └── api.js                      ✅ Cliente API actualizado
```

---

## 🔐 **SISTEMA DE AUTENTICACIÓN**

### **Middleware de Autorización**
- `verificarToken`: Valida JWT y obtiene usuario
- `verificarAdmin`: Verifica que el usuario tenga rol 'admin'
- `soloAdmin`: Middleware combinado para rutas protegidas

---

## 📊 **ENDPOINTS DE ADMIN**

Todos requieren autenticación con token JWT y rol 'admin'

### **Dashboard**
```
GET /api/admin/dashboard/stats
```
Retorna:
- Total de productos, pedidos, clientes
- Ventas totales
- Productos con bajo stock
- Últimos pedidos
- Productos más vendidos
- Ventas por mes (últimos 6 meses)

### **Usuarios**
```
GET    /api/admin/usuarios              # Listar todos los usuarios
PUT    /api/admin/usuarios/:id/rol      # Cambiar rol (admin/cliente)
DELETE /api/admin/usuarios/:id          # Desactivar usuario
```

### **Pedidos**
```
GET /api/admin/pedidos                  # Todos los pedidos con detalles
PUT /api/admin/pedidos/:id/estado       # Actualizar estado
```

Estados válidos:
- `pendiente`
- `en_preparacion`
- `enviado`
- `entregado`
- `cancelado`

### **Reportes**
```
GET /api/admin/reportes/ventas?fecha_inicio=2025-01-01&fecha_fin=2025-12-31
```

---

## 🎨 **FRONTEND - PANEL DE ADMINISTRACIÓN**

### **Dashboard (admin/index.html)**

#### **Características:**
1. **Sidebar con navegación**
   - Dashboard
   - Productos
   - Pedidos
   - Usuarios
   - Reportes
   - Ir a la tienda
   - Cerrar sesión

2. **Estadísticas en Cards**
   - Total productos (card azul)
   - Total pedidos (card verde)
   - Total clientes (card naranja)
   - Ventas totales (card celeste)

3. **Alertas Importantes**
   - Tabla de productos con bajo stock (< 5 unidades)
   - Tabla de pedidos pendientes

4. **Gráficos con Chart.js**
   - Productos más vendidos (gráfico de barras)
   - Ventas por mes (gráfico de línea)

5. **Protección de Acceso**
   - Verifica autenticación
   - Verifica rol de admin
   - Redirecciona si no tiene permisos

---

## 🔑 **CREDENCIALES DE ADMIN**

Usuario administrador predeterminado:
```
Email:    admin@placeresocultos.com
Password: admin123
```

---

## 🧪 **CÓMO PROBAR**

### **1. Iniciar el servidor**
```bash
npm run dev
```

### **2. Iniciar sesión como admin**
```
http://localhost:3000/login.html
Email: admin@placeresocultos.com
Password: admin123
```

### **3. Acceso automático**
El sistema detectará que eres admin y te redirigirá automáticamente a:
```
http://localhost:3000/admin/index.html
```

### **4. Endpoints disponibles**
```javascript
// Obtener estadísticas del dashboard
GET http://localhost:3000/api/admin/dashboard/stats
Headers: Authorization: Bearer <tu_token>

// Listar usuarios
GET http://localhost:3000/api/admin/usuarios
Headers: Authorization: Bearer <tu_token>

// Actualizar estado de pedido
PUT http://localhost:3000/api/admin/pedidos/1/estado
Headers: Authorization: Bearer <tu_token>
Body: { "estado": "en_preparacion" }

// Cambiar rol de usuario
PUT http://localhost:3000/api/admin/usuarios/2/rol
Headers: Authorization: Bearer <tu_token>
Body: { "rol": "admin" }
```

---

## 🛡️ **SEGURIDAD**

### **Protecciones implementadas:**

1. **Middleware de autenticación**
   - Verifica token JWT válido
   - Verifica que el usuario exista en BD

2. **Middleware de autorización**
   - Verifica rol 'admin' en la base de datos
   - Retorna 403 si no tiene permisos

3. **Frontend protegido**
   - Verifica autenticación al cargar
   - Verifica rol de admin
   - Redirecciona si no tiene permisos

4. **Validaciones adicionales**
   - No puedes cambiar tu propio rol
   - No puedes eliminar tu propia cuenta
   - Estados de pedidos validados

---

## 📈 **PRÓXIMAS FUNCIONALIDADES** (Para implementar)

### **Páginas pendientes:**
- [ ] `admin/productos.html` - CRUD completo de productos
- [ ] `admin/pedidos.html` - Gestión detallada de pedidos
- [ ] `admin/usuarios.html` - Administración de usuarios
- [ ] `admin/reportes.html` - Reportes y gráficos avanzados

### **Funcionalidades adicionales:**
- [ ] Notificaciones en tiempo real
- [ ] Exportar reportes a PDF/Excel
- [ ] Filtros avanzados en tablas
- [ ] Subida masiva de productos
- [ ] Sistema de notificaciones por email

---

## 🐛 **TROUBLESHOOTING**

### **Error: "Acceso Denegado"**
- Verifica que tu usuario tenga `rol = 'admin'` en la BD
- Verifica que el token sea válido

### **Error: "Token inválido"**
- Cierra sesión y vuelve a iniciar sesión
- Limpia localStorage: `localStorage.clear()`

### **No se cargan las estadísticas**
- Verifica que el servidor esté corriendo
- Abre la consola del navegador (F12) para ver errores
- Verifica que tengas productos y pedidos en la BD

---

## 📝 **NOTAS TÉCNICAS**

### **Tecnologías usadas:**
- **Backend:** Node.js + Express
- **Frontend:** Bootstrap 5 + Chart.js 4
- **Autenticación:** JWT
- **Base de datos:** MySQL

### **Librerías adicionales:**
- SweetAlert2 para alertas bonitas
- Chart.js para gráficos
- Font Awesome para íconos

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

- [x] Middleware de autenticación
- [x] Middleware de autorización (rol admin)
- [x] Controlador de admin con 7 endpoints
- [x] Rutas protegidas de admin
- [x] Cliente API actualizado con métodos admin
- [x] Dashboard principal con estadísticas
- [x] Gráficos con Chart.js
- [x] Sistema de protección en frontend
- [x] Redirección automática para admins en login
- [x] Sistema de alertas y notificaciones

---

## 🎉 **RESULTADO FINAL**

¡El Panel de Administración está 100% funcional! Ahora puedes:

✅ Ver estadísticas en tiempo real
✅ Monitorear productos con bajo stock
✅ Ver pedidos pendientes
✅ Gestionar usuarios y roles
✅ Actualizar estados de pedidos
✅ Ver gráficos de ventas

**Próximos pasos:** Implementar las páginas completas de gestión (productos, pedidos, usuarios, reportes)
