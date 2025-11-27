// Verificar autenticación
if (!api.isAuthenticated()) {
    console.error('No autenticado - redirigiendo al index');
    window.location.href = '../index.html';
} else if (!api.isAdmin()) {
    const user = api.getUser();
    console.error('No es admin - Usuario:', user);
    alert('Acceso denegado. Solo administradores pueden acceder a esta página.\nRol actual: ' + (user?.rol || 'sin rol'));
    window.location.href = '../index.html';
}

// Variables globales
let usuarios = [];
let usuarioActual = null;

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    usuarioActual = api.getUser();
    await cargarUsuarios();
    
    // Event listeners
    document.getElementById('busquedaInput').addEventListener('input', filtrarUsuarios);
    document.getElementById('filtroRol').addEventListener('change', filtrarUsuarios);
});

// Cargar usuarios
async function cargarUsuarios() {
    try {
        const response = await api.getUsuarios();
        if (response.success) {
            usuarios = response.data;
            actualizarEstadisticas();
            renderizarUsuarios(usuarios);
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los usuarios',
            icon: 'error'
        });
    }
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    const totalUsuarios = usuarios.length;
    const totalAdmins = usuarios.filter(u => u.rol === 'admin').length;
    const totalClientes = usuarios.filter(u => u.rol === 'cliente').length;
    
    document.getElementById('totalUsuarios').textContent = totalUsuarios;
    document.getElementById('totalAdmins').textContent = totalAdmins;
    document.getElementById('totalClientes').textContent = totalClientes;
}

// Renderizar usuarios
function renderizarUsuarios(usuariosAMostrar) {
    const tbody = document.getElementById('tablaUsuarios');
    
    if (usuariosAMostrar.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="fas fa-inbox fa-3x mb-3"></i>
                    <p>No hay usuarios para mostrar</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = usuariosAMostrar.map(usuario => {
        const iniciales = usuario.nombre.split(' ')
            .map(n => n.charAt(0))
            .slice(0, 2)
            .join('')
            .toUpperCase();
        
        const fechaRegistro = new Date(usuario.fecha_registro).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const esUsuarioActual = usuario.id === usuarioActual.id;
        
        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="user-avatar me-2">
                            ${iniciales}
                        </div>
                        <div>
                            <strong>${usuario.nombre}</strong>
                            ${esUsuarioActual ? '<span class="badge bg-info ms-2">Tú</span>' : ''}
                        </div>
                    </div>
                </td>
                <td>${usuario.email}</td>
                <td>${usuario.telefono || '-'}</td>
                <td>
                    <span class="badge ${usuario.rol === 'admin' ? 'badge-admin' : 'badge-cliente'}">
                        ${usuario.rol === 'admin' ? '<i class="fas fa-shield-alt"></i> Admin' : '<i class="fas fa-user"></i> Cliente'}
                    </span>
                </td>
                <td>
                    <small class="text-muted">${fechaRegistro}</small>
                </td>
                <td>
                    ${!esUsuarioActual ? `
                        <button class="btn btn-sm btn-warning" onclick="cambiarRol(${usuario.id}, '${usuario.nombre}', '${usuario.rol}')" 
                                title="Cambiar rol">
                            <i class="fas fa-user-cog"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usuario.id}, '${usuario.nombre}')" 
                                title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : `
                        <span class="text-muted">
                            <i class="fas fa-lock"></i>
                        </span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

// Filtrar usuarios
function filtrarUsuarios() {
    const busqueda = document.getElementById('busquedaInput').value.toLowerCase();
    const rol = document.getElementById('filtroRol').value;
    
    let usuariosFiltrados = usuarios;
    
    // Filtrar por búsqueda
    if (busqueda) {
        usuariosFiltrados = usuariosFiltrados.filter(u => 
            u.nombre.toLowerCase().includes(busqueda) ||
            u.email.toLowerCase().includes(busqueda)
        );
    }
    
    // Filtrar por rol
    if (rol) {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.rol === rol);
    }
    
    renderizarUsuarios(usuariosFiltrados);
}

// Limpiar filtros
function limpiarFiltros() {
    document.getElementById('busquedaInput').value = '';
    document.getElementById('filtroRol').value = '';
    renderizarUsuarios(usuarios);
}

// Cambiar rol de usuario
async function cambiarRol(id, nombre, rolActual) {
    const nuevoRol = rolActual === 'admin' ? 'cliente' : 'admin';
    const rolTexto = nuevoRol === 'admin' ? 'Administrador' : 'Cliente';
    
    const result = await Swal.fire({
        title: '¿Cambiar rol de usuario?',
        html: `
            <p>Usuario: <strong>${nombre}</strong></p>
            <p>Rol actual: <strong>${rolActual === 'admin' ? 'Administrador' : 'Cliente'}</strong></p>
            <p>Nuevo rol: <strong>${rolTexto}</strong></p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ffc107',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, cambiar rol',
        cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
        try {
            Swal.fire({
                title: 'Actualizando...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            const response = await api.updateUsuarioRol(id, nuevoRol);
            
            if (response.success) {
                Swal.fire({
                    title: '¡Rol Actualizado!',
                    text: `${nombre} ahora es ${rolTexto}`,
                    icon: 'success',
                    timer: 2000
                });
                
                await cargarUsuarios();
            }
        } catch (error) {
            console.error('Error cambiando rol:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo cambiar el rol del usuario',
                icon: 'error'
            });
        }
    }
}

// Eliminar usuario
async function eliminarUsuario(id, nombre) {
    const result = await Swal.fire({
        title: '¿Eliminar usuario?',
        html: `
            <p>Se eliminará permanentemente a:</p>
            <p><strong>${nombre}</strong></p>
            <p class="text-danger mb-0">Esta acción no se puede deshacer</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        input: 'checkbox',
        inputValue: 0,
        inputPlaceholder: 'Entiendo que esta acción es irreversible',
        inputValidator: (result) => {
            return !result && 'Debes confirmar para continuar';
        }
    });
    
    if (result.isConfirmed) {
        try {
            Swal.fire({
                title: 'Eliminando...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            const response = await api.deleteUsuario(id);
            
            if (response.success) {
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El usuario ha sido eliminado',
                    icon: 'success',
                    timer: 2000
                });
                
                await cargarUsuarios();
            }
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo eliminar el usuario',
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
        text: 'Serás redirigido a la página principal',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
        try {
            await api.logout();
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            api.clearAuth();
            window.location.href = '../index.html';
        }
    }
});
