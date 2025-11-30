const db = require('../config/db');

// Obtener o crear carrito del usuario
exports.obtenerCarrito = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const clienteId = req.query.cliente_id || req.body.cliente_id;
    
    if (!clienteId) {
      return res.status(400).json({
        success: false,
        error: 'cliente_id es requerido'
      });
    }

    // Buscar carrito existente
    let [carritos] = await connection.query(
      'SELECT id_carrito FROM carrito WHERE cliente_id = ?',
      [clienteId]
    );

    let carritoId;
    if (carritos.length === 0) {
      // Crear nuevo carrito
      const [result] = await connection.query(
        'INSERT INTO carrito (cliente_id, fecha_creacion) VALUES (?, NOW())',
        [clienteId]
      );
      carritoId = result.insertId;
    } else {
      carritoId = carritos[0].id_carrito;
    }

    // Obtener items del carrito con detalles de productos
    const [items] = await connection.query(`
      SELECT 
        ci.id_item,
        ci.cantidad,
        p.id as producto_id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.imagen as imagen_url,
        p.stock,
        (ci.cantidad * p.precio) as subtotal
      FROM carrito_item ci
      INNER JOIN producto p ON ci.producto_id = p.id
      WHERE ci.carrito_id = ? AND p.activo = 1
      ORDER BY ci.fecha_agregado DESC
    `, [carritoId]);

    const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({
      success: true,
      carrito: {
        id: carritoId,
        items: items,
        total: total.toFixed(2),
        cantidad_items: items.length
      }
    });

  } catch (error) {
    console.error('Error al obtener carrito:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el carrito'
    });
  } finally {
    connection.release();
  }
};

// Agregar producto al carrito
exports.agregarAlCarrito = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { cliente_id, producto_id, cantidad = 1 } = req.body;
    const clienteId = cliente_id;

    if (!clienteId) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'cliente_id es requerido'
      });
    }

    if (!producto_id) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'ID de producto requerido'
      });
    }

    // Verificar que el producto existe y tiene stock
    const [productos] = await connection.query(
      'SELECT id, nombre, precio, stock, activo FROM producto WHERE id = ?',
      [producto_id]
    );

    if (productos.length === 0 || !productos[0].activo) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado o no disponible'
      });
    }

    const producto = productos[0];

    if (producto.stock < cantidad) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles`
      });
    }

    // Obtener o crear carrito
    let [carritos] = await connection.query(
      'SELECT id_carrito FROM carrito WHERE cliente_id = ?',
      [clienteId]
    );

    let carritoId;
    if (carritos.length === 0) {
      const [result] = await connection.query(
        'INSERT INTO carrito (cliente_id, fecha_creacion) VALUES (?, NOW())',
        [clienteId]
      );
      carritoId = result.insertId;
    } else {
      carritoId = carritos[0].id_carrito;
    }

    // Verificar si el producto ya está en el carrito
    const [itemsExistentes] = await connection.query(
      'SELECT id_item, cantidad FROM carrito_item WHERE carrito_id = ? AND producto_id = ?',
      [carritoId, producto_id]
    );

    if (itemsExistentes.length > 0) {
      // Actualizar cantidad
      const nuevaCantidad = itemsExistentes[0].cantidad + cantidad;
      
      if (producto.stock < nuevaCantidad) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `No se puede agregar. Stock máximo: ${producto.stock}`
        });
      }

      await connection.query(
        'UPDATE carrito_item SET cantidad = ? WHERE id_item = ?',
        [nuevaCantidad, itemsExistentes[0].id_item]
      );
    } else {
      // Insertar nuevo item
      await connection.query(
        'INSERT INTO carrito_item (carrito_id, producto_id, cantidad, fecha_agregado) VALUES (?, ?, ?, NOW())',
        [carritoId, producto_id, cantidad]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: `${producto.nombre} agregado al carrito`,
      producto: {
        id: producto.id,
        nombre: producto.nombre,
        cantidad: cantidad
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar producto al carrito'
    });
  } finally {
    connection.release();
  }
};

// Actualizar cantidad de un item
exports.actualizarCantidad = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { itemId } = req.params;
    const { cantidad, cliente_id } = req.body;
    const clienteId = cliente_id;

    if (!clienteId) {
      return res.status(400).json({
        success: false,
        message: 'cliente_id es requerido'
      });
    }

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({
        success: false,
        message: 'Cantidad inválida'
      });
    }

    // Verificar que el item pertenece al usuario
    const [items] = await connection.query(`
      SELECT ci.id_item, ci.producto_id, p.stock, p.nombre
      FROM carrito_item ci
      INNER JOIN carrito c ON ci.carrito_id = c.id_carrito
      INNER JOIN producto p ON ci.producto_id = p.id
      WHERE ci.id_item = ? AND c.cliente_id = ?
    `, [itemId, clienteId]);

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado'
      });
    }

    if (items[0].stock < cantidad) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Máximo: ${items[0].stock}`
      });
    }

    await connection.query(
      'UPDATE carrito_item SET cantidad = ? WHERE id_item = ?',
      [cantidad, itemId]
    );

    res.json({
      success: true,
      message: 'Cantidad actualizada',
      item: {
        id: itemId,
        cantidad: cantidad,
        producto: items[0].nombre
      }
    });

  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cantidad'
    });
  } finally {
    connection.release();
  }
};

