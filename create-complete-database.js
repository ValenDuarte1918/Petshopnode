require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Script para crear estructura completa de base de datos para e-commerce

async function createCompleteDatabase() {
    console.log('🚀 CREANDO ESTRUCTURA COMPLETA DE E-COMMERCE');
    console.log('===========================================\n');
    
    const config = require('./src/database/config/config.js').development;
    
    const sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        dialect: config.dialect,
        port: config.port,
        logging: console.log
    });
    
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida\n');
        
        // 1. CATEGORÍAS
        console.log('📋 Creando tabla: categorias');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS categorias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL UNIQUE,
                descripcion TEXT,
                imagen VARCHAR(255),
                activa BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        // 2. SUBCATEGORÍAS
        console.log('📋 Creando tabla: subcategorias');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS subcategorias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                categoria_id INT NOT NULL,
                nombre VARCHAR(100) NOT NULL,
                descripcion TEXT,
                activa BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
                UNIQUE KEY unique_subcat_per_cat (categoria_id, nombre)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        // 3. MARCAS
        console.log('📋 Creando tabla: marcas');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS marcas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL UNIQUE,
                descripcion TEXT,
                logo VARCHAR(255),
                activa BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        // 4. USUARIOS
        console.log('👥 Creando tabla: usuarios');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                apellido VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                telefono VARCHAR(20),
                fecha_nacimiento DATE,
                avatar VARCHAR(255),
                rol ENUM('cliente', 'admin') DEFAULT 'cliente',
                activo BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        // 5. DIRECCIONES
        console.log('🏠 Creando tabla: direcciones');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS direcciones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                alias VARCHAR(50) DEFAULT 'Principal',
                calle VARCHAR(255) NOT NULL,
                numero VARCHAR(10) NOT NULL,
                ciudad VARCHAR(100) NOT NULL,
                provincia VARCHAR(100) NOT NULL,
                codigo_postal VARCHAR(10) NOT NULL,
                es_principal BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        // 6. ACTUALIZAR PRODUCTOS (agregar foreign keys)
        console.log('🛍️ Actualizando tabla: productos');
        await sequelize.query(`
            ALTER TABLE productos 
            ADD COLUMN IF NOT EXISTS categoria_id INT,
            ADD COLUMN IF NOT EXISTS subcategoria_id INT,
            ADD COLUMN IF NOT EXISTS marca_id INT;
        `);
        
        // 7. IMÁGENES DE PRODUCTOS
        console.log('🖼️ Creando tabla: producto_imagenes');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS producto_imagenes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                producto_id INT NOT NULL,
                imagen VARCHAR(255) NOT NULL,
                es_principal BOOLEAN DEFAULT false,
                orden INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        // 8. CARRITOS
        console.log('🛒 Creando tabla: carritos');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS carritos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                UNIQUE KEY one_cart_per_user (usuario_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        // 9. ITEMS DEL CARRITO
        console.log('📦 Creando tabla: carrito_items');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS carrito_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                carrito_id INT NOT NULL,
                producto_id INT NOT NULL,
                cantidad INT NOT NULL DEFAULT 1,
                precio_unitario DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (carrito_id) REFERENCES carritos(id) ON DELETE CASCADE,
                FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
                UNIQUE KEY unique_product_in_cart (carrito_id, producto_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        // 10. ÓRDENES
        console.log('📋 Creando tabla: ordenes');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS ordenes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                numero_orden VARCHAR(50) NOT NULL UNIQUE,
                subtotal DECIMAL(10,2) NOT NULL,
                impuestos DECIMAL(10,2) DEFAULT 0,
                envio DECIMAL(10,2) DEFAULT 0,
                total DECIMAL(10,2) NOT NULL,
                estado ENUM('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
                metodo_pago VARCHAR(50),
                direccion_envio JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        // 11. ITEMS DE ÓRDENES
        console.log('📦 Creando tabla: orden_items');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS orden_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                orden_id INT NOT NULL,
                producto_id INT NOT NULL,
                cantidad INT NOT NULL,
                precio_unitario DECIMAL(10,2) NOT NULL,
                subtotal DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE,
                FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        console.log('\n🎉 ESTRUCTURA COMPLETA CREADA!\n');
        
        // Mostrar resumen
        const [tables] = await sequelize.query('SHOW TABLES');
        console.log('📊 TABLAS CREADAS:');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   ✅ ${tableName}`);
        });
        
        console.log('\n📋 PRÓXIMOS PASOS RECOMENDADOS:');
        console.log('1. Ejecutar: node populate-initial-data.js (poblar datos iniciales)');
        console.log('2. Migrar datos existentes de productos a nuevas tablas');
        console.log('3. Crear modelos Sequelize para cada tabla');
        console.log('4. Actualizar controladores para usar nuevas relaciones');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
        console.log('\n📴 Conexión cerrada');
    }
}

createCompleteDatabase().catch(console.error);
