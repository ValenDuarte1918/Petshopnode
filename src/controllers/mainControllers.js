const fs = require('fs');
const path = require('path');
// Comentamos temporalmente la conexión a la base de datos
// const db = require('../database/models');

//traigo la lista de productos
const listaProductos = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/productos.json'), 'utf-8'));

const controller = {
    home: async (req,res)=> {
        try {
            // Usar datos JSON temporalmente
            let productosListados = listaProductos.filter(producto => !producto.borrado);
            // Mapear los datos para que coincidan con la estructura esperada
            productosListados = productosListados.map(producto => ({
                id: producto.id,
                nombre: producto.name,
                descripcion: producto.description,
                img: producto.image,
                categoria: producto.category,
                color: producto.color,
                precio: producto.price
            }));
            res.render('home', {productos: productosListados})
        } catch (error) {
            console.error('Error al cargar productos:', error);
            res.render('home', {productos: []});
        }
    },
    
    detail:async (req, res) => {
        try {
            // Usar datos JSON temporalmente
            let productFound = listaProductos.find(producto => producto.id == req.params.id);
            if (productFound) {
                // Mapear los datos para que coincidan con la estructura esperada
                productFound = {
                    id: productFound.id,
                    nombre: productFound.name,
                    descripcion: productFound.description,
                    img: productFound.image,
                    categoria: productFound.category,
                    color: productFound.color,
                    precio: productFound.price
                };
            }
            return res.render('detail', { producto: productFound || {} });
        } catch (error) {
            console.error('Error al cargar producto:', error);
            return res.render('detail', { producto: {} });
        }
    },
   
    carrito:(req,res)=> {
        // Obtener carrito de la sesión
        const carrito = req.session.carrito || [];
        let total = 0;
        
        // Calcular total del carrito
        carrito.forEach(item => {
            total += parseFloat(item.precio) * item.cantidad;
        });
        
        res.render('carrito', { 
            carrito: carrito, 
            total: total.toFixed(2),
            cartCount: carrito.reduce((sum, item) => sum + item.cantidad, 0)
        });
    },

    // Agregar producto al carrito
    addToCart: (req, res) => {
        const productId = parseInt(req.params.id);
        const producto = listaProductos.find(p => p.id === productId);
        
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
    create:(req,res)=> {
       
            let nuevoProducto = {
              "id": listaProductos[listaProductos.length - 1].id + 1,
              "name": req.body.name,
              "description": req.body.description,
              "category": req.body.category,
              "price": req.body.price,
              "color": req.body.color,
              "img": req.file ? req.file.filename : '',
              "borrado": false
            }
          
            // Añado el nuevo producto a la lista de productos
            listaProductos.push(nuevoProducto);
            fs.writeFileSync(path.join(__dirname, "../data/productos.json"), JSON.stringify(listaProductos, null, 2), "utf-8")
            // Redirijo al usuario a la página de inicio
        res.redirect('/');
    },
    store:(req,res)=> {
        //creo un nuevo producto con los datos que me llegan por body
        if(req.file){
            let nuevoProducto = {
                "id": listaProductos[listaProductos.length - 1].id + 1,
                "name": req.body.name,
                "desription": req.body.description,
                "category": req.body.category,
                "price": req.body.price,
                "color": req.body.color,
                "img": req.file.filename,
                "borrado": false
            }
            console.log('Entro por post', nuevoProducto)
            //agrego el nuevo producto a la lista de productos
            listaProductos.push(nuevoProducto)
            //escribo la lista de productos en el archivo productos.json
            fs.writeFileSync(path.join(__dirname, "../data/productos.json"), JSON.stringify(listaProductos, null, 2), "utf-8")
           
            res.redirect("/producto")
        }else{
            console.error("No se subio ninguna imagen");
            res.render('create')
        }
        
}, 
    edit:async(req,res)=> {
        let productId = req.params.id
        let product = await db.Producto.findAll();
        res.render("/editar", { producto: product })
    },
    update:async (req,res)=> {
        //modifico el producto que coincida con el id que me llega por parametro
        let producto = await db.Producto.findAll();
        producto.id = productId.id,
        producto.name = req.body.name,
        producto.description = req.body.description,
        producto.category = req.body.category,
        producto.color = req.body.color,
        producto.price = req.body.price,
        producto.image = req.file ? req.file.filename : productoEncontrado.image;
    
/*     fs.writeFileSync(path.join(__dirname, "../data/productos.json"), JSON.stringify(listaProductos, null, 2), "utf-8") */
   
    res.redirect("/")
},
    delete:(req,res)=> {
        //borrado logico del producto que coincida con el id que me llega por parametro
        let productoEncontrado = listaProductos.find((producto)=> producto.id == req.params.id)
       productoEncontrado.borrado = true
    
    fs.writeFileSync(path.join(__dirname, "../data/productos.json"), JSON.stringify(listaProductos, null, 2), "utf-8")
   
    res.redirect("/")
    }
}

module.exports = controller