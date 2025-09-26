const fs = require('fs');
const path = require('path');
// Importar modelos de base de datos
const db = require('../database/models');

const controller = {
    home: async (req, res) => {
        try {
            const productosDB = await db.Producto.findAll({
                where: { borrado: false },
                limit: 12,
                order: [['created_at', 'DESC']]
            });
            
            const productosListados = productosDB.map(producto => ({
                id: producto.id,
                nombre: producto.name,
                descripcion: producto.description,
                img: producto.image,
                categoria: producto.category,
                color: producto.color,
                precio: producto.price,
                stock: producto.stock
            }));
            
            res.render('home', { listaProductos: productosListados });
            
        } catch (error) {
            console.error('Error al cargar productos:', error);
            res.status(500).render('error', {
                message: 'Error al cargar productos',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    productos: async (req, res) => {
        try {
            const productosDB = await db.Producto.findAll({
                where: { borrado: false },
                order: [['name', 'ASC']]
            });
            
            const productos = productosDB.map(producto => ({
                id: producto.id,
                nombre: producto.name,
                descripcion: producto.description,
                img: producto.image,
                categoria: producto.category,
                subcategoria: producto.subcategory,
                brand: producto.brand,
                color: producto.color,
                precio: producto.price,
                stock: producto.stock
            }));
            
            // Obtener marcas únicas para el filtro
            const marcas = [...new Set(productos.map(p => p.brand).filter(Boolean))];
            
            res.render('productos', {
                productos: productos,
                categoria: 'Todos los productos',
                totalProductos: productos.length,
                marcas: marcas,
                currentFilters: {
                    categoria: null,
                    mascota: null,
                    marca: null
                }
            });
            
        } catch (error) {
            console.error('Error al cargar productos:', error);
            res.status(500).render('error', {
                message: 'Error al cargar productos',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    addToCart: async (req, res) => {
        try {
            // Verificar si el usuario está logueado (doble verificación)
            if (!req.session.userLogged) {
                // Si es una petición AJAX, devolver JSON
                if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                    return res.status(401).json({ 
                        success: false, 
                        message: 'Debes iniciar sesión para agregar productos al carrito',
                        redirectUrl: '/users/login'
                    });
                }
                // Si no es AJAX, redirigir al login
                return res.redirect('/users/login?redirect=' + encodeURIComponent(req.originalUrl));
            }

            const { productId, id, cantidad = 1 } = req.body;
            const productoId = productId || id; // Aceptar ambos nombres
            
            // Verificar que el producto existe en la BD
            const producto = await db.Producto.findByPk(productoId, {
                where: { borrado: false }
            });
            
            if (!producto) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Producto no encontrado' 
                });
            }

            // Verificar stock disponible
            if (producto.stock < cantidad) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Stock insuficiente' 
                });
            }

            // Inicializar carrito si no existe
            if (!req.session.cart) {
                req.session.cart = [];
            }

            // Buscar si el producto ya está en el carrito
            const existingItemIndex = req.session.cart.findIndex(item => item.id == productoId);

            if (existingItemIndex >= 0) {
                // Calcular nueva cantidad solicitada
                const nuevaCantidad = req.session.cart[existingItemIndex].cantidad + parseInt(cantidad);

                // Verificar stock disponible para la suma de cantidades
                if (producto.stock < nuevaCantidad) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Stock insuficiente', 
                        availableStock: producto.stock
                    });
                }

                // Actualizar cantidad
                req.session.cart[existingItemIndex].cantidad = nuevaCantidad;
            } else {
                // Agregar nuevo producto
                req.session.cart.push({
                    id: producto.id,
                    nombre: producto.name,
                    precio: producto.price,
                    imagen: producto.image,
                    categoria: producto.category,
                    color: producto.color,
                    cantidad: parseInt(cantidad)
                });
            }

            const totalItems = req.session.cart.reduce((total, item) => total + item.cantidad, 0);
            
            res.json({ 
                success: true, 
                message: 'Producto agregado al carrito',
                cartCount: totalItems
            });
            
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error interno del servidor' 
            });
        }
    },

    edit: async (req, res) => {
        try {
            const producto = await db.Producto.findByPk(req.params.id);
            
            if (!producto) {
                return res.status(404).render('error', {
                    message: 'Producto no encontrado',
                    error: {}
                });
            }
            
            res.render('editar', { 
                productToEdit: {
                    id: producto.id,
                    name: producto.name,
                    description: producto.description,
                    image: producto.image,
                    category: producto.category,
                    subcategory: producto.subcategory,
                    brand: producto.brand,
                    color: producto.color,
                    price: producto.price,
                    stock: producto.stock,
                    peso: producto.peso,
                    edad: producto.edad
                }
            });
            
        } catch (error) {
            res.status(500).render('error', {
                message: 'Error al cargar producto',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    update: async (req, res) => {
        try {
            const updateData = {
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                subcategory: req.body.subcategory,
                brand: req.body.brand,
                color: req.body.color,
                price: parseFloat(req.body.price),
                stock: parseInt(req.body.stock) || 0,
                peso: req.body.peso || '',
                edad: req.body.edad || ''
            };

            if (req.file) {
                updateData.image = req.file.filename;
            }

            await db.Producto.update(updateData, {
                where: { id: req.params.id }
            });

            res.redirect('/productos');
            
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            res.status(500).render('error', {
                message: 'Error al actualizar producto',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    delete: async (req, res) => {
        try {
            await db.Producto.update(
                { borrado: true },
                { where: { id: req.params.id } }
            );
            
            res.redirect('/productos');
            
        } catch (error) {
            console.error('Error al borrar producto:', error);
            res.status(500).render('error', {
                message: 'Error al borrar producto',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    carrito: (req, res) => {
        const cart = req.session.cart || [];
        const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        
        res.render('carrito', { 
            carrito: cart,
            cart: cart,
            total: total,
            user: req.session.userLogged || null,
            isLoggedIn: !!req.session.userLogged,
            userLogged: req.session.userLogged || null
        });
    },

    updateCartItem: (req, res) => {
        try {
            const isAjax = req.xhr || 
                           req.headers.accept?.indexOf('json') > -1 || 
                           req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                           req.headers['content-type']?.indexOf('json') > -1;
            const { id } = req.params;
            const { cantidad } = req.body;
            
            if (!req.session.cart) {
                if (isAjax) {
                    return res.status(400).json({ success: false, message: 'Carrito vacío' });
                }
                return res.redirect('/carrito');
            }
            
            const itemIndex = req.session.cart.findIndex(item => item.id == id);
            if (itemIndex >= 0) {
                req.session.cart[itemIndex].cantidad = parseInt(cantidad);
                const total = req.session.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
                const totalItems = req.session.cart.reduce((sum, item) => sum + item.cantidad, 0);
                
                // Si es petición AJAX, devolver JSON
                if (isAjax) {
                    return res.json({ success: true, total: total, cartCount: totalItems });
                }
                
                // Si es petición normal, redirigir al carrito
                res.redirect('/carrito');
            } else {
                if (isAjax) {
                    return res.status(404).json({ success: false, message: 'Producto no encontrado en carrito' });
                }
                res.redirect('/carrito');
            }
        } catch (error) {
            if (isAjax) {
                return res.status(500).json({ success: false, message: 'Error interno del servidor' });
            }
            
            res.redirect('/carrito?error=1');
        }
    },

    removeFromCart: (req, res) => {
        try {
            const { id } = req.params;
            
            if (!req.session.cart) {
                if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                    return res.status(400).json({ success: false, message: 'Carrito vacío' });
                }
                return res.redirect('/carrito');
            }
            
            req.session.cart = req.session.cart.filter(item => item.id != id);
            const total = req.session.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            const totalItems = req.session.cart.reduce((sum, item) => sum + item.cantidad, 0);
            
            // Si es petición AJAX, devolver JSON
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.json({ success: true, total: total, cartCount: totalItems });
            }
            
            // Si es petición normal, redirigir al carrito
            res.redirect('/carrito');
        } catch (error) {
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(500).json({ success: false, message: 'Error interno del servidor' });
            }
            
            res.redirect('/carrito?error=1');
        }
    },

    clearCart: (req, res) => {
        try {
            req.session.cart = [];
            
            // Si es una petición AJAX, devolver JSON
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.json({ success: true, message: 'Carrito vaciado' });
            }
            
            // Si es una petición normal del navegador, redirigir al carrito
            res.redirect('/carrito');
        } catch (error) {
            // Si es AJAX, devolver error JSON
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(500).json({ success: false, message: 'Error interno del servidor' });
            }
            
            // Si es navegador, redirigir con error
            res.redirect('/carrito?error=1');
        }
    },

    create: (req, res) => {
        res.render('create');
    },

    store: async (req, res) => {
        try {
            await db.Producto.create({
                name: req.body.name,
                description: req.body.description,
                image: req.file ? req.file.filename : 'imagen1.jpg',
                category: req.body.category,
                subcategory: req.body.subcategory,
                brand: req.body.brand,
                color: req.body.color,
                price: parseFloat(req.body.price),
                stock: parseInt(req.body.stock) || 0,
                peso: req.body.peso || '',
                edad: req.body.edad || '',
                borrado: false
            });
            
            res.redirect('/productos');
            
        } catch (error) {
            console.error('Error al crear producto:', error);
            res.status(500).render('error', {
                message: 'Error al crear producto',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    detail: async (req, res) => {
        try {
            // Usar base de datos
            const productoDB = await db.Producto.findByPk(req.params.id, {
                where: { borrado: false }
            });
            
            if (!productoDB) {
                return res.status(404).render('error', { 
                    message: 'Producto no encontrado',
                    error: {}
                });
            }
            
            const productFound = {
                id: productoDB.id,
                nombre: productoDB.name,
                descripcion: productoDB.description,
                img: productoDB.image,
                categoria: productoDB.category,
                color: productoDB.color,
                precio: productoDB.price,
                stock: productoDB.stock,
                peso: productoDB.peso,
                edad: productoDB.edad
            };
            
            // Obtener productos relacionados
            const relacionadosDB = await db.Producto.findAll({
                where: {
                    category: productoDB.category,
                    id: { [db.Sequelize.Op.ne]: productoDB.id },
                    borrado: false
                },
                limit: 4,
                order: [['created_at', 'DESC']]
            });
            
            const productosRelacionados = relacionadosDB.map(producto => ({
                id: producto.id,
                nombre: producto.name,
                descripcion: producto.description,
                img: producto.image,
                categoria: producto.category,
                color: producto.color,
                precio: producto.price,
                stock: producto.stock
            }));
            
            return res.render('detail', { 
                producto: productFound, 
                productosRelacionados: productosRelacionados 
            });
            
        } catch (error) {
            console.error('Error al cargar producto:', error);
            return res.status(500).render('error', { 
                message: 'Error al cargar producto',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    registro: (req, res) => {
        res.render('registro');
    },

    login: (req, res) => {
        res.render('login');
    },

    profile: (req, res) => {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        res.render('profile', { user: req.session.user });
    },

    // Vista de checkout
    checkout: (req, res) => {
        if (!req.session.userLogged) {
            return res.redirect('/users/login');
        }
        
        // Verificar que el carrito no esté vacío
        const cart = req.session.cart || [];
        if (cart.length === 0) {
            return res.redirect('/carrito');
        }
        
        res.render('checkout', { 
            user: req.session.userLogged,
            cart: cart
        });
    },

    // Vista de confirmación de pedido
    orderConfirmation: (req, res) => {
        if (!req.session.userLogged) {
            return res.redirect('/users/login');
        }
        
        const orderId = req.query.orderId;
        if (!orderId) {
            return res.redirect('/');
        }
        
        // Limpiar carrito después de la compra exitosa
        req.session.cart = [];
        
        res.render('order-confirmation', { 
            user: req.session.userLogged,
            orderId: orderId
        });
    }
}

module.exports = controller;
