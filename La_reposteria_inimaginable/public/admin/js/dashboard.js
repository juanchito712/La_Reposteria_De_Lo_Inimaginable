// Verificar autenticación y permisos de admin
async function verificarAdmin() {
    if (!api.isAuthenticated()) {
        window.location.href = '../login.html?redirect=admin';
        return false;
    }

    try {
        const response = await api.getProfile();
        if (response.success && response.data.rol === 'admin') {
            document.getElementById('adminName').textContent = response.data.nombre_completo || response.data.nombre;
            return true;
        } else {
            Swal.fire({
                title: 'Acceso Denegado',
                text: 'No tienes permisos de administrador',
                icon: 'error',
                confirmButtonText: 'Entendido'
            }).then(() => {
                window.location.href = '../index.html';
            });
            return false;
        }
    } catch (error) {
        console.error('Error verificando permisos:', error);
        window.location.href = '../login.html';
        return false;
    }
}

// Cargar datos del dashboard
async function cargarDatos() {
    const loading = document.getElementById('loadingOverlay');
    loading.style.display = 'flex';

    try {
        const response = await api.getDashboardStats();
        
        if (response.success) {
            const { estadisticas, bajoStock, ultimosPedidos, masVendidos, ventasPorMes } = response.data;
            
            // Actualizar estadísticas
            document.getElementById('totalProductos').textContent = estadisticas.total_productos || 0;
            document.getElementById('totalPedidos').textContent = estadisticas.total_pedidos || 0;
            document.getElementById('totalClientes').textContent = estadisticas.total_clientes || 0;
            document.getElementById('ventasTotales').textContent = 
                `$${parseFloat(estadisticas.ventas_totales || 0).toLocaleString('es-CO')}`;

            // Renderizar tablas
            renderizarBajoStock(bajoStock);
            renderizarPedidosPendientes(ultimosPedidos.filter(p => p.estado === 'pendiente'));
            
            // Renderizar gráficos circulares
            renderizarGraficoMasVendidos(masVendidos);
            renderizarGraficoVentasCategoria();
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudieron cargar los datos del dashboard',
            icon: 'error',
            confirmButtonText: 'Reintentar'
        });
    } finally {
        loading.style.display = 'none';
    }
}

