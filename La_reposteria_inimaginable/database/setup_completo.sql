-- ============================================
-- SETUP COMPLETO - La Reposteria Inimaginable
-- ============================================
-- Este archivo configura toda la base de datos incluyendo:
-- - Tablas principales
-- - Sistema de carrito con estructura de items
-- - Relaciones correctas entre tablas
-- ============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS `la_reposteria` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `la_reposteria`;

-- ============================================
-- TABLA: categoria
-- ============================================
CREATE TABLE IF NOT EXISTS `categoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `orden_mostrar` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `idx_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: cliente
-- ============================================
CREATE TABLE IF NOT EXISTS `cliente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_usuario` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `tipo_documento` enum('cc','ti','dni','pasaporte','otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'cc',
  `numero_documento` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('admin','cliente') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'cliente',
  `activo` tinyint(1) DEFAULT '1',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  KEY `idx_email` (`email`),
  KEY `idx_usuario` (`nombre_usuario`),
  KEY `idx_rol` (`rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: producto
-- ============================================
CREATE TABLE IF NOT EXISTS `producto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `precio` decimal(10,2) NOT NULL,
  `categoria_id` int DEFAULT NULL,
  `imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `destacado` tinyint(1) DEFAULT '0',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_precio` (`precio`),
  KEY `idx_categoria` (`categoria_id`),
  KEY `idx_activo` (`activo`),
  KEY `idx_destacado` (`destacado`),
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: pedido
-- ============================================
CREATE TABLE IF NOT EXISTS `pedido` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cliente_id` int NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','confirmado','en_preparacion','listo','entregado','cancelado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `fecha_pedido` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_entrega` timestamp NULL DEFAULT NULL,
  `direccion_entrega` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `telefono_entrega` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_cliente` (`cliente_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha` (`fecha_pedido`),
  CONSTRAINT `fk_pedido_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: pedido_detalle
-- ============================================
CREATE TABLE IF NOT EXISTS `pedido_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pedido_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pedido` (`pedido_id`),
  KEY `idx_producto` (`producto_id`),
  CONSTRAINT `fk_detalle_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedido` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: carrito
-- ============================================
CREATE TABLE IF NOT EXISTS `carrito` (
  `id_carrito` int NOT NULL AUTO_INCREMENT,
  `cliente_id` int NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_carrito`),
  UNIQUE KEY `unique_cliente_carrito` (`cliente_id`),
  KEY `idx_cliente_id` (`cliente_id`),
  CONSTRAINT `fk_carrito_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: carrito_item
-- ============================================
CREATE TABLE IF NOT EXISTS `carrito_item` (
  `id_item` int NOT NULL AUTO_INCREMENT,
  `carrito_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `fecha_agregado` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_item`),
  UNIQUE KEY `unique_carrito_producto` (`carrito_id`, `producto_id`),
  KEY `idx_carrito_id` (`carrito_id`),
  KEY `idx_producto_id` (`producto_id`),
  CONSTRAINT `fk_carrito_item_carrito` FOREIGN KEY (`carrito_id`) REFERENCES `carrito` (`id_carrito`) ON DELETE CASCADE,
  CONSTRAINT `fk_carrito_item_producto` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar categorías
INSERT INTO `categoria` (`id`, `nombre`, `descripcion`, `imagen`, `activa`, `orden_mostrar`) VALUES
(1, 'Postres', 'Deliciosos postres caseros', NULL, 1, 0),
(2, 'Tortas Especiales', 'Tortas para ocasiones especiales', NULL, 1, 0),
(3, 'Frutas', 'Frutas frescas y preparadas', NULL, 1, 0),
(4, 'Galletas', 'Galletas artesanales', NULL, 1, 0),
(5, 'Bebidas', 'Bebidas y café especializado', NULL, 1, 0)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Insertar clientes de prueba
INSERT INTO `cliente` (`id`, `nombre`, `apellido`, `nombre_usuario`, `email`, `telefono`, `direccion`, `password`, `rol`) VALUES
(1, 'Administrador', 'Sistema', 'admin', 'admin@placeresocultos.com', '1234567890', 'Dirección Admin', '$2b$10$PJsNoIa2aw3VCB.q54/ykeMw/KvrYhTKD1ePJKt/zcMb/CL3jrwES', 'admin'),
(2, 'Cliente', 'Prueba', 'cliente', 'cliente@test.com', '0987654321', 'Dirección Cliente', '$2b$10$0Bi.w9jqq0ylkmsxzMdSlO0SFi8Gpc1eXqicY2JHEQUCSLYrL022S', 'cliente')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Insertar productos
INSERT INTO `producto` (`id`, `nombre`, `descripcion`, `precio`, `categoria_id`, `imagen`, `stock`, `activo`, `destacado`) VALUES
(1, 'Banano', 'Delicioso Banano hecho artesanalmente', 20000.00, 3, 'banano.jpg', 20, 1, 0),
(2, 'Bebidas Refrescantes', 'Delicioso Bebidas Refrescantes hecho artesanalmente', 25000.00, 5, 'bebidas_refrescantes.jpg', 15, 1, 0),
(3, 'Cappuccino', 'Delicioso Cappuccino hecho artesanalmente', 40000.00, 5, 'cappuccino.jpg', 18, 1, 1),
(4, 'Cereza', 'Delicioso Cereza hecho artesanalmente', 30000.00, 3, 'cereza.jpg', 18, 1, 1),
(5, 'Cheesecake Fresa', 'Delicioso Cheesecake Fresa hecho artesanalmente', 18000.00, 3, 'cheesecake_fresa.jpg', 10, 1, 0),
(6, 'Churros', 'Delicioso Churros hecho artesanalmente', 15000.00, 1, 'churros.jpg', 8, 1, 0),
(7, 'Cuca', 'Delicioso Cuca hecho artesanalmente', 15000.00, 2, 'cuca.jpg', 8, 1, 0),
(8, 'Donas', 'Delicioso Donas hecho artesanalmente', 40000.00, 1, 'donas.jpg', 12, 1, 1),
(9, 'Fresas Crema', 'Delicioso Fresas Crema hecho artesanalmente', 18000.00, 3, 'fresas_crema.jpg', 7, 1, 0),
(10, 'Fresas Marshmallow', 'Delicioso Fresas Marshmallow hecho artesanalmente', 15000.00, 3, 'fresas_marshmallow.jpg', 16, 1, 1),
(11, 'Galletas Chocolate', 'Delicioso Galletas Chocolate hecho artesanalmente', 40000.00, 4, 'galletas_chocolate.jpg', 9, 1, 0),
(12, 'Galletas Especiales', 'Delicioso Galletas Especiales hecho artesanalmente', 35000.00, 2, 'galletas_especiales.jpg', 15, 1, 0),
(14, 'Manzana', 'Delicioso Manzana hecho artesanalmente', 20000.00, 3, 'manzana.jpg', 13, 1, 0),
(15, 'Mini Tarta Frutas', 'Delicioso Mini Tarta Frutas hecho artesanalmente', 30000.00, 1, 'mini_tarta_frutas.jpg', 17, 1, 0),
(16, 'Pichos', 'Delicioso Pichos hecho artesanalmente', 50000.00, 1, 'pichos.jpg', 15, 1, 1),
(17, 'Postre Gelatina', 'Delicioso Postre Gelatina hecho artesanalmente', 40000.00, 1, 'postre_gelatina.jpg', 14, 1, 0),
(18, 'Postre Limon', 'Delicioso Postre Limon hecho artesanalmente', 35000.00, 1, 'postre_limon.jpg', 19, 1, 0),
(19, 'Postre Oreo', 'Delicioso Postre Oreo hecho artesanalmente', 35000.00, 1, 'postre_oreo.jpg', 10, 1, 0),
(20, 'Rollos Canela', 'Delicioso Rollos Canela hecho artesanalmente', 18000.00, 1, 'rollos_canela.jpg', 9, 1, 0),
(21, 'Torta Cumpleanos', 'Delicioso Torta Cumpleanos hecho artesanalmente', 15000.00, 2, 'torta_cumpleanos.jpg', 10, 1, 0),
(22, 'Torta Falica', 'Delicioso Torta Falica hecho artesanalmente', 15000.00, 2, 'torta_falica.jpg', 19, 1, 0),
(23, 'Torta Lingerie', 'Delicioso Torta Lingerie hecho artesanalmente', 30000.00, 2, 'torta_lingerie.jpg', 6, 1, 1),
(24, 'Torta Soltera', 'Delicioso Torta Soltera hecho artesanalmente', 35000.00, 2, 'torta_soltera.jpg', 7, 1, 0),
(25, 'Uvas', 'Delicioso Uvas hecho artesanalmente', 35000.00, 3, 'uvas.jpg', 10, 1, 0)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), precio = VALUES(precio), stock = VALUES(stock);

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT '✅ Base de datos configurada correctamente' AS resultado;
SELECT 'Categorías:', COUNT(*) FROM categoria;
SELECT 'Productos:', COUNT(*) FROM producto;
SELECT 'Clientes:', COUNT(*) FROM cliente;
