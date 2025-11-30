// Variables globales
let todosLosProductos = [];
let categorias = [];
let categoriaActual = 'all';
let usuarioLogueado = null;
let carousel = null;

// Elementos del DOM
const loadingScreen = document.getElementById('loadingScreen');
const productosContainer = document.getElementById('productosContainer');
const destacadosContainer = document.getElementById('destacadosContainer');
const categoryFilter = document.getElementById('categoryFilter');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const noProducts = document.getElementById('noProducts');
const productosDestacados = document.getElementById('productosDestacados');
const carouselInner = document.getElementById('carouselInner');
const carouselIndicators = document.getElementById('carouselIndicators');

// ===== FUNCIONES DE SESIÓN =====

// Función para verificar si el usuario está logueado
async function verificarSesion() {
    try {
        console.log('🔍 Verificando sesión...');
        
        if (!api.isAuthenticated()) {
            console.log('ℹ️ Usuario no autenticado');
            mostrarBotonesAuth();
            return;
        }

        // Obtener perfil del usuario
        const response = await api.getProfile();
        console.log('📊 Datos de perfil:', response);
        
        if (response.success) {
            usuarioLogueado = response.data;
            mostrarInfoUsuario();
            console.log('✅ Información de usuario mostrada');
        } else {
            console.log('❌ Error en datos de usuario:', response.error);
            mostrarBotonesAuth();
        }
    } catch (error) {
        console.error('❌ Error verificando sesión:', error);
        api.clearAuth();
        mostrarBotonesAuth();
    }
}

// Función para mostrar botones de autenticación
function mostrarBotonesAuth() {
    console.log('🔄 Mostrando botones de autenticación');
    if (userInfo) userInfo.style.display = 'none';
    const authButtons = document.getElementById('authButtons');
    if (authButtons) authButtons.style.display = 'block';
}

// Mostrar información del usuario logueado
function mostrarInfoUsuario() {
    if (usuarioLogueado) {
        console.log('👤 Mostrando información del usuario:', usuarioLogueado);
        
        // Actualizar nombre del usuario
        if (userName) {
            // Usar nombre_completo si existe, sino concatenar nombre y apellido
            const nombreMostrar = usuarioLogueado.nombre_completo || 
                                  usuarioLogueado.nombre || 
                                  'Usuario';
            userName.textContent = nombreMostrar;
        }
        
        // Mostrar info del usuario y ocultar botones de auth
        if (userInfo) userInfo.style.display = 'block';
        const authButtons = document.getElementById('authButtons');
        if (authButtons) authButtons.style.display = 'none';
        
        // Mostrar botón de admin si el usuario es administrador
        const adminPanelBtn = document.getElementById('adminPanelBtn');
        if (adminPanelBtn) {
            if (usuarioLogueado.rol === 'admin') {
                adminPanelBtn.style.display = 'inline-block';
                console.log('✅ Usuario es admin - Mostrando botón de panel admin');
            } else {
                adminPanelBtn.style.display = 'none';
                console.log('ℹ️ Usuario no es admin - Ocultando botón de panel admin');
            }
        }
        
        // Configurar evento de logout (solo una vez)
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn && !logoutBtn.hasAttribute('data-configured')) {
            logoutBtn.setAttribute('data-configured', 'true');
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
        
        console.log('✅ Info de usuario configurada correctamente');
    }
}

// Función de logout
async function logout() {
    const result = await Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Estás seguro de que quieres cerrar tu sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await api.logout();
            window.location.reload();
        } catch (error) {
            console.error('Error en logout:', error);
            api.clearAuth();
            window.location.reload();
        }
    }
}

// ===== FUNCIONES DE CATEGORÍAS =====

