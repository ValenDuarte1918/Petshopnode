require('dotenv').config();

// Script para probar la conexión con el modelo Producto

async function testProductModel() {
    console.log('🧪 PROBANDO MODELO PRODUCTO');
    console.log('===========================\n');
    
    try {
        const db = require('./src/database/models');
        console.log('✅ Modelos importados correctamente');
        
        // Probar conexión
        await db.sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');
        
        // Verificar que el modelo Producto existe
        if (db.Producto) {
            console.log('✅ Modelo Producto encontrado');
            
            // Contar productos existentes
            const count = await db.Producto.count();
            console.log(`📦 Productos en BD: ${count}`);
            
            // Crear un producto de prueba
            console.log('\n🧪 Creando producto de prueba...');
            const testProduct = await db.Producto.create({
                name: 'Producto de Prueba TEST',
                description: 'Este es un producto de prueba creado desde script',
                category: 'Perros',
                subcategory: 'Juguetes',
                brand: 'Test Brand',
                price: 99.99,
                color: 'Rojo',
                peso: '1kg',
                edad: 'Adulto',
                stock: 10,
                image: 'test-image.jpg',
                destacado: false,
                borrado: false
            });
            
            console.log(`✅ Producto creado: ID ${testProduct.id} - ${testProduct.name}`);
            
            // Verificar que se guardó
            const verificar = await db.Producto.findByPk(testProduct.id);
            if (verificar) {
                console.log('✅ Producto verificado en base de datos');
            } else {
                console.log('❌ Producto NO encontrado en base de datos');
            }
            
            // Contar productos después
            const newCount = await db.Producto.count();
            console.log(`📦 Productos después: ${newCount}`);
            
        } else {
            console.log('❌ Modelo Producto NO encontrado');
            console.log('Modelos disponibles:', Object.keys(db));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testProductModel().catch(console.error);
