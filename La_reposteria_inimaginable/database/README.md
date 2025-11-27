# 🗄️ Base de Datos - La Repostería Inimaginable

## ⚠️ IMPORTANTE: ¿Qué archivo usar?

### ✅ **setup_completo.sql** ← USA ESTE

Este es el archivo principal que debes importar. Contiene:
- ✅ Todas las tablas necesarias
- ✅ Estructura completa del carrito (`carrito` y `carrito_item`)
- ✅ Relaciones correctas entre tablas
- ✅ Datos de prueba (categorías, productos, usuarios)
- ✅ Compatibilidad total con todas las APIs

### 📋 Otros archivos

- **fix_fresas_marshmallow.sql** - Script de corrección específico (opcional)

---

## 🚀 Cómo Importar

### Opción 1: phpMyAdmin
1. Abrir http://localhost/phpmyadmin
2. Click en "Importar"
3. Seleccionar: `setup_completo.sql`
4. Click "Continuar"

### Opción 2: Línea de comandos
```bash
mysql -u root -p < setup_completo.sql
```

---

## 📊 Tablas Incluidas

- `categoria` - Categorías de productos
- `cliente` - Usuarios del sistema
- `producto` - Catálogo de productos
- `pedido` - Órdenes de compra
- `pedido_detalle` - Detalles de cada pedido
- `carrito` - Carritos de compra
- `carrito_item` - Items dentro del carrito

---

## 👥 Usuarios de Prueba

### Administrador
- Email: admin@placeresocultos.com
- Password: admin123

### Cliente
- Email: cliente@test.com
- Password: cliente123

---

## ✅ Verificación

Después de importar, verifica que todas las tablas existan:

```sql
SHOW TABLES;
```

Deberías ver 7 tablas en total.

---

**Última actualización:** 25 de Noviembre, 2025
