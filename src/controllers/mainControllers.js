const fs = require('fs');
const path = require('path');
// Importar modelos de base de datos
const db = require('../database/models');

// Función para leer productos dinámicamente (FALLBACK)
const getProductos = () => {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, '../data/productos.json'), 'utf-8'));
    } catch (error) {
        console.error('Error al leer productos:', error);
        return [];
    }
};

const controller = {
    home: async (req, res) => {
        try {
            console.log('🏠 Cargando productos para home...');
            
            // Intentar usar base de datos primero
            let productosListados = [];
            let usingDatabase = false;
            
            try {
                // Buscar productos activos en la base de datos
                const productosDB = await db.Producto.findAll({
                    where: {
                        borrado: false
                    },
                    order: [
                        ['destacado', 'DESC'],
                        ['created_at', 'DESC']
                    ]
                });
                
                if (productosDB && productosDB.length > 0) {
                    productosListados = productosDB.map(producto => ({
                        id: producto.id,
                        nombre: producto.name,
                        descripcion: producto.description,
                        img: producto.image,
                        categoria: producto.category,
                        subcategoria: producto.subcategory,
                        marca: producto.brand,
                        color: producto.color,
                        precio: producto.price,
                        stock: producto.stock,
                        destacado: producto.destacado,
                        peso: producto.peso,
                        edad: producto.edad
                    }));
                    usingDatabase = true;
                    console.log('✅ Usando base de datos:', productosListados.length, 'productos');
                } else {
                    throw new Error('No se encontraron productos en la base de datos');
                }
                
            } catch (dbError) {
                console.warn('⚠️  Error con base de datos, usando JSON de respaldo:', dbError.message);
                
                // Fallback a JSON
                const listaProductos = getProductos();
                productosListados = listaProductos.filter(producto => !producto.borrado);
                productosListados = productosListados.map(producto => ({
                    id: producto.id,
                    nombre: producto.name,
                    descripcion: producto.description,
                    img: producto.image,
                    categoria: producto.category,
                    subcategoria: producto.subcategory,
                    marca: producto.brand,
                    color: producto.color,
                    precio: producto.price,
                    stock: producto.stock,
                    destacado: producto.destacado,
                    peso: producto.peso,
                    edad: producto.edad
                }));
                console.log('📄 Usando JSON de respaldo:', productosListados.length, 'productos');
            }
            
            res.render('home', { 
                listaProductos: productosListados,
                usingDatabase: usingDatabase
            });
            
        } catch (error) {
            console.error('💥 Error al cargar productos para home:', error);
            res.render('home', { 
                listaProductos: [],
                usingDatabase: false,
                error: 'Error al cargar productos'
            });
        }
    },

    productos: async (req, res) => {
        try {
            console.log('📋 Cargando página de productos...');
            
            let productosListados = [];
            let usingDatabase = false;
            
            try {
                // Usar base de datos primero
                const productosDB = await db.Producto.findAll({
                    where: { borrado: false },
                    order: [['name', 'ASC']]
                });
                
                if (productosDB && productosDB.length > 0) {
                    productosListados = productosDB.map(producto => ({
                        ...producto.toJSON(),
                        nombre: producto.name,
                        descripcion: producto.description,
                        categoria: producto.category,
                        precio: producto.price,
                        img: producto.image,
                        brand: producto.brand || 'PetShop Premium',
                        stock: producto.stock || 0
                    }));
                    usingDatabase = true;
                    console.log('✅ Usando base de datos para productos:', productosListados.length);
                } else {
                    throw new Error('No hay productos en BD');
                }
                
            } catch (dbError) {
                console.warn('⚠️ Error con BD, usando JSON:', dbError.message);
                // Fallback a JSON
                const listaProductos = getProductos();
                productosListados = listaProductos.filter(producto => !producto.borrado);
                
                productosListados = productosListados.map(producto => ({
                    ...producto,
                    nombre: producto.name,
                    descripcion: producto.description,
                    categoria: producto.category,
                    precio: producto.price,
                    img: producto.image,
                    brand: producto.brand || 'PetShop Premium',
                    stock: producto.stock || Math.floor(Math.random() * 20) + 1
                }));
            }

            // Obtener marcas únicas para el filtro
            const marcas = [...new Set(productosListados.map(p => p.brand).filter(Boolean))];

            res.render('productos', {
                productos: productosListados,
                categoria: 'Todos los Productos',
                totalProductos: productosListados.length,
                marcas: marcas,
                usingDatabase: usingDatabase,
                currentFilters: {
                    categoria: null,
                    mascota: null,
                    marca: null
                }
            });
        } catch (error) {
            console.error('❌ Error al cargar productos:', error);
            res.render('productos', {
                productos: [], // Cambiar a 'productos'
                categoria: 'Todos los Productos',
                totalProductos: 0,
                marcas: [],
                currentFilters: {
                    categoria: null,
                    mascota: null,
                    marca: null
                }
            });
        }
    },
    
    detail: async (req, res) => {
        try {
            console.log(`🔍 Cargando detalle del producto ID: ${req.params.id}`);
            let productFound = null;
            let productosRelacionados = [];
            let usingDatabase = false;
            
            try {
                // Buscar producto en la base de datos
                const productoDB = await db.Producto.findByPk(req.params.id, {
                    where: { borrado: false }
                });
                
                if (productoDB) {
                    productFound = {
                        id: productoDB.id,
                        nombre: productoDB.name,
                        descripcion: productoDB.description,
                        img: productoDB.image,
                        categoria: productoDB.category,
                        subcategoria: productoDB.subcategory,
                        marca: productoDB.brand,
                        color: productoDB.color,
                        precio: productoDB.price,
                        stock: productoDB.stock,
                        peso: productoDB.peso,
                        edad: productoDB.edad,
                        destacado: productoDB.destacado
                    };
                    
                    // Obtener productos relacionados de la misma categoría
                    const relacionadosDB = await db.Producto.findAll({
                        where: {
                            category: productoDB.category,
                            id: { [db.Sequelize.Op.ne]: productoDB.id },
                            borrado: false
                        },
                        limit: 4,
                        order: [['destacado', 'DESC'], ['created_at', 'DESC']]
                    });
                    
                    productosRelacionados = relacionadosDB.map(producto => ({
                        id: producto.id,
                        nombre: producto.name,
                        descripcion: producto.description,
                        img: producto.image,
                        categoria: producto.category,
                        color: producto.color,
                        precio: producto.price
                    }));
                    
                    usingDatabase = true;
                    console.log('✅ Producto encontrado en BD:', productFound.nombre);
                } else {
                    throw new Error('Producto no encontrado en BD');
                }
                
            } catch (dbError) {
                console.warn('⚠️ Error con BD, usando JSON:', dbError.message);
                // Fallback a JSON
                const listaProductos = getProductos();
                productFound = listaProductos.find(producto => producto.id == req.params.id);
                
                if (productFound) {
                    productFound = {
                        id: productFound.id,
                        nombre: productFound.name,
                        descripcion: productFound.description,
                        img: productFound.image,
                        categoria: productFound.category,
                        color: productFound.color,
                        precio: productFound.price
                    };

                    // Obtener productos relacionados
                    productosRelacionados = listaProductos
                        .filter(producto => 
                            producto.category === productFound.categoria && 
                            producto.id != productFound.id &&
                            !producto.borrado
                        )
                        .slice(0, 4)
                        .map(producto => ({
                            id: producto.id,
                            nombre: producto.name,
                            descripcion: producto.description,
                            img: producto.image,
                            categoria: producto.category,
                            color: producto.color,
                            precio: producto.price
                        }));
                }
            }
            
            if (productFound) {
                return res.render('detail', { 
                    producto: productFound, 
                    productosRelacionados: productosRelacionados,
                    usingDatabase: usingDatabase
                });
            }
            
            return res.render('detail', { 
                producto: {}, 
                productosRelacionados: [],
                usingDatabase: false
            });
        } catch (error) {
            console.error('❌ Error al cargar producto:', error);
            return res.render('detail', { producto: {}, productosRelacionados: [] });
        }
    },
   
    carrito:(req,res)=> {
        // Solo renderizar la vista simple, el contenido se carga con JavaScript
        res.render('carrito-simple');
    },

    // Agregar producto al carrito
    addToCart: async (req, res) => {
        try {
            const productId = parseInt(req.params.id);
            let producto = null;
            
            try {
                // Buscar producto en la base de datos primero
                const productoDB = await db.Producto.findByPk(productId, {
                    where: { borrado: false }
                });
                
                if (productoDB) {
                    producto = {
                        id: productoDB.id,
                        name: productoDB.name,
                        price: productoDB.price,
                        image: productoDB.image,
                        stock: productoDB.stock
                    };
                    console.log('✅ Producto para carrito desde BD:', producto.name);
                } else {
                    throw new Error('Producto no encontrado en BD');
                }
                
            } catch (dbError) {
                console.warn('⚠️ Error con BD para carrito, usando JSON:', dbError.message);
                // Fallback a JSON
                const listaProductos = getProductos();
                const productoJSON = listaProductos.find(p => p.id === productId);
                if (productoJSON) {
                    producto = {
                        id: productoJSON.id,
                        name: productoJSON.name,
                        price: productoJSON.price,
                        image: productoJSON.image,
                        stock: productoJSON.stock
                    };
                }
            }
            
            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            // Inicializar carrito si no existe
            if (!req.session.carrito) {
                req.session.carrito = [];
            }

            // Buscar si el producto ya está en el carrito
            const existingItem = req.session.carrito.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.cantidad += 1;
            } else {
                req.session.carrito.push({
                    id: producto.id,
                    nombre: producto.name,
                    precio: producto.price,
                    img: producto.image,
                    cantidad: 1
                });
            }

            // Calcular total de items en carrito
            const cartCount = req.session.carrito.reduce((sum, item) => sum + item.cantidad, 0);
            
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                // Si es una petición AJAX, enviar respuesta JSON
                return res.json({ 
                    success: true, 
                    message: 'Producto agregado al carrito',
                    cartCount: cartCount 
                });
            } else {
                // Si es navegación normal, redirigir al carrito
                return res.redirect('/carrito');
            }
        } catch (error) {
            console.error('❌ Error al agregar producto al carrito:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    // Actualizar cantidad en carrito
    updateCartItem: (req, res) => {
        const productId = parseInt(req.params.id);
        const nuevaCantidad = parseInt(req.body.cantidad);
        
        if (req.session.carrito) {
            const item = req.session.carrito.find(item => item.id === productId);
            if (item) {
                if (nuevaCantidad > 0) {
                    item.cantidad = nuevaCantidad;
                } else {
                    // Si cantidad es 0, eliminar del carrito
                    req.session.carrito = req.session.carrito.filter(item => item.id !== productId);
                }
            }
        }
        
        res.redirect('/carrito');
    },

    // Eliminar producto del carrito
    removeFromCart: (req, res) => {
        const productId = parseInt(req.params.id);
        
        if (req.session.carrito) {
            req.session.carrito = req.session.carrito.filter(item => item.id !== productId);
        }
        
        res.redirect('/carrito');
    },

    // Limpiar carrito
    clearCart: (req, res) => {
        req.session.carrito = [];
        res.redirect('/carrito');
    },
    create: async (req, res) => {
        try {
            console.log('🛍️ Creando nuevo producto...');
            
            const nuevoProducto = await db.Producto.create({
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                price: parseFloat(req.body.price),
                color: req.body.color || "No especificado",
                image: req.file ? req.file.filename : 'logo_petshop.jpeg',
                borrado: false,
                stock: parseInt(req.body.stock) || 0,
                destacado: false
            });
            
            console.log(`✅ Producto creado en BD: ${nuevoProducto.name}`);
            res.redirect('/');
            
        } catch (error) {
            console.error('❌ Error al crear producto:', error);
            // Fallback a JSON si falla
            try {
                let listaProductos = getProductos();
                let nuevoProducto = {
                    "id": listaProductos.length > 0 ? Math.max(...listaProductos.map(p => p.id)) + 1 : 1,
                    "name": req.body.name,
                    "description": req.body.description,
                    "category": req.body.category,
                    "price": req.body.price,
                    "color": req.body.color,
                    "image": req.file ? req.file.filename : 'logo_petshop.jpeg',
                    "borrado": false
                }
                
                listaProductos.push(nuevoProducto);
                fs.writeFileSync(path.join(__dirname, "../data/productos.json"), JSON.stringify(listaProductos, null, 2), "utf-8")
                console.log('⚠️ Producto creado en JSON fallback');
                res.redirect('/');
            } catch (fallbackError) {
                console.error('❌ Error también en JSON fallback:', fallbackError);
                res.status(500).send('Error al crear producto');
            }
        }
    },
    store: async (req, res) => {
        try {
            if (!req.file) {
                console.error("❌ No se subió ninguna imagen");
                return res.render('create', { error: 'Imagen requerida' });
            }
            
            console.log('🛍️ Guardando nuevo producto con imagen...');
            
            const nuevoProducto = await db.Producto.create({
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                price: parseFloat(req.body.price),
                color: req.body.color || "No especificado",
                image: req.file.filename,
                borrado: false,
                stock: parseInt(req.body.stock) || 0,
                destacado: false
            });
            
            console.log(`✅ Producto guardado en BD: ${nuevoProducto.name}`);
            res.redirect("/productos");
            
        } catch (error) {
            console.error('❌ Error al guardar producto:', error);
            // Fallback a JSON
            try {
                if (req.file) {
                    let listaProductos = getProductos();
                    let nuevoProducto = {
                        "id": listaProductos.length > 0 ? Math.max(...listaProductos.map(p => p.id)) + 1 : 1,
                        "name": req.body.name,
                        "description": req.body.description,
                        "category": req.body.category,
                        "price": req.body.price,
                        "color": req.body.color,
                        "image": req.file.filename,
                        "borrado": false
                    }
                    
                    listaProductos.push(nuevoProducto)
                    fs.writeFileSync(path.join(__dirname, "../data/productos.json"), JSON.stringify(listaProductos, null, 2), "utf-8")
                    console.log('⚠️ Producto guardado en JSON fallback');
                    res.redirect("/productos");
                } else {
                    res.render('create', { error: 'Imagen requerida' });
                }
            } catch (fallbackError) {
                console.error('❌ Error también en JSON fallback:', fallbackError);
                res.status(500).send('Error al guardar producto');
            }
        }
    }, 
    edit: async (req, res) => {
        try {
            const productId = req.params.id;
            console.log(`✏️ Editando producto ID: ${productId}`);
            
            const producto = await db.Producto.findByPk(productId);
            if (producto) {
                res.render("editar", { producto: producto });
            } else {
                res.status(404).send('Producto no encontrado');
            }
        } catch (error) {
            console.error('❌ Error al buscar producto para editar:', error);
            res.status(500).send('Error al cargar producto');
        }
    },
    
    update: async (req, res) => {
        try {
            const productId = req.params.id;
            console.log(`🔄 Actualizando producto ID: ${productId}`);
            
            const [updatedRowsCount] = await db.Producto.update({
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                color: req.body.color,
                price: parseFloat(req.body.price),
                stock: parseInt(req.body.stock) || 0,
                image: req.file ? req.file.filename : undefined
            }, {
                where: { id: productId }
            });
            
            if (updatedRowsCount > 0) {
                console.log(`✅ Producto ${productId} actualizado en BD`);
                res.redirect("/");
            } else {
                res.status(404).send('Producto no encontrado');
            }
            
        } catch (error) {
            console.error('❌ Error al actualizar producto:', error);
            // Fallback a JSON si falla
            try {
                let listaProductos = getProductos();
                let productoEncontrado = listaProductos.find(p => p.id == req.params.id);
                if (productoEncontrado) {
                    productoEncontrado.name = req.body.name;
                    productoEncontrado.description = req.body.description;
                    productoEncontrado.category = req.body.category;
                    productoEncontrado.color = req.body.color;
                    productoEncontrado.price = req.body.price;
                    if (req.file) {
                        productoEncontrado.image = req.file.filename;
                    }
                    
                    fs.writeFileSync(path.join(__dirname, "../data/productos.json"), JSON.stringify(listaProductos, null, 2), "utf-8");
                    console.log('⚠️ Producto actualizado en JSON fallback');
                }
                res.redirect("/");
            } catch (fallbackError) {
                console.error('❌ Error también en JSON fallback:', fallbackError);
                res.status(500).send('Error al actualizar producto');
            }
        }
    },
    
    delete: async (req, res) => {
        try {
            const productId = req.params.id;
            console.log(`🗑️ Eliminando producto ID: ${productId}`);
            
            const [updatedRowsCount] = await db.Producto.update({
                borrado: true
            }, {
                where: { id: productId }
            });
            
            if (updatedRowsCount > 0) {
                console.log(`✅ Producto ${productId} marcado como borrado en BD`);
                res.redirect("/");
            } else {
                res.status(404).send('Producto no encontrado');
            }
            
        } catch (error) {
            console.error('❌ Error al eliminar producto:', error);
            // Fallback a JSON si falla
            try {
                let listaProductos = getProductos();
                let productoEncontrado = listaProductos.find(producto => producto.id == req.params.id);
                if (productoEncontrado) {
                    productoEncontrado.borrado = true;
                    fs.writeFileSync(path.join(__dirname, "../data/productos.json"), JSON.stringify(listaProductos, null, 2), "utf-8");
                    console.log('⚠️ Producto eliminado en JSON fallback');
                }
                res.redirect("/");
            } catch (fallbackError) {
                console.error('❌ Error también en JSON fallback:', fallbackError);
                res.status(500).send('Error al eliminar producto');
            }
        }
    }
}

module.exports = controller