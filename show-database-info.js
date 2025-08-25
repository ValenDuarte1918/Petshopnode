require('dotenv').config();
const { Sequelize } = require('sequelize');

// Script para mostrar información completa de la base de datos

async function showDatabaseInfo() {
    console.log('🔍 INFORMACIÓN COMPLETA DE LA BASE DE DATOS');
    console.log('============================================\n');
    
    const config = require('./src/database/config/config.js').development;
    
    console.log('📋 CONFIGURACIÓN DE CONEXIÓN:');
    console.log(`   Host: ${config.host}`);
    console.log(`   Puerto: ${config.port}`);
    console.log(`   Base de datos: ${config.database}`);
    console.log(`   Usuario: ${config.username}`);
    console.log(`   Contraseña: ${config.password ? '***' : '(vacía)'}\n`);
    
    const sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        dialect: config.dialect,
        port: config.port,
        logging: false
    });
    
    try {
        await sequelize.authenticate();
        console.log('✅ CONEXIÓN: Establecida correctamente\n');
        
        // Mostrar todas las bases de datos
        console.log('📊 BASES DE DATOS DISPONIBLES:');
        const [databases] = await sequelize.query('SHOW DATABASES');
        databases.forEach(db => {
            const dbName = Object.values(db)[0];
            if (dbName === config.database) {
                console.log(`   ✅ ${dbName} (ACTUAL)`);
            } else {
                console.log(`   📁 ${dbName}`);
            }
        });
        
        // Mostrar tablas en la base de datos actual
        console.log(`\n📋 TABLAS EN "${config.database}":`);
        const [tables] = await sequelize.query('SHOW TABLES');
        if (tables.length === 0) {
            console.log('   ❌ No hay tablas');
        } else {
            for (const table of tables) {
                const tableName = Object.values(table)[0];
                console.log(`   📊 ${tableName}`);
                
                // Contar registros en cada tabla
                const [count] = await sequelize.query(`SELECT COUNT(*) as total FROM \`${tableName}\``);
                const total = count[0].total;
                console.log(`      └── ${total} registros`);
            }
        }
        
        // Mostrar estructura de la tabla productos si existe
        const [productTables] = await sequelize.query("SHOW TABLES LIKE 'productos'");
        if (productTables.length > 0) {
            console.log('\n🛍️ ESTRUCTURA DE LA TABLA PRODUCTOS:');
            const [columns] = await sequelize.query('DESCRIBE productos');
            columns.forEach(col => {
                console.log(`   📋 ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.Key === 'PRI' ? '(PRIMARY KEY)' : ''}`);
            });
            
            // Mostrar algunos productos de ejemplo
            console.log('\n🛍️ PRODUCTOS DE EJEMPLO (primeros 5):');
            const [products] = await sequelize.query('SELECT id, name, category, price, stock FROM productos LIMIT 5');
            products.forEach(product => {
                console.log(`   🏷️  ID: ${product.id} | ${product.name} | ${product.category} | $${product.price} | Stock: ${product.stock}`);
            });
        }
        
        console.log('\n🌐 PARA CONECTAR DESDE MYSQL WORKBENCH:');
        console.log('=====================================');
        console.log(`Host: ${config.host}`);
        console.log(`Puerto: ${config.port}`);
        console.log(`Usuario: ${config.username}`);
        console.log(`Contraseña: ${config.password || '(dejar vacío)'}`);
        console.log(`Base de datos: ${config.database}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
        console.log('\n📴 Conexión cerrada');
    }
}

showDatabaseInfo().catch(console.error);
