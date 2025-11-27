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
let productos = [];
let categorias = [];
let modalProducto = null;

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    modalProducto = new bootstrap.Modal(document.getElementById('modalProducto'));
    
    await cargarCategorias();
    await cargarProductos();
    
    // Event listeners
    document.getElementById('busquedaInput').addEventListener('input', filtrarProductos);
    document.getElementById('filtroCategoria').addEventListener('change', filtrarProductos);
    document.getElementById('filtroDestacado').addEventListener('change', filtrarProductos);
    document.getElementById('imagen').addEventListener('input', actualizarPreview);
});

// Cargar categorías
async function cargarCategorias() {
    try {
        const response = await api.getCategorias();
        if (response.success) {
            categorias = response.data;
            
            // Llenar select de filtro
            const selectFiltro = document.getElementById('filtroCategoria');
            categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.nombre;
                selectFiltro.appendChild(option);
            });
            
            // Llenar select del modal
            const selectModal = document.getElementById('categoria_id');
            categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.nombre;
                selectModal.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

// Cargar productos
async function cargarProductos() {
    try {
        const response = await api.getProductos();
        if (response.success) {
            productos = response.data;
            renderizarProductos(productos);
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los productos',
            icon: 'error'
        });
    }
}

// Renderizar productos
function renderizarProductos(productosAMostrar) {
    const tbody = document.getElementById('tablaProductos');
    
    if (productosAMostrar.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="fas fa-inbox fa-3x mb-3"></i>
                    <p>No hay productos para mostrar</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = productosAMostrar.map(producto => {
        const categoria = categorias.find(c => c.id === producto.categoria_id);
        const nombreCategoria = categoria ? categoria.nombre : 'Sin categoría';
        
        // Obtener URL de imagen igual que en el index principal
        const imagenUrl = producto.imagen_url || (producto.imagen ? `/img/${producto.imagen}` : null) || '/img/logo.jpg';
        
        return `
            <tr>
                <td>
                    <img src="${imagenUrl}" alt="${producto.nombre}" 
                         class="producto-img" onerror="this.src='/img/logo.jpg'">
                </td>
                <td>
                    <strong>${producto.nombre}</strong>
                    <br>
                    <small class="text-muted">${producto.descripcion.substring(0, 50)}...</small>
                </td>
                <td>
                    <span class="badge bg-secondary">${nombreCategoria}</span>
                </td>
                <td>$${parseFloat(producto.precio).toFixed(2)}</td>
                <td>
                    <span class="badge ${producto.stock < 10 ? 'bg-danger' : 'bg-success'}">
                        ${producto.stock}
                    </span>
                </td>
                <td>
                    ${producto.destacado ? '<span class="badge badge-destacado">★ Destacado</span>' : '-'}
                </td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editarProducto(${producto.id})" 
                            title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${producto.id}, '${producto.nombre}')" 
                            title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filtrar productos
function filtrarProductos() {
    const busqueda = document.getElementById('busquedaInput').value.toLowerCase();
    const categoriaId = document.getElementById('filtroCategoria').value;
    const destacado = document.getElementById('filtroDestacado').value;
    
    let productosFiltrados = productos;
    
    // Filtrar por búsqueda
    if (busqueda) {
        productosFiltrados = productosFiltrados.filter(p => 
            p.nombre.toLowerCase().includes(busqueda) ||
            p.descripcion.toLowerCase().includes(busqueda)
        );
    }
    
    // Filtrar por categoría
    if (categoriaId) {
        productosFiltrados = productosFiltrados.filter(p => 
            p.categoria_id === parseInt(categoriaId)
        );
    }
    
    // Filtrar por destacado
    if (destacado !== '') {
        productosFiltrados = productosFiltrados.filter(p => 
            p.destacado === parseInt(destacado)
        );
    }
    
    renderizarProductos(productosFiltrados);
}

// Limpiar filtros
function limpiarFiltros() {
    document.getElementById('busquedaInput').value = '';
    document.getElementById('filtroCategoria').value = '';
    document.getElementById('filtroDestacado').value = '';
    renderizarProductos(productos);
}

// Abrir modal para nuevo producto
function abrirModalNuevoProducto() {
    document.getElementById('tituloModal').textContent = 'Nuevo Producto';
    document.getElementById('formProducto').reset();
    document.getElementById('productoId').value = '';
    document.getElementById('previewContainer').style.display = 'none';
    modalProducto.show();
}

// Editar producto
async function editarProducto(id) {
    try {
        const response = await api.getProductoById(id);
        
        if (response.success) {
            const producto = response.data;
            
            document.getElementById('tituloModal').textContent = 'Editar Producto';
            document.getElementById('productoId').value = producto.id;
            document.getElementById('nombre').value = producto.nombre;
            document.getElementById('descripcion').value = producto.descripcion;
            document.getElementById('precio').value = producto.precio;
            document.getElementById('categoria_id').value = producto.categoria_id;
            document.getElementById('stock').value = producto.stock;
            document.getElementById('destacado').value = producto.destacado;
            document.getElementById('imagen').value = producto.imagen;
            
            // Mostrar preview con la URL correcta
            if (producto.imagen) {
                const imagenUrl = producto.imagen_url || (producto.imagen ? `/img/${producto.imagen}` : null) || '/img/logo.jpg';
                document.getElementById('imagenPreview').src = imagenUrl;
                document.getElementById('imagenPreview').onerror = function() { this.src = '/img/logo.jpg'; };
                document.getElementById('previewContainer').style.display = 'block';
            }
            
            modalProducto.show();
        }
    } catch (error) {
        console.error('Error cargando producto:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar el producto',
            icon: 'error'
        });
    }
}

// Guardar producto
async function guardarProducto() {
    const id = document.getElementById('productoId').value;
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const categoria_id = parseInt(document.getElementById('categoria_id').value);
    const stock = parseInt(document.getElementById('stock').value);
    const destacado = parseInt(document.getElementById('destacado').value);
    const imagen = document.getElementById('imagen').value.trim();
    
    // Validaciones
    if (!nombre || !descripcion || !precio || !categoria_id || stock === '' || !imagen) {
        Swal.fire({
            title: 'Campos Incompletos',
            text: 'Por favor completa todos los campos obligatorios',
            icon: 'warning'
        });
        return;
    }
    
    if (precio <= 0) {
        Swal.fire({
            title: 'Precio Inválido',
            text: 'El precio debe ser mayor a 0',
            icon: 'warning'
        });
        return;
    }
    
    if (stock < 0) {
        Swal.fire({
            title: 'Stock Inválido',
            text: 'El stock no puede ser negativo',
            icon: 'warning'
        });
        return;
    }
    
    const productoData = {
        nombre,
        descripcion,
        precio,
        categoria_id,
        stock,
        destacado,
        imagen
    };
    
    try {
        Swal.fire({
            title: 'Guardando...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        let response;
        if (id) {
            // Actualizar
            response = await api.updateProducto(id, productoData);
        } else {
            // Crear
            response = await api.createProducto(productoData);
        }
        
        if (response.success) {
            Swal.fire({
                title: '¡Éxito!',
                text: `Producto ${id ? 'actualizado' : 'creado'} correctamente`,
                icon: 'success',
                timer: 2000
            });
            
            modalProducto.hide();
            await cargarProductos();
        }
    } catch (error) {
        console.error('Error guardando producto:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo guardar el producto',
            icon: 'error'
        });
    }
}

// Eliminar producto
async function eliminarProducto(id, nombre) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        html: `Se eliminará el producto <strong>${nombre}</strong>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
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
            
            const response = await api.deleteProducto(id);
            
            if (response.success) {
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El producto ha sido eliminado',
                    icon: 'success',
                    timer: 2000
                });
                
                await cargarProductos();
            }
        } catch (error) {
            console.error('Error eliminando producto:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo eliminar el producto',
                icon: 'error'
            });
        }
    }
}

// Actualizar preview de imagen
function actualizarPreview() {
    const imagen = document.getElementById('imagen').value.trim();
    
    if (imagen) {
        // Construir URL de imagen igual que en el index
        const imagenUrl = imagen.startsWith('http') ? imagen : `/img/${imagen.replace(/^\/img\//, '')}`;
        document.getElementById('imagenPreview').src = imagenUrl;
        document.getElementById('imagenPreview').onerror = function() { this.src = '/img/logo.jpg'; };
        document.getElementById('previewContainer').style.display = 'block';
    } else {
        document.getElementById('previewContainer').style.display = 'none';
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
