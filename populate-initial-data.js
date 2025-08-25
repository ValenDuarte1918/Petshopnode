require('dotenv').config();
const { Sequelize } = require('sequelize');

// Script para poblar datos iniciales en las nuevas tablas

async function populateInitialData() {
    console.log('🌱 POBLANDO DATOS INICIALES');
    console.log('==========================\n');
    
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
        
        // 1. CATEGORÍAS INICIALES
        console.log('📋 Insertando categorías...');
        const categorias = [
            { nombre: 'Perros', descripcion: 'Productos para perros de todas las edades', imagen: 'dog-category.jpg' },
            { nombre: 'Gatos', descripcion: 'Productos para gatos y felinos', imagen: 'cat-category.jpg' },
            { nombre: 'Accesorios', descripcion: 'Accesorios generales para mascotas', imagen: 'toys-category.jpg' },
            { nombre: 'Alimentos', descripcion: 'Alimentos balanceados y snacks', imagen: 'food-category.jpg' }
        ];
        
        for (const cat of categorias) {
            await sequelize.query(`
                INSERT IGNORE INTO categorias (nombre, descripcion, imagen) 
                VALUES (?, ?, ?)
            `, {
                replacements: [cat.nombre, cat.descripcion, cat.imagen]
            });
            console.log(`   ✅ ${cat.nombre}`);
        }
        
        // 2. SUBCATEGORÍAS
        console.log('\n📋 Insertando subcategorías...');
        const subcategorias = [
            // Perros
            { categoria: 'Perros', nombre: 'Alimento Seco', descripcion: 'Croquetas y alimento balanceado' },
            { categoria: 'Perros', nombre: 'Juguetes', descripcion: 'Juguetes para entretenimiento' },
            { categoria: 'Perros', nombre: 'Camas y Descanso', descripcion: 'Camas, mantas y lugares de descanso' },
            { categoria: 'Perros', nombre: 'Collares y Correas', descripcion: 'Accesorios para pasear' },
            
            // Gatos
            { categoria: 'Gatos', nombre: 'Alimento Seco', descripcion: 'Croquetas para gatos' },
            { categoria: 'Gatos', nombre: 'Arena Sanitaria', descripcion: 'Arena para cajas sanitarias' },
            { categoria: 'Gatos', nombre: 'Rascadores', descripcion: 'Rascadores y torres' },
            { categoria: 'Gatos', nombre: 'Juguetes', descripcion: 'Juguetes específicos para gatos' },
            
            // Accesorios
            { categoria: 'Accesorios', nombre: 'Higiene', descripcion: 'Productos de higiene y cuidado' },
            { categoria: 'Accesorios', nombre: 'Transporte', descripcion: 'Transportadoras y carriers' },
            { categoria: 'Accesorios', nombre: 'Comederos', descripcion: 'Platos y comederos' },
            
            // Alimentos
            { categoria: 'Alimentos', nombre: 'Premium', descripcion: 'Alimentos premium y super premium' },
            { categoria: 'Alimentos', nombre: 'Snacks', descripcion: 'Premios y snacks' },
            { categoria: 'Alimentos', nombre: 'Medicados', descripcion: 'Alimentos terapéuticos' }
        ];
        
        for (const subcat of subcategorias) {
            // Obtener ID de la categoría
            const [catResult] = await sequelize.query(
                'SELECT id FROM categorias WHERE nombre = ?',
                { replacements: [subcat.categoria] }
            );
            
            if (catResult.length > 0) {
                const categoriaId = catResult[0].id;
                await sequelize.query(`
                    INSERT IGNORE INTO subcategorias (categoria_id, nombre, descripcion) 
                    VALUES (?, ?, ?)
                `, {
                    replacements: [categoriaId, subcat.nombre, subcat.descripcion]
                });
                console.log(`   ✅ ${subcat.categoria} → ${subcat.nombre}`);
            }
        }
        
        // 3. MARCAS
        console.log('\n🏷️ Insertando marcas...');
        const marcas = [
            { nombre: 'Royal Canin', descripcion: 'Nutrición científica para mascotas', logo: 'royal-canin-logo.png' },
            { nombre: 'Pro Plan', descripcion: 'Nutrición avanzada Purina Pro Plan', logo: 'pro-plan-logo.png' },
            { nombre: 'Excellent', descripcion: 'Alimento premium nacional', logo: 'excellent-logo.png' },
            { nombre: 'Hills', descripcion: 'Hills Science Diet', logo: 'hills-logo.png' },
            { nombre: 'Whiskas', descripcion: 'Alimento para gatos', logo: 'whiskas-logo.png' },
            { nombre: 'Kong', descripcion: 'Juguetes resistentes', logo: 'kong-logo.png' },
            { nombre: 'Flexi', descripcion: 'Correas retráctiles', logo: 'flexi-logo.png' },
            { nombre: 'Petshop Innovador', descripcion: 'Marca propia de accesorios', logo: 'petshop-logo.png' }
        ];
        
        for (const marca of marcas) {
            await sequelize.query(`
                INSERT IGNORE INTO marcas (nombre, descripcion, logo) 
                VALUES (?, ?, ?)
            `, {
                replacements: [marca.nombre, marca.descripcion, marca.logo]
            });
            console.log(`   ✅ ${marca.nombre}`);
        }
        
        // 4. USUARIOS DE PRUEBA
        console.log('\n👥 Insertando usuarios de prueba...');
        const bcrypt = require('bcrypt');
        
        const usuarios = [
            {
                nombre: 'Admin',
                apellido: 'PetShop',
                email: 'admin@petshop.com',
                password: await bcrypt.hash('admin123', 10),
                rol: 'admin'
            },
            {
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan@email.com',
                password: await bcrypt.hash('123456', 10),
                telefono: '+54 11 1234-5678',
                rol: 'cliente'
            },
            {
                nombre: 'María',
                apellido: 'González',
                email: 'maria@email.com',
                password: await bcrypt.hash('123456', 10),
                telefono: '+54 11 8765-4321',
                rol: 'cliente'
            }
        ];
        
        for (const usuario of usuarios) {
            const replacements = [usuario.nombre, usuario.apellido, usuario.email, usuario.password, usuario.telefono || null, usuario.rol];
            await sequelize.query(`
                INSERT IGNORE INTO usuarios (nombre, apellido, email, password, telefono, rol) 
                VALUES (?, ?, ?, ?, ?, ?)
            `, {
                replacements: replacements
            });
            console.log(`   ✅ ${usuario.nombre} ${usuario.apellido} (${usuario.rol})`);
        }
        
        console.log('\n🎉 DATOS INICIALES INSERTADOS CORRECTAMENTE!\n');
        
        // Mostrar resumen
        console.log('📊 RESUMEN:');
        const [catCount] = await sequelize.query('SELECT COUNT(*) as total FROM categorias');
        const [subcatCount] = await sequelize.query('SELECT COUNT(*) as total FROM subcategorias');
        const [marcasCount] = await sequelize.query('SELECT COUNT(*) as total FROM marcas');
        const [usuariosCount] = await sequelize.query('SELECT COUNT(*) as total FROM usuarios');
        
        console.log(`   📋 Categorías: ${catCount[0].total}`);
        console.log(`   📂 Subcategorías: ${subcatCount[0].total}`);
        console.log(`   🏷️ Marcas: ${marcasCount[0].total}`);
        console.log(`   👥 Usuarios: ${usuariosCount[0].total}`);
        
        console.log('\n📋 PRÓXIMO PASO:');
        console.log('Ejecutar: node migrate-products-to-normalized.js');
        console.log('(para migrar productos existentes a la estructura normalizada)');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
        console.log('\n📴 Conexión cerrada');
    }
}

populateInitialData().catch(console.error);
