/**
 * Gestor del Carrito de Compras
 * Maneja toda la lógica del carrito con la API separada
 */
class CarritoManager {
  constructor() {
    this.apiUrl = 'http://localhost:3002/api/carrito';
    this.carritoItems = [];
    this.total = 0;
    this.init();
  }

  init() {
    this.verificarSesion();
    if (this.usuarioLogueado) {
      this.cargarCarrito();
    }
    this.setupEventListeners();
  }

  verificarSesion() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    this.usuarioLogueado = !!token && !!usuario.id;
    
    if (this.usuarioLogueado) {
      this.mostrarBotonesCarrito();
      this.actualizarContadorCarrito();
    } else {
      this.ocultarBotonesCarrito();
    }
  }

  mostrarBotonesCarrito() {
    // Mostrar ícono del carrito en el header
    const headerCarrito = document.getElementById('header-carrito');
    if (headerCarrito) {
      headerCarrito.style.display = 'flex';
    }

    // Mostrar botón flotante
    const carritoFloatBtn = document.getElementById('carritoFloatBtn');
    if (carritoFloatBtn) {
      carritoFloatBtn.style.display = 'flex';
    }

    // Mostrar botones "Agregar al carrito" en cada producto
    document.querySelectorAll('.btn-agregar-carrito').forEach(btn => {
      btn.style.display = 'inline-block';
    });
  }

  ocultarBotonesCarrito() {
    const headerCarrito = document.getElementById('header-carrito');
    if (headerCarrito) {
      headerCarrito.style.display = 'none';
    }

    const carritoFloatBtn = document.getElementById('carritoFloatBtn');
    if (carritoFloatBtn) {
      carritoFloatBtn.style.display = 'none';
    }

    document.querySelectorAll('.btn-agregar-carrito').forEach(btn => {
      btn.style.display = 'none';
    });
  }

  async cargarCarrito() {
    if (!this.usuarioLogueado) return;

    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      console.log('🔄 Cargando carrito para cliente:', usuario.id);
      
      const response = await fetch(`${this.apiUrl}?cliente_id=${usuario.id}`);

      if (!response.ok) {
        console.error('❌ Error HTTP:', response.status);
        const errorText = await response.text();
        console.error('❌ Respuesta del servidor:', errorText);
        this.carritoItems = [];
        this.total = 0;
        this.actualizarContadorCarrito();
        return { items: [], total: 0, cantidad_items: 0 };
      }

      const data = await response.json();
      console.log('✅ Carrito cargado:', data);
      
      if (data.success) {
        this.carritoItems = data.carrito.items || [];
        this.total = parseFloat(data.carrito.total) || 0;
        this.actualizarContadorCarrito();
        return data.carrito;
      } else {
        console.error('❌ Error en respuesta:', data.message);
        this.carritoItems = [];
        this.total = 0;
        this.actualizarContadorCarrito();
        return { items: [], total: 0, cantidad_items: 0 };
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      this.carritoItems = [];
      this.total = 0;
      this.actualizarContadorCarrito();
      return { items: [], total: 0, cantidad_items: 0 };
    }
  }

  async agregarAlCarrito(productoId, cantidad = 1) {
    console.log('🛒 agregarAlCarrito llamado con:', { productoId, cantidad });
    
    if (!this.usuarioLogueado) {
      Swal.fire({
        icon: 'warning',
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para agregar productos al carrito',
        confirmButtonText: 'Iniciar sesión',
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login.html';
        }
      });
      return;
    }

    // Validar que productoId sea válido
    if (!productoId || productoId === null || isNaN(productoId)) {
      console.error('❌ ID de producto inválido:', productoId);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ID de producto inválido'
      });
      return;
    }

    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const payload = { 
        cliente_id: usuario.id,
        producto_id: parseInt(productoId), 
        cantidad: parseInt(cantidad) || 1
      };
      
      console.log('📤 Enviando a API:', payload);
      
      const response = await fetch(`${this.apiUrl}/agregar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Agregado!',
          text: data.message,
          timer: 2000,
          showConfirmButton: false
        });
        
        await this.cargarCarrito();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message
        });
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar el producto'
      });
    }
  }

  async actualizarCantidad(itemId, cantidad) {
    if (cantidad < 1) return;

    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const response = await fetch(`${this.apiUrl}/item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          cliente_id: usuario.id,
          cantidad 
        })
      });

      const data = await response.json();

      if (data.success) {
        await this.cargarCarrito();
        this.renderCarritoModal();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message,
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  }

  async eliminarItem(itemId) {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Se quitará del carrito',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    });

    if (!result.isConfirmed) return;

    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const response = await fetch(`${this.apiUrl}/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cliente_id: usuario.id })
      });

      const data = await response.json();

      if (data.success) {
        await this.cargarCarrito();
        this.renderCarritoModal();
        
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          toast: true,
          position: 'top-end',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error al eliminar item:', error);
    }
  }

  async vaciarCarrito() {
    this.cerrarModalCarrito();
    
    const result = await Swal.fire({
      title: '¿Vaciar carrito?',
      text: 'Se eliminarán todos los productos',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    });

    if (!result.isConfirmed) {
      this.abrirModalCarrito();
      return;
    }

    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const response = await fetch(`${this.apiUrl}/vaciar`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cliente_id: usuario.id })
      });

      const data = await response.json();

      if (data.success) {
        await this.cargarCarrito();
        this.renderCarritoModal();
        
        Swal.fire({
          icon: 'success',
          title: 'Carrito vaciado',
          toast: true,
          position: 'top-end',
          timer: 2000,
          showConfirmButton: false
        });
        
        this.cerrarModalCarrito();
      }
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
    }
  }

  async procesarCheckout(datosEntrega) {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      
      // El API de carrito (3002) requiere cliente_id porque no usa autenticación JWT
      const datosCompletos = {
        cliente_id: usuario.id,
        ...datosEntrega
      };

      const response = await fetch(`${this.apiUrl}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosCompletos)
      });

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Pedido creado!',
          html: `
            <p><strong>Número de pedido:</strong> #${data.pedido.id}</p>
            <p><strong>Total:</strong> $${parseFloat(data.pedido.total).toLocaleString('es-CO')}</p>
            <p><strong>Items:</strong> ${data.pedido.items}</p>
            <hr>
            <p>Recibirás una confirmación por email</p>
          `,
          confirmButtonText: 'Entendido'
        });
        
        await this.cargarCarrito();
        this.cerrarModalCarrito();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || data.error || 'No se pudo procesar el pedido'
        });
      }
    } catch (error) {
      console.error('Error en checkout:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo procesar el pedido'
      });
    }
  }

  actualizarContadorCarrito() {
    const contador = document.getElementById('carrito-contador');
    if (contador) {
      const total = this.carritoItems.length;
      contador.textContent = total;
      contador.style.display = total > 0 ? 'inline-block' : 'none';
    }
    this.actualizarBadgeFlotante();
  }

  actualizarBadgeFlotante() {
    const badge = document.getElementById('carritoFloatBadge');
    if (badge) {
      const total = this.carritoItems.length;
      badge.textContent = total;
      badge.style.display = total > 0 ? 'flex' : 'none';
    }
  }

  setupEventListeners() {
    // Botón ver carrito (header)
    const btnVerCarrito = document.getElementById('btn-ver-carrito');
    if (btnVerCarrito) {
      btnVerCarrito.addEventListener('click', () => this.abrirModalCarrito());
    }

    // Botón flotante del carrito
    const carritoFloatBtn = document.getElementById('carritoFloatBtn');
    if (carritoFloatBtn) {
      carritoFloatBtn.addEventListener('click', () => this.abrirModalCarrito());
    }

    // Cerrar modal del carrito
    const closeCarritoModal = document.getElementById('closeCarritoModal');
    if (closeCarritoModal) {
      closeCarritoModal.addEventListener('click', () => this.cerrarModalCarrito());
    }

    // Cerrar modal al hacer click fuera
    const carritoModal = document.getElementById('carritoModal');
    if (carritoModal) {
      carritoModal.addEventListener('click', (e) => {
        if (e.target === carritoModal) {
          this.cerrarModalCarrito();
        }
      });
    }

    // Botón realizar pedido
    const realizarPedidoBtn = document.getElementById('realizarPedidoBtn');
    if (realizarPedidoBtn) {
      realizarPedidoBtn.addEventListener('click', () => this.irACheckout());
    }

    // Actualizar al iniciar sesión
    window.addEventListener('login-success', () => {
      this.verificarSesion();
      if (this.usuarioLogueado) {
        this.cargarCarrito();
      }
    });

    // Limpiar al cerrar sesión
    window.addEventListener('logout', () => {
      this.carritoItems = [];
      this.total = 0;
      this.usuarioLogueado = false;
      this.ocultarBotonesCarrito();
      this.actualizarContadorCarrito();
      this.actualizarBadgeFlotante();
    });
  }

  async abrirModalCarrito() {
    console.log('🛒 Abriendo modal del carrito...');
    
    try {
      await this.cargarCarrito();
    } catch (error) {
      console.error('Error al cargar carrito para modal:', error);
    }
    
    this.renderCarritoModal();
    
    const modal = document.getElementById('carritoModal');
    if (modal) {
      console.log('✅ Modal encontrado, mostrando...');
      modal.classList.add('show');
    } else {
      console.error('❌ No se encontró el elemento carritoModal');
    }
  }

  cerrarModalCarrito() {
    const modal = document.getElementById('carritoModal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  renderCarritoModal() {
    console.log('🎨 Renderizando modal con items:', this.carritoItems);
    
    const modalBody = document.getElementById('carritoModalBody');
    const modalFooter = document.getElementById('carritoModalFooter');
    const carritoVacio = document.getElementById('carritoVacio');
    const carritoTotal = document.getElementById('carritoTotal');

    if (!modalBody) {
      console.error('❌ No se encontró carritoModalBody');
      return;
    }

    if (!this.carritoItems || this.carritoItems.length === 0) {
      console.log('📭 Carrito vacío, mostrando mensaje');
      // Mostrar mensaje de carrito vacío
      if (carritoVacio) carritoVacio.style.display = 'block';
      if (modalFooter) modalFooter.style.display = 'none';
      
      // Limpiar items anteriores
      const itemsExistentes = modalBody.querySelectorAll('.carrito-item');
      itemsExistentes.forEach(item => item.remove());
      return;
    }

    console.log('📦 Mostrando', this.carritoItems.length, 'items en el carrito');
    
    // Ocultar mensaje de vacío
    if (carritoVacio) carritoVacio.style.display = 'none';
    if (modalFooter) modalFooter.style.display = 'block';

    // Limpiar items anteriores
    const itemsExistentes = modalBody.querySelectorAll('.carrito-item');
    itemsExistentes.forEach(item => item.remove());

    // Renderizar items
    this.carritoItems.forEach((item, index) => {
      console.log(`🛍️ Renderizando item ${index + 1}:`, item);
      const itemElement = this.crearElementoCarrito(item);
      modalBody.insertBefore(itemElement, carritoVacio);
    });

    // Actualizar total
    if (carritoTotal) {
      carritoTotal.textContent = `$${parseFloat(this.total).toFixed(2)}`;
      console.log('💰 Total actualizado:', this.total);
    }
  }

  crearElementoCarrito(item) {
    console.log('🏗️ Creando elemento para:', item.nombre);
    
    const div = document.createElement('div');
    div.className = 'carrito-item';
    
    // Construir la URL de la imagen correctamente
    let imagenUrl = item.imagen_url || '/img/default.jpg';
    if (imagenUrl && !imagenUrl.startsWith('http') && !imagenUrl.startsWith('/')) {
      imagenUrl = '/img/' + imagenUrl;
    }
    
    const subtotal = (parseFloat(item.precio) * parseInt(item.cantidad)).toFixed(2);
    
    div.innerHTML = `
      <img src="${imagenUrl}" 
           alt="${item.nombre}" 
           class="carrito-item-img"
           onerror="this.src='/img/default.jpg'">
      <div class="carrito-item-info">
        <div>
          <div class="carrito-item-nombre">${item.nombre}</div>
          <div class="carrito-item-precio">$${parseFloat(item.precio).toFixed(2)} c/u</div>
          <div class="carrito-item-precio" style="color: #667eea; font-weight: bold;">
            Subtotal: $${subtotal}
          </div>
        </div>
        <div class="carrito-item-cantidad">
          <button onclick="carritoManager.actualizarCantidad(${item.id_item}, ${item.cantidad - 1})" 
                  ${item.cantidad <= 1 ? 'disabled' : ''}
                  title="Disminuir cantidad">
            <i class="fas fa-minus"></i>
          </button>
          <span>${item.cantidad}</span>
          <button onclick="carritoManager.actualizarCantidad(${item.id_item}, ${item.cantidad + 1})"
                  ${item.cantidad >= item.stock ? 'disabled' : ''}
                  title="Aumentar cantidad">
            <i class="fas fa-plus"></i>
          </button>
          <button class="carrito-item-eliminar" 
                  onclick="carritoManager.eliminarItem(${item.id_item})"
                  title="Eliminar del carrito">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    return div;
  }

  async irACheckout() {
    // Verificar que hay items en el carrito
    if (!this.carritoItems || this.carritoItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Carrito vacío',
        text: 'Agrega productos antes de realizar el pedido',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    this.cerrarModalCarrito();
    
    const { value: formValues } = await Swal.fire({
      title: 'Datos de Entrega',
      html: `
        <div style="text-align: left; padding: 0 20px;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Dirección de entrega <span style="color: red;">*</span></label>
            <input id="swal-direccion" class="swal2-input" style="margin: 0; width: 100%;" placeholder="Ej: Calle 123, Apartamento 45" maxlength="255">
            <small style="color: #666; display: block; margin-top: 3px;">Mínimo 5 caracteres</small>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Teléfono de contacto <span style="color: red;">*</span></label>
            <input id="swal-telefono" type="tel" class="swal2-input" style="margin: 0; width: 100%;" placeholder="Ej: 3001234567" maxlength="10" inputmode="numeric">
            <small style="color: #666; display: block; margin-top: 3px;">Máximo 10 dígitos (sin espacios ni caracteres especiales)</small>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Notas adicionales (opcional)</label>
            <textarea id="swal-notas" class="swal2-textarea" style="margin: 0; width: 100%; resize: vertical; min-height: 80px;" placeholder="Instrucciones especiales, referencias, etc." maxlength="500"></textarea>
            <small style="color: #666; display: block; margin-top: 3px;"><span id="swal-notas-count">0</span>/500 caracteres</small>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Confirmar Pedido',
      cancelButtonText: 'Cancelar',
      width: '600px',
      didOpen: (modal) => {
        // Agregar contador de caracteres para notas
        const notasInput = document.getElementById('swal-notas');
        const notasCount = document.getElementById('swal-notas-count');
        
        notasInput.addEventListener('input', () => {
          notasCount.textContent = notasInput.value.length;
        });
        
        // Validar solo dígitos en teléfono
        const telefonoInput = document.getElementById('swal-telefono');
        telefonoInput.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
        });
      },
      preConfirm: () => {
        const direccion = document.getElementById('swal-direccion').value.trim();
        const telefono = document.getElementById('swal-telefono').value.trim();
        const notas = document.getElementById('swal-notas').value.trim();
        
        // Validación de dirección
        if (!direccion) {
          Swal.showValidationMessage('La dirección de entrega es obligatoria');
          return false;
        }
        
        if (direccion.length < 5) {
          Swal.showValidationMessage('La dirección debe tener al menos 5 caracteres');
          return false;
        }
        
        if (direccion.length > 255) {
          Swal.showValidationMessage('La dirección no puede exceder 255 caracteres');
          return false;
        }
        
        // Validación de teléfono
        if (!telefono) {
          Swal.showValidationMessage('El teléfono de contacto es obligatorio');
          return false;
        }
        
        const soloDigitos = telefono.replace(/\D/g, '');
        if (soloDigitos.length < 7) {
          Swal.showValidationMessage('El teléfono debe tener al menos 7 dígitos');
          return false;
        }
        
        if (soloDigitos.length > 10) {
          Swal.showValidationMessage('El teléfono no puede tener más de 10 dígitos');
          return false;
        }
        
        // Validación de notas (opcional pero con límite)
        if (notas.length > 500) {
          Swal.showValidationMessage('Las notas no pueden exceder 500 caracteres');
          return false;
        }
        
        return { 
          direccion_entrega: direccion, 
          telefono: soloDigitos, 
          notas: notas 
        };
      }
    });

    if (formValues) {
      await this.procesarCheckout(formValues);
    }
  }
}

// Inicializar el carrito
const carritoManager = new CarritoManager();

// Exponer función global para agregar al carrito
window.agregarAlCarrito = (productoId, cantidad = 1) => {
  carritoManager.agregarAlCarrito(productoId, cantidad);
};

// Exponer el manager globalmente
window.carritoManager = carritoManager;
