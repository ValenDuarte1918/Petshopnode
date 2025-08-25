require('dotenv').config();
const { Sequelize } = require('sequelize');

// Script para ver los últimos productos creados

async function showLatestProducts() {
    console.log('📦 ÚLTIMOS PRODUCTOS CREADOS');
    console.log('============================\n');
    
    const config = require('./src/database/config/config.js').development;
    
    const sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        dialect: config.dialect,
        port: config.port,
        logging: false
    });
    
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida\n');
        
        // Obtener los últimos 5 productos ordenados por ID descendente
        console.log('🆕 ÚLTIMOS 5 PRODUCTOS AÑADIDOS:');
        const [productos] = await sequelize.query(`
            SELECT id, name, category, price, stock, created_at, updated_at
            FROM productos 
            ORDER BY id DESC 
            LIMIT 5
        `);
        
        productos.forEach((producto, index) => {
            const fecha = new Date(producto.created_at).toLocaleString('es-ES');
            console.log(`   ${index + 1}. ID: ${producto.id} | ${producto.name}`);
            console.log(`      💰 Precio: $${producto.price} | 📦 Stock: ${producto.stock}`);
            console.log(`      📅 Creado: ${fecha}`);
            console.log('');
        });
        
        // Verificar si hay productos nuevos (ID > 20)
        const [nuevos] = await sequelize.query(`
            SELECT COUNT(*) as total
            FROM productos 
            WHERE id > 20
        `);
        
        console.log(`🆕 Productos nuevos (ID > 20): ${nuevos[0].total}`);
        
        if (nuevos[0].total > 0) {
            console.log('\n🎉 ¡Hay productos nuevos! Estos productos se guardaron en la base de datos.');
        } else {
            console.log('\n📋 Solo hay productos originales (del JSON migrado).');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
        console.log('\n📴 Conexión cerrada');
    }
}

showLatestProducts().catch(console.error);
