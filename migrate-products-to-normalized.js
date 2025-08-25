require('dotenv').config();
const { Sequelize } = require('sequelize');

// Script para migrar productos existentes a la estructura normalizada

async function migrateProductsToNormalized() {
    console.log('🔄 MIGRANDO PRODUCTOS A ESTRUCTURA NORMALIZADA');
    console.log('==============================================\n');
    
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
        
        // 1. Obtener todos los productos existentes
        console.log('📋 Obteniendo productos existentes...');
        const [productos] = await sequelize.query('SELECT * FROM productos');
        console.log(`   📦 Productos encontrados: ${productos.length}`);
        
        // 2. Crear mapas de categorías y marcas para facilitar la migración
        const [categorias] = await sequelize.query('SELECT id, nombre FROM categorias');
        const [subcategorias] = await sequelize.query('SELECT id, nombre, categoria_id FROM subcategorias');
        const [marcas] = await sequelize.query('SELECT id, nombre FROM marcas');
        
        const categoriaMap = new Map();
        categorias.forEach(cat => categoriaMap.set(cat.nombre.toLowerCase(), cat.id));
        
        const subcategoriaMap = new Map();
        subcategorias.forEach(subcat => subcategoriaMap.set(subcat.nombre.toLowerCase(), { id: subcat.id, categoria_id: subcat.categoria_id }));
        
        const marcaMap = new Map();
        marcas.forEach(marca => marcaMap.set(marca.nombre.toLowerCase(), marca.id));
        
        console.log('\n🔄 Iniciando migración de productos...');
        
        // 3. Migrar cada producto
        let migrados = 0;
        let errores = 0;
        
        for (const producto of productos) {
            try {
                // Mapear categoría
                let categoriaId = null;
                let subcategoriaId = null;
                
                if (producto.category) {
                    const categoriaNormalizada = producto.category.toLowerCase();
                    
                    // Mapear categorías existentes
                    if (categoriaNormalizada.includes('perro')) {
                        categoriaId = categoriaMap.get('perros');
                        
                        // Determinar subcategoría para perros
                        if (producto.name && (producto.name.toLowerCase().includes('royal canin') || producto.name.toLowerCase().includes('pro plan') || producto.name.toLowerCase().includes('excellent'))) {
                            subcategoriaId = subcategoriaMap.get('alimento seco')?.id;
                        } else if (producto.name && (producto.name.toLowerCase().includes('kong') || producto.name.toLowerCase().includes('pelota'))) {
                            subcategoriaId = subcategoriaMap.get('juguetes')?.id;
                        } else if (producto.name && (producto.name.toLowerCase().includes('cama') || producto.name.toLowerCase().includes('colchón'))) {
                            subcategoriaId = subcategoriaMap.get('camas y descanso')?.id;
                        } else if (producto.name && (producto.name.toLowerCase().includes('collar') || producto.name.toLowerCase().includes('correa'))) {
                            subcategoriaId = subcategoriaMap.get('collares y correas')?.id;
                        }
                        
                    } else if (categoriaNormalizada.includes('gato')) {
                        categoriaId = categoriaMap.get('gatos');
                        
                        // Determinar subcategoría para gatos
                        if (producto.name && (producto.name.toLowerCase().includes('whiskas') || producto.name.toLowerCase().includes('kitten'))) {
                            subcategoriaId = subcategoriaMap.get('alimento seco')?.id;
                        } else if (producto.name && producto.name.toLowerCase().includes('arena')) {
                            subcategoriaId = subcategoriaMap.get('arena sanitaria')?.id;
                        } else if (producto.name && producto.name.toLowerCase().includes('rascador')) {
                            subcategoriaId = subcategoriaMap.get('rascadores')?.id;
                        }
                    } else {
                        // Categoría general de accesorios
                        categoriaId = categoriaMap.get('accesorios');
                        
                        if (producto.name && (producto.name.toLowerCase().includes('shampoo') || producto.name.toLowerCase().includes('vitamina'))) {
                            subcategoriaId = subcategoriaMap.get('higiene')?.id;
                        } else if (producto.name && producto.name.toLowerCase().includes('transportadora')) {
                            subcategoriaId = subcategoriaMap.get('transporte')?.id;
                        } else if (producto.name && producto.name.toLowerCase().includes('comedero')) {
                            subcategoriaId = subcategoriaMap.get('comederos')?.id;
                        }
                    }
                }
                
                // Mapear marca
                let marcaId = null;
                if (producto.brand) {
                    const marcaNormalizada = producto.brand.toLowerCase();
                    marcaId = marcaMap.get(marcaNormalizada);
                } else if (producto.name) {
                    // Intentar extraer marca del nombre
                    const nombreLower = producto.name.toLowerCase();
                    for (const [marcaNombre, id] of marcaMap) {
                        if (nombreLower.includes(marcaNombre)) {
                            marcaId = id;
                            break;
                        }
                    }
                }
                
                // Si no se encontró marca, usar marca propia
                if (!marcaId) {
                    marcaId = marcaMap.get('petshop innovador');
                }
                
                // Actualizar producto con IDs normalizados
                await sequelize.query(`
                    UPDATE productos 
                    SET categoria_id = ?, subcategoria_id = ?, marca_id = ?
                    WHERE id = ?
                `, {
                    replacements: [categoriaId, subcategoriaId, marcaId, producto.id]
                });
                
                // Migrar imagen a tabla separada si existe
                if (producto.image) {
                    await sequelize.query(`
                        INSERT IGNORE INTO producto_imagenes (producto_id, imagen, es_principal, orden)
                        VALUES (?, ?, true, 0)
                    `, {
                        replacements: [producto.id, producto.image]
                    });
                }
                
                migrados++;
                console.log(`   ✅ ${producto.name} → Cat: ${categoriaId}, SubCat: ${subcategoriaId}, Marca: ${marcaId}`);
                
            } catch (error) {
                errores++;
                console.log(`   ❌ Error con ${producto.name}: ${error.message}`);
            }
        }
        
        console.log('\n🎉 MIGRACIÓN COMPLETADA!\n');
        
        // Verificar resultados
        console.log('📊 RESUMEN DE MIGRACIÓN:');
        console.log(`   ✅ Productos migrados: ${migrados}`);
        console.log(`   ❌ Errores: ${errores}`);
        console.log(`   📋 Total procesados: ${productos.length}`);
        
        // Mostrar estadísticas finales
        console.log('\n📊 ESTADÍSTICAS FINALES:');
        
        const [prodConCategoria] = await sequelize.query('SELECT COUNT(*) as total FROM productos WHERE categoria_id IS NOT NULL');
        const [prodConSubcategoria] = await sequelize.query('SELECT COUNT(*) as total FROM productos WHERE subcategoria_id IS NOT NULL');
        const [prodConMarca] = await sequelize.query('SELECT COUNT(*) as total FROM productos WHERE marca_id IS NOT NULL');
        const [imagenes] = await sequelize.query('SELECT COUNT(*) as total FROM producto_imagenes');
        
        console.log(`   📋 Productos con categoría: ${prodConCategoria[0].total}`);
        console.log(`   📂 Productos con subcategoría: ${prodConSubcategoria[0].total}`);
        console.log(`   🏷️ Productos con marca: ${prodConMarca[0].total}`);
        console.log(`   🖼️ Imágenes migradas: ${imagenes[0].total}`);
        
        // Mostrar distribución por categorías
        console.log('\n📋 DISTRIBUCIÓN POR CATEGORÍAS:');
        const [distribucion] = await sequelize.query(`
            SELECT c.nombre, COUNT(p.id) as total
            FROM categorias c
            LEFT JOIN productos p ON c.id = p.categoria_id
            GROUP BY c.id, c.nombre
            ORDER BY total DESC
        `);
        
        distribucion.forEach(cat => {
            console.log(`   📂 ${cat.nombre}: ${cat.total} productos`);
        });
        
        console.log('\n✨ ¡TU PETSHOP AHORA TIENE UNA BASE DE DATOS COMPLETAMENTE NORMALIZADA!');
        console.log('\n📋 PRÓXIMOS PASOS RECOMENDADOS:');
        console.log('1. Crear modelos Sequelize para todas las tablas');
        console.log('2. Actualizar controladores para usar relaciones');
        console.log('3. Implementar funcionalidades de carrito y órdenes');
        console.log('4. Crear panel de administración para gestionar categorías/marcas');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
        console.log('\n📴 Conexión cerrada');
    }
}

migrateProductsToNormalized().catch(console.error);
