require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Script para crear la base de datos y tablas automáticamente

async function setupDatabase() {
    console.log('🚀 Configurando nueva base de datos...');
    
    // Configuración para conectar sin especificar DB (para crearla)
    const config = require('./src/database/config/config.js').development;
    
    // Conectar sin especificar la base de datos para poder crearla
    const sequelizeSystem = new Sequelize('', config.username, config.password, {
        host: config.host,
        dialect: config.dialect,
        port: config.port || 3306,
        logging: console.log
    });
    
    try {
        // Paso 1: Verificar conexión al servidor MySQL
        console.log('🔍 Verificando conexión al servidor MySQL...');
        await sequelizeSystem.authenticate();
        console.log('✅ Conexión al servidor MySQL establecida');
        
        // Paso 2: Crear la base de datos si no existe
        console.log(`🗄️  Creando base de datos "${config.database}"...`);
        await sequelizeSystem.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        console.log('✅ Base de datos creada/verificada');
        
        await sequelizeSystem.close();
        
        // Paso 3: Conectar a la nueva base de datos
        console.log('🔗 Conectando a la nueva base de datos...');
        const sequelize = new Sequelize(config.database, config.username, config.password, {
            host: config.host,
            dialect: config.dialect,
            port: config.port || 3306,
            logging: false
        });
        
        await sequelize.authenticate();
        console.log('✅ Conexión a la nueva base de datos establecida');
        
        // Paso 4: Crear la tabla productos
        console.log('📋 Creando tabla productos...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS productos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                image VARCHAR(255),
                category VARCHAR(100) NOT NULL,
                subcategory VARCHAR(100),
                brand VARCHAR(100),
                color VARCHAR(50),
                price DECIMAL(10,2) NOT NULL,
                stock INT NOT NULL DEFAULT 0,
                borrado BOOLEAN NOT NULL DEFAULT false,
                destacado BOOLEAN NOT NULL DEFAULT false,
                peso VARCHAR(50),
                edad VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL,
                INDEX idx_category (category),
                INDEX idx_subcategory (subcategory),
                INDEX idx_borrado (borrado),
                INDEX idx_destacado (destacado)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tabla productos creada');
        
        // Paso 5: Verificar estructura de la tabla
        const [tableInfo] = await sequelize.query('DESCRIBE productos');
        console.log('📊 Estructura de la tabla productos:');
        tableInfo.forEach(column => {
            console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        await sequelize.close();
        
        console.log('\\n🎉 ¡Base de datos configurada correctamente!');
        console.log('\\n📋 Próximos pasos:');
        console.log('1. Ejecutar: node migrate-to-db.js (para migrar datos del JSON)');
        console.log('2. Reiniciar el servidor: npm test');
        console.log('3. La aplicación usará automáticamente la base de datos');
        
    } catch (error) {
        console.error('💥 Error durante la configuración:', error.message);
        
        if (error.message.includes('ECONNREFUSED') || error.message.includes('ER_ACCESS_DENIED_ERROR')) {
            console.log('\\n🔧 SOLUCIONES POSIBLES:');
            console.log('\\n📦 Opción 1 - XAMPP (Recomendado):');
            console.log('1. Descargar XAMPP: https://www.apachefriends.org/download.html');
            console.log('2. Instalar y abrir XAMPP Control Panel');
            console.log('3. Iniciar Apache y MySQL');
            console.log('4. Ejecutar este script nuevamente');
            
            console.log('\\n☁️  Opción 2 - Base de datos en la nube:');
            console.log('1. PlanetScale: https://planetscale.com/ (gratis)');
            console.log('2. Railway: https://railway.app/ (gratis)');
            console.log('3. Aiven: https://aiven.io/ (gratis)');
            console.log('4. Actualizar .env con las credenciales');
        }
    }
}

if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;