// Eliminar item del carrito
exports.eliminarItem = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { itemId } = req.params;
    const { cliente_id } = req.body;
    const clienteId = cliente_id;

    if (!clienteId) {
      return res.status(400).json({
        success: false,
        message: 'cliente_id es requerido'
      });
    }

    // Verificar que el item pertenece al usuario
    const [items] = await connection.query(`
      SELECT ci.id_item
      FROM carrito_item ci
      INNER JOIN carrito c ON ci.carrito_id = c.id_carrito
      WHERE ci.id_item = ? AND c.cliente_id = ?
    `, [itemId, clienteId]);

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado'
      });
    }

    await connection.query('DELETE FROM carrito_item WHERE id_item = ?', [itemId]);

    res.json({
      success: true,
      message: 'Producto eliminado del carrito'
    });

  } catch (error) {
    console.error('Error al eliminar item:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto'
    });
  } finally {
    connection.release();
  }
};

// Vaciar carrito
exports.vaciarCarrito = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { cliente_id } = req.body;
    const clienteId = cliente_id;

    if (!clienteId) {
      return res.status(400).json({
        success: false,
        message: 'cliente_id es requerido'
      });
    }

    const [carritos] = await connection.query(
      'SELECT id_carrito FROM carrito WHERE cliente_id = ?',
      [clienteId]
    );

    if (carritos.length > 0) {
      await connection.query(
        'DELETE FROM carrito_item WHERE carrito_id = ?',
        [carritos[0].id_carrito]
      );
    }

    res.json({
      success: true,
      message: 'Carrito vaciado'
    });

  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al vaciar el carrito'
    });
  } finally {
    connection.release();
  }
};

// Procesar checkout (crear pedido desde carrito)
exports.procesarCheckout = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { cliente_id, direccion_entrega, telefono, notas } = req.body;
    const clienteId = cliente_id;

    // ============ VALIDACIONES ============

    if (!clienteId) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'cliente_id es requerido'
      });
    }

    // Validar dirección
    if (!direccion_entrega || typeof direccion_entrega !== 'string') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'La dirección de entrega es requerida'
      });
    }

    const direccionTrimmed = direccion_entrega.trim();
    if (direccionTrimmed.length < 5) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'La dirección debe tener al menos 5 caracteres'
      });
    }

    if (direccionTrimmed.length > 255) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'La dirección no puede exceder 255 caracteres'
      });
    }

    // Validar teléfono
    if (!telefono || typeof telefono !== 'string') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'El teléfono de contacto es requerido'
      });
    }

    const soloDigitos = telefono.replace(/\D/g, '');
    if (soloDigitos.length < 7) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'El teléfono debe tener al menos 7 dígitos'
      });
    }

    if (soloDigitos.length > 10) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'El teléfono no puede tener más de 10 dígitos'
      });
    }

    // Validar notas (opcional pero con límite)
    if (notas && typeof notas === 'string') {
      if (notas.length > 500) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Las notas no pueden exceder 500 caracteres'
        });
      }
    }

    // ============ PROCESAR CHECKOUT ============

    // Obtener carrito y sus items
    const [carritos] = await connection.query(
      'SELECT id_carrito FROM carrito WHERE cliente_id = ?',
      [clienteId]
    );

    if (carritos.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Carrito vacío'
      });
    }

    const carritoId = carritos[0].id_carrito;

    const [items] = await connection.query(`
      SELECT ci.producto_id, ci.cantidad, p.precio, p.stock, p.nombre
      FROM carrito_item ci
      INNER JOIN producto p ON ci.producto_id = p.id
      WHERE ci.carrito_id = ? AND p.activo = 1
    `, [carritoId]);

    if (items.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'No hay productos en el carrito'
      });
    }

    // Verificar stock de todos los productos
    for (const item of items) {
      if (item.stock < item.cantidad) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${item.nombre}`
        });
      }
    }

    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    // Crear pedido
    const [pedidoResult] = await connection.query(`
      INSERT INTO pedido 
      (cliente_id, fecha_pedido, total, estado, direccion_entrega, telefono_entrega, notas)
      VALUES (?, NOW(), ?, 'pendiente', ?, ?, ?)
    `, [clienteId, total, direccionTrimmed, soloDigitos, notas ? notas.trim() : null]);

    const pedidoId = pedidoResult.insertId;

    // Insertar detalles del pedido y actualizar stock
    for (const item of items) {
      await connection.query(`
        INSERT INTO pedido_detalle 
        (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `, [
        pedidoId,
        item.producto_id,
        item.cantidad,
        item.precio,
        item.precio * item.cantidad
      ]);

      // Reducir stock
      await connection.query(
        'UPDATE producto SET stock = stock - ? WHERE id = ?',
        [item.cantidad, item.producto_id]
      );
    }

    // Vaciar carrito
    await connection.query('DELETE FROM carrito_item WHERE carrito_id = ?', [carritoId]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Pedido creado exitosamente',
      pedido: {
        id: pedidoId,
        total: total.toFixed(2),
        items: items.length
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error en checkout:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al procesar el pedido'
    });
  } finally {
    connection.release();
  }
};
