// ========================================
// API 1: Autenticación y Productos (Puerto 3000)
// ========================================

class API1 {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error(`Error en petición a ${endpoint}:`, error);
            throw error;
        }
    }

    // Autenticación
    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        // Guardar token automáticamente si el login es exitoso
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            // Guardar datos del usuario
            if (response.data.user) {
                localStorage.setItem('usuario', JSON.stringify(response.data.user));
            }
        }
        
        return response;
    }

    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        // Guardar token automáticamente si el registro es exitoso
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            // Guardar datos del usuario
            if (response.data.user) {
                localStorage.setItem('usuario', JSON.stringify(response.data.user));
            }
        }
        
        return response;
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    async logout() {
        this.clearAuth();
        return { success: true };
    }

    // Productos
    async getProductos() {
        return this.request('/productos');
    }

    async getProductoById(id) {
        return this.request(`/productos/${id}`);
    }

    async getProductosDestacados() {
        return this.request('/productos/destacados');
    }

    async getProductosByCategoria(categoriaId) {
        return this.request(`/productos/categoria/${categoriaId}`);
    }

    async searchProductos(query) {
        return this.request(`/productos/search?q=${encodeURIComponent(query)}`);
    }

    // Categorías
    async getCategorias() {
        return this.request('/categorias');
    }

    async getCategoriaById(id) {
        return this.request(`/categorias/${id}`);
    }

    // Admin - Dashboard
    async getDashboardStats() {
        return this.request('/admin/dashboard/stats');
    }

    // Admin - Usuarios
    async getUsuarios() {
        return this.request('/admin/usuarios');
    }

    async actualizarRolUsuario(id, rol) {
        return this.request(`/admin/usuarios/${id}/rol`, {
            method: 'PUT',
            body: JSON.stringify({ rol })
        });
    }

    async desactivarUsuario(id) {
        return this.request(`/admin/usuarios/${id}`, {
            method: 'DELETE'
        });
    }

    // Admin - Pedidos
    async getTodosPedidos() {
        return this.request('/admin/pedidos');
    }

    async actualizarEstadoPedidoAdmin(id, estado) {
        return this.request(`/admin/pedidos/${id}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ estado })
        });
    }

    // Admin - Productos
    async crearProducto(productoData) {
        return this.request('/productos', {
            method: 'POST',
            body: JSON.stringify(productoData)
        });
    }

    async actualizarProducto(id, productoData) {
        return this.request(`/productos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productoData)
        });
    }

    async eliminarProducto(id) {
        return this.request(`/productos/${id}`, {
            method: 'DELETE'
        });
    }

    // Admin - Reportes
    async getReportesVentas(filtros = {}) {
        const query = new URLSearchParams(filtros).toString();
        return this.request(`/admin/reportes/ventas${query ? '?' + query : ''}`);
    }

    // Métodos auxiliares
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    isAuthenticated() {
        return !!this.token;
    }

    isAdmin() {
        const user = this.getUser();
        return user && user.rol === 'admin';
    }

    getUser() {
        const userStr = localStorage.getItem('usuario');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    clearAuth() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('usuario');
    }
}

// ========================================
// API 2: Carrito y Pedidos (Puerto 3001)
// ========================================

class API2 {
    constructor() {
        this.baseURL = 'http://localhost:3001';
        this.token = localStorage.getItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error(`Error en petición a ${endpoint}:`, error);
            throw error;
        }
    }

    // Carrito
    async getCarrito() {
        return this.request('/carrito');
    }

    async agregarAlCarrito(producto_id, cantidad = 1) {
        return this.request('/carrito', {
            method: 'POST',
            body: JSON.stringify({ producto_id, cantidad })
        });
    }

    async actualizarCantidadCarrito(item_id, cantidad) {
        return this.request(`/carrito/${item_id}`, {
            method: 'PUT',
            body: JSON.stringify({ cantidad })
        });
    }

    async eliminarDelCarrito(item_id) {
        return this.request(`/carrito/${item_id}`, {
            method: 'DELETE'
        });
    }

    async vaciarCarrito() {
        return this.request('/carrito/vaciar/all', {
            method: 'DELETE'
        });
    }

    async procesarCompra(notas = '') {
        return this.request('/carrito/checkout', {
            method: 'POST',
            body: JSON.stringify({ notas })
        });
    }

    // Pedidos
    async getPedidos() {
        return this.request('/pedidos');
    }

    async getPedidoById(id) {
        return this.request(`/pedidos/${id}`);
    }

    async crearPedido(pedidoData) {
        return this.request('/pedidos', {
            method: 'POST',
            body: JSON.stringify(pedidoData)
        });
    }

    async actualizarEstadoPedido(id, estado) {
        return this.request(`/pedidos/${id}/estado`, {
            method: 'PATCH',
            body: JSON.stringify({ estado })
        });
    }

    setToken(token) {
        this.token = token;
    }
}

// ========================================
// Exportar instancias
// ========================================

const api1 = new API1();  // Autenticación y Productos
const api2 = new API2();  // Carrito y Pedidos

// Para compatibilidad con código antiguo, usar api como alias de api1
const api = api1;
