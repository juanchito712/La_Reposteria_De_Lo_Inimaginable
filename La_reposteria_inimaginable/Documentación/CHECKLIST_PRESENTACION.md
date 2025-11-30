# ✅ CHECKLIST PRE-PRESENTACIÓN

## 📋 Verificación Antes de Presentar

### 1. Base de Datos (2 minutos)
- [ ] MySQL está corriendo
- [ ] Base de datos `la_reposteria` existe
- [ ] Verificar con: `SHOW TABLES;` (deberías ver 7 tablas)
- [ ] Verificar productos: `SELECT COUNT(*) FROM producto;` (debería ser 24)

### 2. Sistema Iniciado (1 minuto)
- [ ] Ejecutar `iniciar.bat`
- [ ] Ver 3 ventanas CMD abiertas:
  - [ ] Servidor Principal (Puerto 3000)
  - [ ] API Productos (Puerto 3001)
  - [ ] API Carrito (Puerto 3002)
- [ ] Mensajes "✅ Conexión exitosa" en cada ventana

### 3. Frontend Funcionando (30 segundos)
- [ ] Abrir http://localhost:3000
- [ ] La página carga correctamente
- [ ] Se ven productos en el carrusel
- [ ] Botones de login/registro visibles

### 4. Login Cliente (30 segundos)
- [ ] Hacer clic en "Iniciar Sesión"
- [ ] Email: `cliente@test.com`
- [ ] Password: `cliente123`
- [ ] Ingresar correctamente
- [ ] Ver nombre "Cliente Prueba" en la esquina superior derecha
- [ ] Botón flotante del carrito aparece (esquina inferior izquierda)

### 5. Funciones de Cliente (2 minutos)
- [ ] Click en un producto para agregar al carrito
- [ ] Ver notificación "¡Agregado!"
- [ ] Badge del carrito muestra cantidad
- [ ] Click en botón flotante del carrito
- [ ] Modal del carrito se abre
- [ ] Ver producto en el carrito con imagen, nombre, precio
- [ ] Botones +/- funcionan
- [ ] Botón "Realizar Pedido" visible

### 6. Realizar Pedido de Prueba (1 minuto)
- [ ] Click en "Realizar Pedido"
- [ ] Llenar dirección: "Calle 123, Ciudad"
- [ ] Llenar teléfono: "3001234567"
- [ ] Confirmar pedido
- [ ] Ver mensaje "¡Pedido creado exitosamente!"
- [ ] Carrito se vacía automáticamente

### 7. Login Administrador (30 segundos)
- [ ] Cerrar sesión (ícono en esquina superior)
- [ ] Iniciar sesión como admin
- [ ] Email: `admin@placeresocultos.com`
- [ ] Password: `admin123`
- [ ] Ver botón "Admin" dorado en la esquina
- [ ] Click en botón "Admin"

### 8. Panel de Administración (2 minutos)
- [ ] Dashboard muestra 4 cards con estadísticas
- [ ] Click en "Productos"
- [ ] Ver tabla con 24 productos
- [ ] Click en "Usuarios"
- [ ] Ver lista de usuarios
- [ ] Click en "Pedidos"
- [ ] Ver el pedido recién creado en estado "pendiente"
- [ ] Cambiar estado a "Confirmado"
- [ ] Ver cambio reflejado

### 9. Crear Producto de Prueba (2 minutos)
- [ ] En panel de Productos
- [ ] Click en "+ Agregar Producto"
- [ ] Llenar formulario:
  - Nombre: "Producto Demo"
  - Descripción: "Para presentación"
  - Precio: 15000
  - Categoría: Postres
  - Stock: 10
  - Destacado: Sí
- [ ] Guardar
- [ ] Ver producto en la lista
- [ ] Volver a la tienda (click en logo)
- [ ] Ver producto en el catálogo

### 10. Filtros y Búsqueda (1 minuto)
- [ ] Estar en página principal
- [ ] Click en botón "Postres"
- [ ] Solo ver productos de postres
- [ ] Click en "Todos"
- [ ] Ver todos los productos nuevamente
- [ ] Carrusel rotando automáticamente

---

## 🎤 PUNTOS CLAVE PARA LA PRESENTACIÓN

### Inicio (1 minuto)
✨ "Este es un sistema completo de e-commerce para repostería"
✨ "Arquitectura de microservicios con 3 APIs independientes"
✨ "Frontend con JavaScript vanilla, sin frameworks"

### Demostración Cliente (4 minutos)
✨ "Catálogo dinámico con 24 productos precargados"
✨ "Carrito flotante siempre accesible"
✨ "Proceso de compra en 3 pasos sencillos"
✨ "Validación de stock en tiempo real"

### Demostración Admin (4 minutos)
✨ "Dashboard con métricas del negocio"
✨ "Gestión completa de productos, usuarios y pedidos"
✨ "Control de estados de pedidos"
✨ "Carga de imágenes para productos"

### Aspectos Técnicos (1 minuto)
✨ "JWT para autenticación segura"
✨ "Contraseñas encriptadas con bcrypt"
✨ "Base de datos MySQL normalizada"
✨ "100% responsive"
✨ "Código limpio y documentado"

---

## 🚨 TROUBLESHOOTING RÁPIDO

### Si algo no funciona:

**Página en blanco:**
- F12 → Ver errores en consola
- Verificar que las 3 APIs estén corriendo

**No hay productos:**
- Verificar base de datos importada
- Ver logs en ventana "API Productos"

**Carrito no funciona:**
- Verificar sesión iniciada
- Ver logs en ventana "API Carrito"

**No puedo login:**
- Verificar credenciales correctas
- Ver logs en ventana "Servidor Principal"

---

## 📊 DATOS PARA PRESENTACIÓN

- **Tiempo desarrollo:** [Tu tiempo]
- **Líneas de código:** ~3000+
- **Endpoints API:** 25+
- **Tablas BD:** 7
- **Productos iniciales:** 24
- **Categorías:** 5
- **Usuarios prueba:** 2

---

## 💡 PREGUNTAS FRECUENTES A PREPARAR

**¿Por qué microservicios?**
- Escalabilidad independiente
- Mantenimiento más fácil
- Despliegue separado

**¿Por qué Vanilla JS?**
- Demostrar conocimiento de JavaScript puro
- Menor peso (sin frameworks)
- Más control sobre el código

**¿Seguridad?**
- JWT tokens
- Bcrypt para contraseñas
- Prepared statements
- Validación dual (frontend + backend)

**¿Escalabilidad?**
- APIs independientes
- Base de datos normalizada
- Fácil agregar más productos
- Preparado para pagos en línea

---

## ✅ CHECKLIST FINAL PRE-PRESENTACIÓN

5 minutos antes de presentar:

- [ ] Reiniciar sistema completo
- [ ] Verificar los 3 servidores corriendo
- [ ] Abrir navegador en http://localhost:3000
- [ ] Tener credenciales a la mano
- [ ] Tener F12 abierto para mostrar (opcional)
- [ ] Limpiar caché del navegador (Ctrl+Shift+Delete)
- [ ] Cerrar aplicaciones innecesarias
- [ ] Verificar audio/pantalla compartida funciona

---

**¡TODO LISTO PARA PRESENTAR!** 🎉

Sigue este checklist y tu presentación será exitosa.
