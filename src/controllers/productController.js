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
            
            // Función helper para normalizar nombres con guiones
            const normalizeUrlParam = (param) => {
                if (!param) return param;
                return param.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            };
            
            // Filtrar por categoría principal (mascota)
            if (categoria) {
                const categoriaNormalizada = normalizeUrlParam(categoria);
                productosFiltrados = productosFiltrados.filter(producto => 
                    producto.category.toLowerCase() === categoriaNormalizada.toLowerCase()
                );
            }
            
            // Filtrar por subcategoría (tipo de producto) si existe
            if (subcategoria) {
                const subcategoriaNormalizada = normalizeUrlParam(subcategoria);
                productosFiltrados = productosFiltrados.filter(producto => 
                    producto.subcategory && producto.subcategory.toLowerCase() === subcategoriaNormalizada.toLowerCase()
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
            
            const categoriaTitle = categoria ? normalizeUrlParam(categoria) : 'Productos';
            const subcategoriaTitle = subcategoria ? ` - ${normalizeUrlParam(subcategoria)}` : '';
            
            // Obtener marcas únicas para el filtro
            const marcas = [...new Set(productosFiltrados.map(p => p.brand).filter(Boolean))];
            
            res.render('productos', {
                productos: productosFiltrados,
                categoria: categoriaTitle + subcategoriaTitle,
                totalProductos: productosFiltrados.length,
                marcas: marcas,
                currentFilters: {
                    categoria: categoria,
                    subcategoria: subcategoria,
                    marca: null
                }
            });
        } catch (error) {
            console.error('Error al filtrar productos:', error);
            res.render('productos', {
                productos: [],
                categoria: 'Productos',
                totalProductos: 0,
                marcas: [],
                currentFilters: {
                    categoria: null,
                    subcategoria: null,
                    marca: null
                }
            });
        }
    },
    
    mascota: async (req, res) => {
        try {
            const { mascota } = req.params;
            const productos = getProductos();
            
            // Filtrar productos por subcategoría (tipo de mascota)
            const mascotaCapitalized = mascota.charAt(0).toUpperCase() + mascota.slice(1);
            const productosFiltrados = productos
                .filter(producto => !producto.borrado)
                .filter(producto => 
                    producto.subcategory && 
                    producto.subcategory.toLowerCase() === mascota.toLowerCase()
                );
            
            // Mapear los datos para que coincidan con la estructura esperada
            const productosMappeados = productosFiltrados.map(producto => ({
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
            const marcas = [...new Set(productosMappeados.map(p => p.brand).filter(Boolean))];
            
            res.render('productos', {
                productos: productosMappeados,
                categoria: `Productos para ${mascotaCapitalized}`,
                totalProductos: productosMappeados.length,
                marcas: marcas,
                currentFilters: {
                    categoria: null,
                    mascota: mascota,
                    marca: null
                }
            });
        } catch (error) {
            console.error('Error al filtrar productos por mascota:', error);
            res.render('productos', {
                productos: [],
                categoria: 'Productos',
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

                // Obtener productos relacionados de la misma categoría (máximo 4)
                const productosRelacionados = productos
                    .filter(producto => 
                        producto.category === productFound.categoria && 
                        producto.id != productFound.id
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
                
                return res.render('detail', { 
                    producto: productFound, 
                    productosRelacionados: productosRelacionados 
                });
            }
            return res.render('detail', { producto: {}, productosRelacionados: [] });
        } catch (error) {
            console.error('Error al cargar producto:', error);
            return res.render('detail', { producto: {}, productosRelacionados: [] });
        }
    },
    crearProcess:async (req,res) =>{  
        try {
            let errors = validationResult(req)
            if(errors.errors.length > 0){
                return res.render('create', {errors: errors.mapped(), old: req.body});
            } 
            
            const productos = getProductos();
            
            let newProduct = {
                "id": productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1,
                "name": req.body.name,
                "description": req.body.description,
                "category": req.body.category,
                "subcategory": req.body.subcategory,
                "brand": req.body.brand,
                "price": parseFloat(req.body.price),
                "color": req.body.color || "No especificado",
                "peso": req.body.peso || "No especificado",
                "edad": req.body.edad || "No aplica",
                "stock": parseInt(req.body.stock) || 0,
                "image": req.file ? req.file.filename : 'logo_petshop.jpeg',
                "destacado": req.body.destacado === 'true',
                "borrado": false
            };
            
            productos.push(newProduct);
            saveProductos(productos);
            
            // Redirigir al admin o a la página de productos
            return res.redirect('/admin/productos?created=true');
        } catch (error) {
            console.error('❌ Error al crear producto:', error);
            return res.render('create', {
                errors: {general: {msg: 'Error del servidor al crear el producto'}},
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

            if (errors.isEmpty()) {
                
                await db.Producto.update({
                    nombre: req.body.nombre,
                    descripcion: req.body.descripcion,
                    precio: req.body.precio,
                    img: req.file ? req.file.filename : productFound.img,  
                    categoria_id: req.body.categoria,
                }, { where: { id: req.params.id } });
                
                
                // Redireccionar a la lista de productos del admin
                return res.redirect('/admin/productos');
            } else {
                let productFound = await db.Producto.findByPk(req.params.id);
                return res.render("editar", { errores:errors.array(),categoria:categoria, producto: productFound })
            } 
        },
        add: function (req, res) {
            res.render('create')  
        },
        create: async function (req, res) {
           const productoCreado = await db.Producto.create({
                ...req.body
           })
           res.redirect('/')
        },
        update: async function (req,res) {
            const productoEditado = await db.Producto.update({
                ...req.body
           }, {where:{
            id: req.params.id} })
            res.redirect('/')
        },
        delete: async function (req, res) {
            try {
                const producto = await db.Petshop.findByPk(req.params.id);
                if (producto) {
                    // Redirigir a confirmación de eliminación en el admin
                    res.redirect(`/admin/productos?delete=${req.params.id}`);
                } else {
                    res.redirect('/admin/productos?error=not_found');
                }
            } catch (error) {
                console.error('Error al buscar producto:', error);
                res.redirect('/admin/productos?error=server_error');
            }
        },
        destroy: async function (req, res) {
            const productoBorrado =  await db.Producto.destroy({where:{
            id: req.params.id} })
            res.redirect('/')
        },
        restaurar: async function (req, res){
            const productoRestaurado =  await db.Producto.restore({where:{
            id: req.params.id} })
            res.redirect('/')
        }
    
    }





module.exports = controller