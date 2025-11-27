let todosPedidos = [];
let pedidosFiltrados = [];

// Verificar admin al cargar
(async function() {
    if (!api.isAuthenticated()) {
        window.location.href = '../login.html?redirect=admin/pedidos';
        return;
    }

    try {
        const response = await api.getProfile();
        if (!response.success || response.data.rol !== 'admin') {
            Swal.fire({
                title: 'Acceso Denegado',
                text: 'No tienes permisos de administrador',
                icon: 'error'
            }).then(() => window.location.href = '../index.html');
            return;
        }
        await cargarPedidos();
    } catch (error) {
        window.location.href = '../login.html';
    }
})();

// Cargar todos los pedidos
async function cargarPedidos() {
    try {
        const response = await api.getTodosPedidos();
        
        if (response.success) {
            todosPedidos = response.data;
            pedidosFiltrados = todosPedidos;
            actualizarEstadisticas();
            renderizarPedidos();
        }
    } catch (error) {
        console.error('Error cargando pedidos:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los pedidos',
            icon: 'error'
        });
    }
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    const pendientes = todosPedidos.filter(p => p.estado === 'pendiente').length;
    const preparacion = todosPedidos.filter(p => p.estado === 'en_preparacion').length;
    const entregados = todosPedidos.filter(p => p.estado === 'entregado').length;

    document.getElementById('countPendientes').textContent = pendientes;
    document.getElementById('countPreparacion').textContent = preparacion;
    document.getElementById('countEntregados').textContent = entregados;
}

// Filtrar pedidos
function filtrarPedidos() {
    const estadoSeleccionado = document.getElementById('filtroEstado').value;
    const busqueda = document.getElementById('buscarPedido').value.toLowerCase();

    pedidosFiltrados = todosPedidos.filter(pedido => {
        const coincideEstado = estadoSeleccionado === 'todos' || pedido.estado === estadoSeleccionado;
        const coincideBusqueda = busqueda === '' || 
            pedido.id.toString().includes(busqueda) ||
            pedido.cliente_nombre.toLowerCase().includes(busqueda) ||
            pedido.cliente_email.toLowerCase().includes(busqueda);

        return coincideEstado && coincideBusqueda;
    });

    renderizarPedidos();
}

