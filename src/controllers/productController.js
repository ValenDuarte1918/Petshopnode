const path = require('path')
const fs = require('fs')
// Comentamos temporalmente la conexión a la base de datos
// const db = require('../database/models');
const { validationResult } = require('express-validator')

// Cargar productos desde JSON
const productosPath = path.join(__dirname, '../data/productos.json');
const getProductos = () => {
  try {
    return JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
  } catch (error) {
    return [];
  }
};

const saveProductos = (productos) => {
  fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2), 'utf-8');
};


const controller ={
    list: async (req, res)=>{
        try {
            const productos = getProductos();
            let productosListados = productos.filter(producto => !producto.borrado);
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
            res.render('home',{listaProductos: productosListados});
        } catch (error) {
            console.error('Error al cargar productos:', error);
            res.render('home', {listaProductos: []});
        }
    },
    
    // Nueva función para filtrar por categoría
    category: async (req, res) => {
        try {
            const { categoria, subcategoria } = req.params;
            const productos = getProductos();
            let productosFiltrados = productos.filter(producto => !producto.borrado);
            
            // Filtrar por categoría principal
            if (categoria) {
                const categoriaCapitalized = categoria.charAt(0).toUpperCase() + categoria.slice(1);
                productosFiltrados = productosFiltrados.filter(producto => 
                    producto.category.toLowerCase() === categoria.toLowerCase()
                );
            }
            
            // Filtrar por subcategoría si existe
            if (subcategoria) {
                const subcategoriaCapitalized = subcategoria.charAt(0).toUpperCase() + subcategoria.slice(1);
                productosFiltrados = productosFiltrados.filter(producto => 
                    producto.subcategory && producto.subcategory.toLowerCase() === subcategoria.toLowerCase()
                );
            }
            
            // Mapear los datos para que coincidan con la estructura esperada
            productosFiltrados = productosFiltrados.map(producto => ({
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
            
            const categoriaTitle = categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1) : 'Productos';
            const subcategoriaTitle = subcategoria ? ` - ${subcategoria.charAt(0).toUpperCase() + subcategoria.slice(1)}` : '';
            
            res.render('productos', {
                productos: productosFiltrados,
                categoria: categoriaTitle + subcategoriaTitle,
                totalProductos: productosFiltrados.length
            });
        } catch (error) {
            console.error('Error al filtrar productos:', error);
            res.render('productos', {
                productos: [],
                categoria: 'Productos',
                totalProductos: 0
            });
        }
    },    
    detail:async (req, res) => {
        try {
            const productos = getProductos();
            let productFound = productos.find(producto => producto.id == req.params.id);
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
    crear: async (req, res) => {
        try {
            // Para la vista de crear, podemos renderizar sin datos específicos
            return res.render('crearProducto'); // o 'create' dependiendo del nombre de la vista
        } catch (error) {
            console.error('Error al cargar página de crear:', error);
            return res.render('crearProducto');
        }
    },
    crearProcess:async (req,res) =>{  
        try {
            let errors = validationResult(req)
            if(errors.errors.length > 0){
                return res.render('crearProducto', {errors: errors.mapped(), old: req.body});
            } 
            
            console.log(req.body);
            const productos = getProductos();
            
            let newProduct = {
                "id": productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1,
                "name": req.body.name,
                "description": req.body.description,
                "category": req.body.category || "general",
                "price": req.body.price,
                "color": req.body.color || "sin especificar",
                "image": req.file ? req.file.filename : 'logo.png',
                "borrado": false
            }
            
            productos.push(newProduct);
            saveProductos(productos);
            return res.redirect('/');
        } catch (error) {
            console.error('Error al crear producto:', error);
            return res.render('crearProducto', {
                errors: {general: {msg: 'Error del servidor'}},
                old: req.body
            });
        }
    },
        edit: async (req,res)=>{
            let producto = await db.Producto.findAll();
            let categoria = await db.Categoria.findAll();
            return res.render('editar', {producto:producto,categoria:categoria})

/*             if (req.session.userLogged) {
                if (req.session.userLogged.id_roles == 1) {
                    let productFound = await db.Producto.findByPk(req.params.id, { paranoid: false });
                    return res.render('editar', {producto:productFound,categoria:categoria})
                } else {
                    let productFound = await db.Producto.findByPk(req.params.id);
                    return res.render('editar', {producto:productFound,categoria:categoria})
                }
            } else {
                let productFound = await db.Producto.findByPk(req.params.id);
                return res.render('editar', {producto:productFound,categoria:categoria})
    
            } */
        },
        editProcess: async(req,res)=>{
            let producto = await db.Producto.findAll();
            let categoria = await db.Categoria.findAll();
            let errors = validationResult(req)  

            let productFound = await db.Producto.findByPk(req.params.id);


            if (errors.isEmpty()) {db.Producto.update({
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                precio: req.body.precio,
                img: req.file ? req.file.image : 'logo.png',  
                categoria_id: req.body.categoria,
    
            }, { where: { id: req.params.id } })
            return res.redirect('/' + req.params.id)}
            else {
                let productFound = await db.Producto.findByPk(req.params.id);
                return res.render("editar", { errores:errors.array(),categoria:categoria, producto: producto })
            } 

/* 
            fs.writeFileSync(path.join(__dirname,'../data/productData.json'),JSON.stringify(productsList,null,2),'utf-8')
            res.redirect('/') */

        },
        add: function (req, res) {
            res.render('create')  
        },
        create: async function (req, res) {
           const productoCreado = await db.Producto.create({
                ...req.body
           })
           console.log(productoCreado);
           res.redirect('/')
        },
        update: async function (req,res) {
            const productoEditado = await db.Producto.update({
                ...req.body
           }, {where:{
            id: req.params.id} })
            console.log(productoEditado);
            res.redirect('/')
        },
        delete: async function (req, res) {
            const producto = await db.Petshop.findByPk(req.params.id)
            res.render('productoBorrado',{Petshop:producto})
        },
        destroy: async function (req, res) {
            const productoBorrado =  await db.Producto.destroy({where:{
            id: req.params.id} })
            console.log(productoBorrado);
            res.redirect('/')
        },
        restaurar: async function (req, res){
            const productoRestaurado =  await db.Producto.restore({where:{
            id: req.params.id} })
            console.log(productoRestaurado);
            res.redirect('/')
        }
    
    }





module.exports = controller