// Cargar categorías
async function cargarCategorias() {
    try {
        const response = await api.getCategorias();
        
        if (response.success) {
            // Filtrar categorías excluyendo "Tortas Especiales" (ID 2)
            categorias = response.data.filter(categoria => categoria.id !== 2);
            renderizarFiltrosCategorias();
        }
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

// Renderizar filtros de categorías
function renderizarFiltrosCategorias() {
    // Limpiar filtros existentes (excepto "Todos")
    const botones = categoryFilter.querySelectorAll('.category-btn:not([data-category="all"])');
    botones.forEach(btn => btn.remove());

    // Agregar evento al botón "Todos" si existe
    const btnTodos = categoryFilter.querySelector('[data-category="all"]');
    if (btnTodos && !btnTodos.hasAttribute('data-configured')) {
        btnTodos.setAttribute('data-configured', 'true');
        btnTodos.addEventListener('click', () => {
            console.log('👇 Botón "Todos" clickeado');
            filtrarPorCategoria('all');
        });
    }

    // Agregar categorías
    console.log(`📂 Cargando ${categorias.length} categorías`);
    categorias.forEach(categoria => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.setAttribute('data-category', categoria.id);
        button.innerHTML = `<i class="fas fa-tag"></i> ${categoria.nombre}`;
        
        button.addEventListener('click', () => {
            console.log(`👇 Categoría "${categoria.nombre}" (ID: ${categoria.id}) clickeada`);
            filtrarPorCategoria(categoria.id);
        });
        categoryFilter.appendChild(button);
    });
}

// Filtrar por categoría
function filtrarPorCategoria(categoriaId) {
    categoriaActual = categoriaId;
    
    // Actualizar botones activos
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const btnSeleccionado = document.querySelector(`[data-category="${categoriaId}"]`);
    if (btnSeleccionado) {
        btnSeleccionado.classList.add('active');
    }
    
    console.log(`📁 Filtrando por categoría: ${categoriaId}`);
    // Renderizar productos filtrados
    renderizarProductos();
}

// ===== FUNCIONES DE PRODUCTOS =====

// Cargar productos
async function cargarProductos() {
    try {
        const response = await api.getProductos();
        console.log('📦 Respuesta API de productos:', response);
        
        if (response.success) {
            // Guardar todos los productos para el carrusel
            todosLosProductos = response.data;
            console.log(`✅ Productos cargados: ${todosLosProductos.length} productos`);
            console.log('📋 Productos:', todosLosProductos);
            
            // Verificar estructura del primer producto
            if (todosLosProductos.length > 0) {
                console.log('🔍 Primer producto:', todosLosProductos[0]);
                console.log('🆔 ID del primer producto:', todosLosProductos[0].id);
            }
            
            renderizarCarrusel();
            // Filtrar productos excluyendo categoría "Tortas Especiales" (ID 2) para la galería
            renderizarProductos();
            await renderizarProductosDestacados();
        } else {
            throw new Error(response.error || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarError('Error al cargar productos', error.message);
    }
}

// Renderizar productos destacados
async function renderizarProductosDestacados() {
    try {
        const response = await api.getProductosDestacados();
        
        if (response.success && response.data.length > 0) {
            // Filtrar productos destacados excluyendo categoría 2
            const destacadosFiltrados = response.data.filter(producto => producto.categoria_id !== 2);
            
            if (destacadosFiltrados.length > 0) {
                destacadosContainer.innerHTML = '';
                destacadosFiltrados.forEach(producto => {
                    destacadosContainer.appendChild(crearCardProducto(producto));
                });
                productosDestacados.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error cargando productos destacados:', error);
    }
}

// Variables para el carrusel manual
let carouselIndex = 0;
let carouselTimer = null;

// Renderizar carrusel con todos los productos
function renderizarCarrusel() {
    if (!carouselInner || todosLosProductos.length === 0) {
        console.warn('⚠️ No se puede renderizar carrusel - contenedor o productos vacíos');
        return;
    }
    
    console.log(`🎠 Generando carrusel con ${todosLosProductos.length} productos`);
    
    // Limpiar contenido anterior
    carouselInner.innerHTML = '';
    carouselIndicators.innerHTML = '';
    
    let itemsAgregados = 0;
    
    // Generar diapositivas e indicadores
    for (let index = 0; index < todosLosProductos.length; index++) {
        const producto = todosLosProductos[index];
        
        try {
            // Crear indicador
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('data-bs-target', '#productCarousel');
            btn.setAttribute('data-bs-slide-to', index);
            if (index === 0) {
                btn.className = 'active';
                btn.setAttribute('aria-current', 'true');
            }
            btn.setAttribute('aria-label', `Slide ${index + 1}`);
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', () => mostrarSlide(index));
            carouselIndicators.appendChild(btn);
            
            // Crear elemento de diapositiva
            const div = document.createElement('div');
            div.className = index === 0 ? 'carousel-item active' : 'carousel-item';
            div.style.display = index === 0 ? 'flex' : 'none';
            
            // Reemplazar espacios con guiones en el nombre de la imagen
            const imagenNormalizada = producto.imagen.replace(/ /g, '_');
            const imagenUrl = `img/${imagenNormalizada}`;
            
            div.innerHTML = `
                <img src="${imagenUrl}" class="carousel-img" alt="${producto.nombre}" onerror="this.src='img/logo.jpg'">
                <div class="carousel-caption d-none d-md-block">
                    <h5>${producto.nombre}</h5>
                    <p>${producto.descripcion || ''}</p>
                    <strong style="color: #ffd700;">$${parseFloat(producto.precio).toLocaleString('es-CO')}</strong>
                </div>
            `;
            
            carouselInner.appendChild(div);
            itemsAgregados++;
            
        } catch (error) {
            console.error(`❌ Error agregando producto ${index}:`, error);
        }
    }
    
    console.log(`✅ Items agregados al carrusel: ${itemsAgregados}/${todosLosProductos.length}`);
    
    // Iniciar rotación manual
    iniciarCarruselManual();
}

// Función para mostrar un slide específico
function mostrarSlide(index) {
    carouselIndex = index;
    const items = carouselInner.querySelectorAll('.carousel-item');
    const indicators = carouselIndicators.querySelectorAll('button');
    
    items.forEach((item, i) => {
        if (i === index) {
            item.style.display = 'flex';
            item.classList.add('active');
        } else {
            item.style.display = 'none';
            item.classList.remove('active');
        }
    });
    
    indicators.forEach((btn, i) => {
        if (i === index) {
            btn.classList.add('active');
            btn.setAttribute('aria-current', 'true');
        } else {
            btn.classList.remove('active');
            btn.removeAttribute('aria-current');
        }
    });
    
    console.log(`📍 Mostrando slide ${index + 1}/${todosLosProductos.length}`);
}

// Función para rotar automáticamente
function iniciarCarruselManual() {
    console.log('▶️ Iniciando rotación automática (3 segundos)...');
    
    // Limpiar timer anterior si existe
    if (carouselTimer) {
        clearInterval(carouselTimer);
    }
    
    // Rotar cada 3 segundos
    carouselTimer = setInterval(() => {
        carouselIndex++;
        if (carouselIndex >= todosLosProductos.length) {
            carouselIndex = 0;
        }
        mostrarSlide(carouselIndex);
    }, 3000);
}

// Renderizar productos
function renderizarProductos() {
    let productosFiltrados = todosLosProductos;
    
    // Excluir Tortas Especiales (categoría 2) de la galería principal
    productosFiltrados = productosFiltrados.filter(producto => producto.categoria_id !== 2);
    
    // Filtrar por categoría si no es "all"
    if (categoriaActual !== 'all') {
        productosFiltrados = productosFiltrados.filter(producto => 
            parseInt(producto.categoria_id) === parseInt(categoriaActual)
        );
        console.log(`🔍 Categoría ${categoriaActual}: ${productosFiltrados.length} productos encontrados`);
    } else {
        console.log(`📊 Mostrando todos los productos: ${productosFiltrados.length} productos`);
    }

    // Limpiar contenedor
    productosContainer.innerHTML = '';

    if (productosFiltrados.length === 0) {
        noProducts.style.display = 'block';
        return;
    }

    noProducts.style.display = 'none';

    // Renderizar productos
    productosFiltrados.forEach(producto => {
        productosContainer.appendChild(crearCardProducto(producto));
    });
}

// Crear card de producto
function crearCardProducto(producto) {
    const col = document.createElement('div');
    col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';

    // Formatear precio
    const precioFormateado = parseFloat(producto.precio).toLocaleString('es-CO');
    
    // Normalizar nombre de imagen (reemplazar espacios con guiones)
    // Verificar que el producto tenga ID
    if (!producto.id) {
        console.error('❌ Producto sin ID:', producto);
    }
    
    const imagenNormalizada = producto.imagen.replace(/ /g, '_');
    const imagenUrl = producto.imagen_url || `/img/${imagenNormalizada}` || '/img/logo.jpg';

    // Verificar si hay stock
    const hayStock = producto.stock > 0;
    
    // Determinar si mostrar botón de carrito (solo si usuario está logueado)
    const mostrarBotonCarrito = usuarioLogueado && hayStock;

    col.innerHTML = `
        <div class="card h-100" style="position: relative;">
            ${producto.destacado ? '<div class="destacado-badge">Destacado</div>' : ''}
            <img src="${imagenUrl}" class="card-img-top" alt="${producto.nombre}" 
                 onerror="this.src='/img/logo.jpg'">
            <div class="card-body">
                <div class="categoria-badge">${producto.categoria_nombre || 'Sin categoría'}</div>
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text">${producto.descripcion || 'Delicioso producto artesanal'}</p>
                <div class="stock-info">
                    <i class="fas fa-box"></i> Stock: ${producto.stock || 0} unidades
                </div>
                <div class="price">$${precioFormateado}</div>
                
                ${hayStock ? `
                    <div class="btn-group w-100" role="group">
                        ${mostrarBotonCarrito ? `
                            <button class="btn btn-outline-primary btn-agregar-carrito" 
                                    data-producto-id="${producto.id}"
                                    data-producto-nombre="${producto.nombre}"
                                    style="flex: 1;">
                                <i class="fas fa-shopping-cart"></i> Al Carrito
                            </button>
                        ` : ''}
                        <button class="btn btn-fruty btn-ordenar" 
                                data-producto='${JSON.stringify(producto)}'
                                style="flex: 1;">
                            <i class="fas fa-bolt"></i> Ordenar Ahora
                        </button>
                    </div>
                ` : `
                    <button class="btn btn-secondary w-100" disabled>
                        <i class="fas fa-times"></i> Agotado
                    </button>
                `}
            </div>
        </div>
    `;

    // Agregar event listener al botón de ordenar
    const btnOrdenar = col.querySelector('.btn-ordenar');
    if (btnOrdenar) {
        btnOrdenar.addEventListener('click', function() {
            const productoData = JSON.parse(this.getAttribute('data-producto'));
            manejarPedido(productoData);
        });
    }

    // Agregar event listener al botón de agregar al carrito
    const btnAgregarCarrito = col.querySelector('.btn-agregar-carrito');
    if (btnAgregarCarrito) {
        btnAgregarCarrito.addEventListener('click', function(e) {
            e.preventDefault();
            const productoId = this.getAttribute('data-producto-id');
            console.log('🛒 Click en agregar al carrito');
            console.log('📦 Producto ID del atributo:', productoId);
            console.log('🔢 Producto ID parseado:', parseInt(productoId));
            
            if (!productoId || productoId === 'null' || productoId === 'undefined') {
                console.error('❌ ID de producto inválido:', productoId);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo obtener el ID del producto'
                });
                return;
            }
            
            if (window.agregarAlCarrito) {
                window.agregarAlCarrito(parseInt(productoId), 1);
            } else {
                console.error('❌ Función agregarAlCarrito no está disponible');
            }
        });
    }

    return col;
}

// ===== FUNCIONES DE PEDIDOS =====

// Manejar pedido de producto
async function manejarPedido(producto) {
    // Verificar si el usuario está logueado
    if (!usuarioLogueado) {
        const result = await Swal.fire({
            title: 'Inicia Sesión',
            text: 'Debes iniciar sesión para realizar pedidos',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Iniciar Sesión',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#e91e63'
        });

        if (result.isConfirmed) {
            window.location.href = 'login.html';
        }
        return;
    }

    // Mostrar formulario de pedido
    const result = await Swal.fire({
        title: '🛒 Realizar Pedido',
        html: `
            <div class="text-start">
                <p><strong>Producto:</strong> ${producto.nombre}</p>
                <p><strong>Precio:</strong> $${parseFloat(producto.precio).toLocaleString('es-CO')}</p>
                <hr>
                <div class="mb-3">
                    <label for="cantidad" class="form-label">Cantidad: <span class="text-danger">*</span></label>
                    <input type="number" id="cantidad" class="form-control" value="1" min="1" max="${producto.stock || 10}">
                    <small class="form-text text-muted">Máximo disponible: ${producto.stock || 10}</small>
                </div>
                <div class="mb-3">
                    <label for="direccion" class="form-label">Dirección de entrega: <span class="text-danger">*</span></label>
                    <input type="text" id="direccion" class="form-control" placeholder="Ej: Calle 123, Apartamento 45" maxlength="255">
                    <small class="form-text text-muted">Mínimo 5 caracteres</small>
                </div>
                <div class="mb-3">
                    <label for="telefono" class="form-label">Teléfono de contacto: <span class="text-danger">*</span></label>
                    <input type="tel" id="telefono" class="form-control" placeholder="Ej: 3001234567" maxlength="10" inputmode="numeric">
                    <small class="form-text text-muted">Máximo 10 dígitos (sin espacios ni caracteres especiales)</small>
                </div>
                <div class="mb-3">
                    <label for="notas" class="form-label">Notas especiales (opcional):</label>
                    <textarea id="notas" class="form-control" rows="3" placeholder="Instrucciones especiales para tu pedido..." maxlength="500"></textarea>
                    <small class="form-text text-muted"><span id="notasCount">0</span>/500 caracteres</small>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar Pedido',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e91e63',
        didOpen: (modal) => {
            // Agregar contador de caracteres para notas
            const notasInput = document.getElementById('notas');
            const notasCount = document.getElementById('notasCount');
            
            notasInput.addEventListener('input', () => {
                notasCount.textContent = notasInput.value.length;
            });
            
            // Validar solo dígitos en teléfono
            const telefonoInput = document.getElementById('telefono');
            telefonoInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
            });
        },
        preConfirm: () => {
            const cantidad = document.getElementById('cantidad').value.trim();
            const direccion = document.getElementById('direccion').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const notas = document.getElementById('notas').value.trim();
            
            // Validación de cantidad
            if (!cantidad || cantidad < 1) {
                Swal.showValidationMessage('La cantidad debe ser mayor a 0');
                return false;
            }
            
            if (parseInt(cantidad) > (producto.stock || 10)) {
                Swal.showValidationMessage(`La cantidad no puede exceder el stock disponible (${producto.stock || 10})`);
                return false;
            }
            
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
                cantidad: parseInt(cantidad),
                direccion: direccion,
                telefono: soloDigitos,
                notas: notas
            };
        }
    });

    if (result.isConfirmed) {
        await procesarPedido(producto, result.value);
    }
}

// Procesar pedido
async function procesarPedido(producto, datosPedido) {
    try {
        const total = parseFloat(producto.precio) * datosPedido.cantidad;
        
        // Crear pedido en la API
        const pedidoData = {
            cliente_id: usuarioLogueado.id,
            productos: [
                {
                    producto_id: producto.id,
                    cantidad: datosPedido.cantidad,
                    precio_unitario: producto.precio
                }
            ],
            direccion_entrega: datosPedido.direccion,
            telefono: datosPedido.telefono,
            notas: datosPedido.notas,
            total: total
        };

        const response = await api.createPedido(pedidoData);

        if (response.success) {
            await Swal.fire({
                title: '¡Pedido Enviado!',
                html: `
                    <div class="text-start">
                        <h5>Resumen del Pedido:</h5>
                        <p><strong>Producto:</strong> ${producto.nombre}</p>
                        <p><strong>Cantidad:</strong> ${datosPedido.cantidad}</p>
                        <p><strong>Precio unitario:</strong> $${parseFloat(producto.precio).toLocaleString('es-CO')}</p>
                        <p><strong>Total:</strong> $${total.toLocaleString('es-CO')}</p>
                        <p><strong>Dirección:</strong> ${datosPedido.direccion}</p>
                        <p><strong>Teléfono:</strong> ${datosPedido.telefono}</p>
                        ${datosPedido.notas ? `<p><strong>Notas:</strong> ${datosPedido.notas}</p>` : ''}
                        <hr>
                        <p class="text-muted">Tu pedido ha sido registrado exitosamente. Nos pondremos en contacto contigo pronto.</p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#27ae60'
            });
        } else {
            throw new Error(response.error);
        }
    } catch (error) {
        console.error('Error procesando pedido:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo procesar el pedido',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
    }
}

// ===== UTILIDADES =====

// Mostrar error
function mostrarError(titulo, mensaje) {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: 'error',
        confirmButtonText: 'Entendido'
    });
}

// ===== INICIALIZACIÓN =====

// Inicializar la aplicación
async function inicializar() {
    try {
        // Mostrar pantalla de carga por al menos 2 segundos
        const tiempoMinimo = new Promise(resolve => setTimeout(resolve, 2000));
        
        // Cargar datos en paralelo
        const promesas = [
            verificarSesion(),
            cargarCategorias(),
            cargarProductos(),
            tiempoMinimo
        ];
        
        await Promise.all(promesas);
        
        // Ocultar pantalla de carga
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
        
    } catch (error) {
        console.error('Error inicializando aplicación:', error);
        mostrarError('Error de carga', 'Hubo un problema cargando la página. Por favor, recarga.');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializar);

// ===== BOTÓN IR ARRIBA =====

// Obtener botón
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

// Mostrar/ocultar botón según el scroll
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
});

// Ir al top cuando clickean el botón
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Verificar sesión cuando la ventana regain focus
window.addEventListener('focus', function() {
    console.log('🔄 Ventana recuperó el foco, verificando sesión...');
    verificarSesion();
});