// Renderizar tabla de pedidos
function renderizarPedidos() {
    const tbody = document.getElementById('pedidosTable');

    if (pedidosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    <i class="fas fa-inbox"></i> No se encontraron pedidos
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pedidosFiltrados.map(pedido => {
        const fecha = new Date(pedido.fecha_pedido).toLocaleString('es-CO');
        const total = parseFloat(pedido.total).toLocaleString('es-CO');
        
        return `
            <tr>
                <td><strong>#${pedido.id}</strong></td>
                <td>${fecha}</td>
                <td>
                    <div>${pedido.cliente_nombre}</div>
                    <small class="text-muted">${pedido.cliente_email}</small>
                </td>
                <td><strong>$${total}</strong></td>
                <td>
                    <span class="badge-estado badge-${pedido.estado}">
                        ${formatearEstado(pedido.estado)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="verDetalle(${pedido.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="cambiarEstado(${pedido.id}, '${pedido.estado}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Formatear estado
function formatearEstado(estado) {
    const estados = {
        'pendiente': 'Pendiente',
        'confirmado': 'Confirmado',
        'en_preparacion': 'En Preparación',
        'listo': 'Listo',
        'entregado': 'Entregado',
        'cancelado': 'Cancelado'
    };
    return estados[estado] || estado;
}

// Ver detalle del pedido
async function verDetalle(pedidoId) {
    const pedido = todosPedidos.find(p => p.id === pedidoId);
    
    if (!pedido) return;

    document.getElementById('modalPedidoId').textContent = pedido.id;
    
    // Los detalles ya vienen parseados del backend
    const detalles = Array.isArray(pedido.detalles) ? pedido.detalles : [];
    
    const htmlContent = `
        <div class="row">
            <div class="col-md-6">
                <h6><i class="fas fa-user"></i> Información del Cliente</h6>
                <p><strong>Nombre:</strong> ${pedido.cliente_nombre}</p>
                <p><strong>Email:</strong> ${pedido.cliente_email}</p>
                <p><strong>Teléfono:</strong> ${pedido.cliente_telefono || 'No especificado'}</p>
            </div>
            <div class="col-md-6">
                <h6><i class="fas fa-shipping-fast"></i> Información de Entrega</h6>
                <p><strong>Dirección:</strong> ${pedido.direccion_entrega}</p>
                <p><strong>Teléfono:</strong> ${pedido.telefono_entrega || 'No especificado'}</p>
                <p><strong>Estado:</strong> 
                    <span class="badge-estado badge-${pedido.estado}">
                        ${formatearEstado(pedido.estado)}
                    </span>
                </p>
            </div>
        </div>
        <hr>
        <h6><i class="fas fa-box"></i> Productos del Pedido</h6>
        <table class="table table-sm">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${detalles.map(d => `
                    <tr>
                        <td>${d.producto_nombre}</td>
                        <td>${d.cantidad}</td>
                        <td>$${parseFloat(d.precio_unitario).toLocaleString('es-CO')}</td>
                        <td><strong>$${parseFloat(d.subtotal).toLocaleString('es-CO')}</strong></td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" class="text-end"><strong>TOTAL:</strong></td>
                    <td><strong>$${parseFloat(pedido.total).toLocaleString('es-CO')}</strong></td>
                </tr>
            </tfoot>
        </table>
        ${pedido.notas ? `
            <hr>
            <h6><i class="fas fa-comment"></i> Notas del Cliente</h6>
            <p class="text-muted">${pedido.notas}</p>
        ` : ''}
    `;
    
    document.getElementById('modalPedidoContent').innerHTML = htmlContent;
    
    const modal = new bootstrap.Modal(document.getElementById('detallePedidoModal'));
    modal.show();
}

// Cambiar estado del pedido
async function cambiarEstado(pedidoId, estadoActual) {
    const pedido = todosPedidos.find(p => p.id === pedidoId);
    
    const { value: nuevoEstado } = await Swal.fire({
        title: `Cambiar Estado del Pedido #${pedidoId}`,
        html: `
            <p><strong>Cliente:</strong> ${pedido.cliente_nombre}</p>
            <p><strong>Estado actual:</strong> <span class="badge-estado badge-${estadoActual}">${formatearEstado(estadoActual)}</span></p>
            <hr>
            <label class="form-label"><strong>Nuevo Estado:</strong></label>
        `,
        input: 'select',
        inputOptions: {
            'pendiente': 'Pendiente',
            'confirmado': 'Confirmado',
            'en_preparacion': 'En Preparación',
            'listo': 'Listo',
            'entregado': 'Entregado',
            'cancelado': 'Cancelado'
        },
        inputValue: estadoActual,
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'Debes seleccionar un estado';
            }
        }
    });

    if (nuevoEstado && nuevoEstado !== estadoActual) {
        try {
            const response = await api.updateEstadoPedido(pedidoId, nuevoEstado);
            
            if (response.success) {
                Swal.fire({
                    title: '¡Estado Actualizado!',
                    text: `El pedido #${pedidoId} ahora está: ${formatearEstado(nuevoEstado)}`,
                    icon: 'success',
                    timer: 2000
                });
                await cargarPedidos();
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo actualizar el estado',
                icon: 'error'
            });
        }
    }
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    const result = await Swal.fire({
        title: '¿Cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await api.logout();
        } catch (error) {
            console.log('Error al cerrar sesión:', error);
        } finally {
            api.clearAuth();
            window.location.href = '../login.html';
        }
    }
});
