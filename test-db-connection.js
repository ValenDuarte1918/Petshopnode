require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const config = require('./src/database/config/config.js').development;

async function testConnection() {
    console.log('🔍 Probando conexión a la base de datos...');
    console.log('📋 Configuración:', {
        host: config.host,
        database: config.database,
        username: config.username,
        port: config.port || 3306
    });
    
    const sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        dialect: config.dialect,
        port: config.port || 3306,
        logging: console.log // Mostrar queries
    });
    
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida correctamente');
        
        // Probar una query simple
        const [results] = await sequelize.query('SELECT DATABASE() as db_name, NOW() as current_time_value');
        console.log('📊 Información de la base de datos:', results[0]);
        
        // Verificar si existe la tabla productos
        const [tables] = await sequelize.query("SHOW TABLES LIKE 'productos'");
        if (tables.length > 0) {
            console.log('✅ Tabla "productos" encontrada');
            
            // Contar registros
            const [count] = await sequelize.query('SELECT COUNT(*) as total FROM productos');
            console.log('📋 Productos en la tabla:', count[0].total);
        } else {
            console.log('⚠️  Tabla "productos" no encontrada');
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    } finally {
        await sequelize.close();
        console.log('📴 Conexión cerrada');
    }
}

testConnection();
