// Script para probar la velocidad del endpoint
const start = Date.now();

fetch('http://localhost:3000/api/productos/categoria/2')
    .then(response => {
        const tiempo1 = Date.now() - start;
        console.log(`⏱️  Tiempo de respuesta del servidor: ${tiempo1}ms`);
        return response.json();
    })
    .then(data => {
        const tiempoTotal = Date.now() - start;
        console.log(`⏱️  Tiempo total (con parsing JSON): ${tiempoTotal}ms`);
        console.log(`📦 Productos recibidos: ${data.data ? data.data.length : 0}`);
        console.log('✅ Respuesta:', data);
    })
    .catch(error => {
        const tiempoError = Date.now() - start;
        console.error(`❌ Error después de ${tiempoError}ms:`, error);
    });