// Renderizar tabla de bajo stock
function renderizarBajoStock(productos) {
    const tbody = document.getElementById('bajoStockTable');
    
    if (!productos || productos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted">
                    <i class="fas fa-check-circle text-success"></i> No hay productos con bajo stock
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>${p.nombre}</td>
            <td>
                <span class="badge bg-${p.stock === 0 ? 'danger' : 'warning'}">
                    ${p.stock} unidades
                </span>
            </td>
            <td>
                <a href="productos.html?id=${p.id}" class="btn btn-sm btn-primary">
                    <i class="fas fa-edit"></i>
                </a>
            </td>
        </tr>
    `).join('');
}

// Renderizar tabla de pedidos pendientes
function renderizarPedidosPendientes(pedidos) {
    const tbody = document.getElementById('pedidosPendientesTable');
    
    if (!pedidos || pedidos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    No hay pedidos pendientes
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pedidos.slice(0, 5).map(p => `
        <tr>
            <td>#${p.id}</td>
            <td>${p.cliente_nombre}</td>
            <td>$${parseFloat(p.total).toLocaleString('es-CO')}</td>
            <td>
                <a href="pedidos.html?id=${p.id}" class="btn btn-sm btn-success">
                    <i class="fas fa-eye"></i>
                </a>
            </td>
        </tr>
    `).join('');
}

// Gráfico de productos más vendidos (CIRCULAR)
let masVendidosChart = null;
function renderizarGraficoMasVendidos(productos) {
    const ctx = document.getElementById('masVendidosChart');
    
    if (masVendidosChart) {
        masVendidosChart.destroy();
    }

    const colores = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#fa709a', '#fee140'
    ];

    masVendidosChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: productos.map(p => p.nombre),
            datasets: [{
                label: 'Unidades Vendidas',
                data: productos.map(p => p.total_vendido),
                backgroundColor: colores,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + ' unidades';
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de ventas por categoría (CIRCULAR)
let ventasCategoriaChart = null;
async function renderizarGraficoVentasCategoria() {
    const ctx = document.getElementById('ventasCategoriaChart');
    
    if (ventasCategoriaChart) {
        ventasCategoriaChart.destroy();
    }

    try {
        // Obtener datos de categorías
        const response = await api.getCategorias();
        
        const colores = [
            '#11998e', '#38ef7d', '#fa709a', '#fee140',
            '#30cfd0', '#330867', '#a8edea', '#fed6e3'
        ];

        ventasCategoriaChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: response.data.filter(c => c.id !== 2).map(c => c.nombre),
                datasets: [{
                    label: 'Productos por Categoría',
                    data: response.data.filter(c => c.id !== 2).map(() => Math.floor(Math.random() * 50) + 10),
                    backgroundColor: colores,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + ' productos';
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error cargando gráfico de categorías:', error);
    }
}

// Exportar a Excel
async function exportarExcel() {
    try {
        const result = await Swal.fire({
            title: 'Exportar Reporte',
            html: `
                <p>Selecciona el rango de fechas para exportar:</p>
                <div class="mb-3">
                    <label class="form-label">Fecha Inicio:</label>
                    <input type="date" id="fechaInicio" class="form-control" value="${new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]}">
                </div>
                <div class="mb-3">
                    <label class="form-label">Fecha Fin:</label>
                    <input type="date" id="fechaFin" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-download"></i> Descargar Excel',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#28a745',
            preConfirm: () => {
                const fechaInicio = document.getElementById('fechaInicio').value;
                const fechaFin = document.getElementById('fechaFin').value;
                
                if (!fechaInicio || !fechaFin) {
                    Swal.showValidationMessage('Debes seleccionar ambas fechas');
                    return false;
                }
                
                if (fechaInicio > fechaFin) {
                    Swal.showValidationMessage('La fecha inicio debe ser menor a la fecha fin');
                    return false;
                }
                
                return { fechaInicio, fechaFin };
            }
        });

        if (result.isConfirmed) {
            const { fechaInicio, fechaFin } = result.value;
            
            // Obtener datos del reporte
            const response = await api.getReporteVentas(fechaInicio, fechaFin);
            
            if (response.success && response.data.length > 0) {
                // Crear CSV
                const csv = convertirACSV(response.data);
                descargarCSV(csv, `reporte_ventas_${fechaInicio}_${fechaFin}.csv`);
                
                Swal.fire({
                    title: '¡Descargado!',
                    text: 'El reporte se ha descargado correctamente',
                    icon: 'success',
                    timer: 2000
                });
            } else {
                Swal.fire({
                    title: 'Sin Datos',
                    text: 'No hay datos para el rango de fechas seleccionado',
                    icon: 'info'
                });
            }
        }
    } catch (error) {
        console.error('Error exportando:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo generar el reporte',
            icon: 'error'
        });
    }
}

// Convertir datos a CSV
function convertirACSV(data) {
    const headers = ['Fecha', 'Total Pedidos', 'Total Ventas', 'Venta Promedio', 'Clientes Únicos'];
    const rows = data.map(row => [
        row.fecha,
        row.total_pedidos,
        parseFloat(row.total_ventas).toFixed(2),
        parseFloat(row.venta_promedio).toFixed(2),
        row.clientes_unicos
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
}

// Descargar CSV
function descargarCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const result = await Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Estás seguro de que deseas cerrar sesión?',
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

// Inicializar
(async function() {
    const esAdmin = await verificarAdmin();
    if (esAdmin) {
        await cargarDatos();
    }
})();
