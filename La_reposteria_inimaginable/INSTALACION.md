# 🎯 INSTALACIÓN - La Repostería de lo Inimaginable

## ✅ Lista de Verificación Pre-Instalación

Antes de comenzar, asegúrate de tener:

- [ ] Node.js 18+ instalado
- [ ] MySQL 8.0+ instalado y corriendo
- [ ] Puerto 3000, 3001 y 3002 disponibles
- [ ] Navegador web moderno (Chrome, Edge, Firefox)

---

## 📦 Instalación en 3 Pasos

### Paso 1: Importar Base de Datos (2 minutos)

**Opción A - phpMyAdmin:**
1. Abre http://localhost/phpmyadmin
2. Click en "Importar"
3. Selecciona el archivo `database/setup_completo.sql`
4. Click "Continuar"

**Opción B - Línea de comandos:**
```bash
mysql -u root -p < database/setup_completo.sql
```

✅ **Verificación:** Deberías ver la base de datos `la_reposteria` con 7 tablas

---

### Paso 2: Iniciar el Sistema (1 minuto)

Simplemente ejecuta:
```bash
iniciar.bat
```

Este script automáticamente:
- ✅ Instala todas las dependencias de Node.js
- ✅ Crea los archivos .env necesarios
- ✅ Inicia 3 servidores en ventanas separadas

**⏳ Espera a ver estos mensajes:**
```
========================================
  ✅ SISTEMA INICIADO CORRECTAMENTE!
========================================
```

---

### Paso 3: Acceder al Sistema (30 segundos)

Abre tu navegador en: **http://localhost:3000**

**Credenciales de prueba:**

🔧 **Administrador:**
- Usuario: `admin@placeresocultos.com`
- Contraseña: `admin123`
- Acceso: Panel completo de administración

🛍️ **Cliente:**
- Usuario: `cliente@test.com`
- Contraseña: `cliente123`
- Acceso: Tienda y carrito de compras

---

## 🎉 ¡Listo para Usar!

### Funcionalidades Principales

#### Como Cliente:
1. 📱 Navega por el catálogo de productos
2. 🛒 Agrega productos al carrito flotante
3. ➕➖ Ajusta cantidades en tiempo real
4. 📦 Realiza pedidos con un click
5. 🔍 Filtra por categorías

#### Como Administrador:
1. 📊 Ve estadísticas en el dashboard
2. 📦 Gestiona productos (crear, editar, eliminar)
3. 👥 Administra usuarios
4. 🛍️ Gestiona pedidos y cambia estados
5. 📁 Organiza categorías

---

## 🛑 Cómo Detener el Sistema

Para detener todos los servicios:
1. Cierra las 3 ventanas CMD que se abrieron
2. O presiona `Ctrl + C` en cada ventana

---

## ⚠️ Solución de Problemas

### "No se puede conectar al servidor"
**Solución:** Verifica que MySQL esté corriendo
```bash
# Ver servicios de MySQL
services.msc
```

### "Puerto ya en uso"
**Solución:** Cierra las aplicaciones en los puertos 3000, 3001, 3002
```bash
netstat -ano | findstr ":3000"
netstat -ano | findstr ":3001"
netstat -ano | findstr ":3002"
```

### "Error al importar la base de datos"
**Solución:** 
1. Verifica que MySQL esté corriendo
2. Verifica tu usuario y contraseña de MySQL
3. Usa phpMyAdmin si la línea de comandos falla

### "No aparecen productos"
**Solución:** 
1. Verifica que importaste `setup_completo.sql`
2. Revisa la consola del navegador (F12)
3. Verifica que las 3 APIs estén corriendo

---

## 📞 Ayuda Adicional

Si necesitas más información, revisa:
- 📖 `README.md` - Documentación principal
- 📚 `Documentación/GUIA_COMPLETA.md` - Guía detallada
- 📚 `Documentación/PANEL_ADMIN_README.md` - Panel de administración

---

## 🏁 Checklist Final

Después de la instalación, verifica:

- [ ] 3 ventanas CMD abiertas (Servidor Principal, API Productos, API Carrito)
- [ ] Puedes acceder a http://localhost:3000
- [ ] Puedes iniciar sesión con las credenciales de prueba
- [ ] Ves productos en la página principal
- [ ] El botón flotante del carrito aparece al iniciar sesión
- [ ] Puedes agregar productos al carrito
- [ ] El modal del carrito muestra los productos agregados
- [ ] Puedes realizar un pedido de prueba

---

**¿Todo funcionando?** ¡Perfecto! Ya puedes empezar a usar el sistema 🎉

**¿Algo no funciona?** Revisa la sección de "Solución de Problemas" arriba ☝️
