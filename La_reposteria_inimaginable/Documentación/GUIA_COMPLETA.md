# 📖 Documentación - La Repostería de lo Inimaginable

## 📋 Tabla de Contenidos

1. [Instalación Rápida](#instalación-rápida)
2. [Panel de Administración](#panel-de-administración)
3. [API Endpoints](#api-endpoints)
4. [Base de Datos](#base-de-datos)

---

## 🚀 Instalación Rápida

### Paso 1: Importar Base de Datos
```bash
mysql -u root -p < database/setup_completo.sql
```

### Paso 2: Iniciar Sistema
```bash
iniciar.bat
```

### Paso 3: Acceder
- Frontend: http://localhost:3000
- Usuario admin: admin@placeresocultos.com / admin123

---

## 👨‍💼 Panel de Administración

### Acceso
http://localhost:3000/admin

### Funcionalidades

#### Dashboard
- Total de productos en inventario
- Total de usuarios registrados  
- Total de pedidos
- Pedidos pendientes de atención

#### Gestión de Productos
- **Crear:** Agregar nuevos productos con imagen
- **Editar:** Modificar información y stock
- **Eliminar:** Desactivar productos
- **Destacar:** Marcar productos como destacados

#### Gestión de Usuarios
- Ver lista completa de clientes
- Buscar usuarios por nombre o email
- Ver detalles de cada usuario

#### Gestión de Pedidos
- Ver todos los pedidos ordenados por fecha
- Cambiar estado: Pendiente → Confirmado → En Preparación → Listo → Entregado
- Ver detalles completos de cada pedido
- Información de entrega y contacto

---

## 🔌 API Endpoints

### API Productos (Puerto 3001)

#### Productos
```
GET    /api/productos              # Listar todos los productos
GET    /api/productos/:id          # Obtener un producto
POST   /api/productos              # Crear producto (Admin)
PUT    /api/productos/:id          # Actualizar producto (Admin)
DELETE /api/productos/:id          # Eliminar producto (Admin)
```

#### Categorías
```
GET    /api/categorias             # Listar categorías
GET    /api/categorias/:id         # Obtener una categoría
POST   /api/categorias             # Crear categoría (Admin)
PUT    /api/categorias/:id         # Actualizar categoría (Admin)
DELETE /api/categorias/:id         # Eliminar categoría (Admin)
```

### API Carrito (Puerto 3002)

#### Carrito
```
GET    /api/carrito?cliente_id=X   # Obtener carrito del cliente
POST   /api/carrito/agregar        # Agregar producto al carrito
PUT    /api/carrito/item/:id       # Actualizar cantidad
DELETE /api/carrito/item/:id       # Eliminar item
DELETE /api/carrito/vaciar         # Vaciar carrito completo
```

#### Checkout
```
POST   /api/carrito/checkout       # Crear pedido desde carrito
```

### API Principal (Puerto 3000)

#### Autenticación
```
POST   /api/auth/login             # Iniciar sesión
POST   /api/auth/register          # Registrar nuevo usuario
GET    /api/auth/profile           # Obtener perfil del usuario
```

#### Pedidos
```
GET    /api/pedidos                # Listar pedidos del usuario
GET    /api/pedidos/:id            # Obtener detalles de un pedido
```

#### Admin
```
GET    /api/admin/pedidos          # Todos los pedidos (Admin)
PUT    /api/admin/pedidos/:id      # Actualizar estado pedido (Admin)
GET    /api/admin/usuarios         # Listar usuarios (Admin)
GET    /api/admin/dashboard        # Estadísticas (Admin)
```

---

## 🗄️ Base de Datos

### Estructura de Tablas

#### `categoria`
- `id` - INT (PK)
- `nombre` - VARCHAR(100)
- `descripcion` - TEXT
- `imagen` - VARCHAR(255)
- `activa` - TINYINT
- `orden_mostrar` - INT

#### `producto`
- `id` - INT (PK)
- `nombre` - VARCHAR(200)
- `descripcion` - TEXT
- `precio` - DECIMAL(10,2)
- `categoria_id` - INT (FK)
- `imagen` - VARCHAR(255)
- `stock` - INT
- `activo` - TINYINT
- `destacado` - TINYINT

#### `cliente`
- `id` - INT (PK)
- `nombre` - VARCHAR(100)
- `apellido` - VARCHAR(100)
- `email` - VARCHAR(150)
- `telefono` - VARCHAR(20)
- `direccion` - TEXT
- `password` - VARCHAR(255)
- `rol` - ENUM('admin', 'cliente')

#### `carrito`
- `id_carrito` - INT (PK)
- `cliente_id` - INT (FK)
- `fecha_creacion` - TIMESTAMP

#### `carrito_item`
- `id_item` - INT (PK)
- `carrito_id` - INT (FK)
- `producto_id` - INT (FK)
- `cantidad` - INT

#### `pedido`
- `id` - INT (PK)
- `cliente_id` - INT (FK)
- `total` - DECIMAL(10,2)
- `estado` - ENUM
- `fecha_pedido` - TIMESTAMP
- `direccion_entrega` - TEXT
- `telefono_entrega` - VARCHAR(20)

#### `pedido_detalle`
- `id` - INT (PK)
- `pedido_id` - INT (FK)
- `producto_id` - INT (FK)
- `cantidad` - INT
- `precio_unitario` - DECIMAL(10,2)
- `subtotal` - DECIMAL(10,2)

---

## 📦 Flujo de Pedido

1. Cliente navega por los productos
2. Agrega productos al carrito flotante
3. Revisa el carrito con totales calculados
4. Ajusta cantidades si es necesario
5. Realiza el pedido ingresando datos de entrega
6. Sistema valida stock disponible
7. Crea el pedido en estado "pendiente"
8. Reduce el stock automáticamente
9. Vacía el carrito del cliente
10. Admin gestiona el pedido desde el panel

---

**Última actualización:** Noviembre 2025
