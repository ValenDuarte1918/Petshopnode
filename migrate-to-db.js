require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const config = require('./src/database/config/config.js').development;

// Crear conexión a Sequelize
const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false // Cambiar a console.log para ver queries
});

// Importar modelo
const db = require('./src/database/models');

async function migrarDatos() {
    console.log('🚀 Iniciando migración de datos JSON → MySQL...');
    
    try {
        // Verificar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');
        
        // Sincronizar modelos (crear tablas si no existen)
        await sequelize.sync({ force: false }); // force: true recreará las tablas
        console.log('✅ Tablas sincronizadas');
        
        // Leer datos JSON
        const productosJSON = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/productos.json'), 'utf-8'));
        console.log(`📋 Encontrados ${productosJSON.length} productos en JSON`);
        
        // Verificar si ya hay datos en la DB
        const productosExistentes = await db.Producto.findAll();
        console.log(`📋 Productos existentes en DB: ${productosExistentes.length}`);
        
        if (productosExistentes.length > 0) {
            console.log('⚠️  Ya hay productos en la base de datos');
            const respuesta = await preguntarUsuario('¿Deseas limpiar la tabla y migrar de nuevo? (y/n): ');
            if (respuesta.toLowerCase() === 'y') {
                await db.Producto.destroy({ where: {}, force: true });
                console.log('🗑️  Tabla limpiada');
            } else {
                console.log('❌ Migración cancelada');
                process.exit(0);
            }
        }
        
        // Migrar productos
        console.log('📤 Iniciando inserción de productos...');
        let insertados = 0;
        let errores = 0;
        
        for (const producto of productosJSON) {
            try {
                // Mapear campos del JSON al modelo
                const productoData = {
                    id: producto.id,
                    name: producto.name,
                    description: producto.description,
                    image: producto.image,
                    category: producto.category,
                    subcategory: producto.subcategory,
                    brand: producto.brand,
                    color: producto.color,
                    price: producto.price,
                    stock: producto.stock || 0,
                    borrado: producto.borrado || false,
                    destacado: producto.destacado || false,
                    peso: producto.peso || null,
                    edad: producto.edad || null
                };
                
                await db.Producto.create(productoData);
                insertados++;
                console.log(`✅ Producto insertado: ${producto.name}`);
                
            } catch (error) {
                errores++;
                console.log(`❌ Error al insertar producto ${producto.name}:`, error.message);
            }
        }
        
        console.log('\\n📊 RESUMEN DE MIGRACIÓN:');
        console.log(`✅ Productos insertados: ${insertados}`);
        console.log(`❌ Errores: ${errores}`);
        console.log(`📋 Total procesados: ${productosJSON.length}`);
        
        // Verificar datos insertados
        const productosFinales = await db.Producto.findAll();
        console.log(`📋 Productos en DB después de migración: ${productosFinales.length}`);
        
        console.log('\\n🎉 Migración completada!');
        
    } catch (error) {
        console.error('💥 Error durante la migración:', error);
    } finally {
        await sequelize.close();
        console.log('📴 Conexión cerrada');
        process.exit(0);
    }
}

// Función auxiliar para input del usuario
function preguntarUsuario(pregunta) {
    return new Promise((resolve) => {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question(pregunta, (respuesta) => {
            rl.close();
            resolve(respuesta);
        });
    });
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
    migrarDatos();
}

module.exports = migrarDatos;
