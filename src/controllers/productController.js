const path = require('path')
const fs = require('fs')
// Habilitamos la conexión a la base de datos
const db = require('../database/models');
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
    list: async (req, res) => {
        try {
            console.log('📋 Cargando lista de productos...');
            let productosListados = [];
            
            try {
                // Usar base de datos primero
                const productosDB = await db.Producto.findAll({
                    where: { borrado: false },
                    order: [['name', 'ASC']]
                });
                
                if (productosDB && productosDB.length > 0) {
                    productosListados = productosDB.map(producto => ({
                        id: producto.id,
                        nombre: producto.name,
                        descripcion: producto.description,
                        img: producto.image,
                        categoria: producto.category,
                        color: producto.color,
                        precio: producto.price
                    }));
                    console.log('✅ Lista desde BD:', productosListados.length, 'productos');
                } else {
                    throw new Error('No hay productos en BD');
                }
                
            } catch (dbError) {
                console.warn('⚠️ Error con BD, usando JSON:', dbError.message);
                // Fallback a JSON
                const productos = getProductos();
                productosListados = productos.filter(producto => !producto.borrado);
                productosListados = productosListados.map(producto => ({
                    id: producto.id,
                    nombre: producto.name,
                    descripcion: producto.description,
                    img: producto.image,
                    categoria: producto.category,
                    color: producto.color,
                    precio: producto.price
                }));
            }
            
            res.render('home', { listaProductos: productosListados });
        } catch (error) {
            console.error('❌ Error al cargar productos:', error);
            res.render('home', { listaProductos: [] });
        }
    },
    
    // Nueva función para filtrar por categoría
    category: async (req, res) => {
        try {
            const { categoria, subcategoria } = req.params;
            console.log(`🔍 Filtrando por categoría: ${categoria}, subcategoría: ${subcategoria}`);
            
            let productosFiltrados = [];
            
            // Función helper para normalizar nombres con guiones
            const normalizeUrlParam = (param) => {
                if (!param) return param;
                return param.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            };
            
            try {
                // Usar base de datos primero
                let whereCondition = { borrado: false };
                
                if (categoria) {
                    const categoriaNormalizada = normalizeUrlParam(categoria);
                    whereCondition.category = { [db.Sequelize.Op.like]: `%${categoriaNormalizada}%` };
                }
                
                if (subcategoria) {
                    const subcategoriaNormalizada = normalizeUrlParam(subcategoria);
                    whereCondition.subcategory = { [db.Sequelize.Op.like]: `%${subcategoriaNormalizada}%` };
                }
                
                const productosDB = await db.Producto.findAll({
                    where: whereCondition,
                    order: [['name', 'ASC']]
                });
                
                if (productosDB) {
                    productosFiltrados = productosDB.map(producto => ({
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
                    console.log('✅ Filtros desde BD:', productosFiltrados.length, 'productos');
                } else {
                    throw new Error('Error en consulta BD');
                }
                
            } catch (dbError) {
                console.warn('⚠️ Error con BD en filtros, usando JSON:', dbError.message);
                // Fallback a JSON
                const productos = getProductos();
                let productosFallback = productos.filter(producto => !producto.borrado);
                
                // Filtrar por categoría principal (mascota)
                if (categoria) {
                    const categoriaNormalizada = normalizeUrlParam(categoria);
                    productosFallback = productosFallback.filter(producto => 
                        producto.category.toLowerCase() === categoriaNormalizada.toLowerCase()
                    );
                }
                
                // Filtrar por subcategoría (tipo de producto) si existe
                if (subcategoria) {
                    const subcategoriaNormalizada = normalizeUrlParam(subcategoria);
                    productosFallback = productosFallback.filter(producto => 
                        producto.subcategory && producto.subcategory.toLowerCase() === subcategoriaNormalizada.toLowerCase()
                    );
                }
                
                // Mapear los datos del JSON para que coincidan con la estructura esperada
                productosFiltrados = productosFallback.map(producto => ({
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
            }
            
            const categoriaTitle = categoria ? normalizeUrlParam(categoria) : 'Productos';
            const subcategoriaTitle = subcategoria ? ` - ${normalizeUrlParam(subcategoria)}` : '';
            
            // Obtener marcas únicas para el filtro
            const marcas = [...new Set(productosFiltrados.map(p => p.brand).filter(Boolean))];
            
            console.log('🔍 Productos a enviar a la vista:', productosFiltrados.length);
            if (productosFiltrados.length > 0) {
                console.log('📝 Primer producto ejemplo:', {
                    id: productosFiltrados[0].id,
                    nombre: productosFiltrados[0].nombre,
                    precio: productosFiltrados[0].precio,
                    img: productosFiltrados[0].img
                });
            }
            
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
            console.error('❌ Error al filtrar productos:', error);
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
            const mascotaCapitalized = mascota.charAt(0).toUpperCase() + mascota.slice(1);
            
            let productosMappeados = [];
            let marcas = [];
            
            try {
                // Usar base de datos primero
                const productosDB = await db.Producto.findAll({
                    where: {
                        subcategory: db.Sequelize.where(
                            db.Sequelize.fn('LOWER', db.Sequelize.col('subcategory')),
                            'LIKE',
                            mascota.toLowerCase()
                        ),
                        borrado: false
                    },
                    order: [['created_at', 'DESC']]
                });
                
                if (productosDB && productosDB.length > 0) {
                    // Mapear los datos para que coincidan con la estructura esperada
                    productosMappeados = productosDB.map(producto => ({
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
                    marcas = [...new Set(productosMappeados.map(p => p.brand).filter(Boolean))];
                    
                    console.log(`✅ Productos para mascota ${mascota} desde BD:`, productosMappeados.length);
                } else {
                    throw new Error('No se encontraron productos en la BD');
                }
                
            } catch (dbError) {
                console.warn('⚠️ Error con BD, usando JSON:', dbError.message);
                // Fallback a JSON
                const productos = getProductos();
                
                const productosFiltrados = productos
                    .filter(producto => !producto.borrado)
                    .filter(producto => 
                        producto.subcategory && 
                        producto.subcategory.toLowerCase() === mascota.toLowerCase()
                    );
                
                productosMappeados = productosFiltrados.map(producto => ({
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
                
                marcas = [...new Set(productosMappeados.map(p => p.brand).filter(Boolean))];
            }
            
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
            console.error('❌ Error al filtrar productos por mascota:', error);
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
    
    detail: async (req, res) => {
        try {
            console.log(`🔍 Detalle producto ID: ${req.params.id}`);
            let productFound = null;
            let productosRelacionados = [];
            
            try {
                // Usar base de datos primero
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
                    
                    productosRelacionados = relacionadosDB.map(producto => ({
                        id: producto.id,
                        nombre: producto.name,
                        descripcion: producto.description,
                        img: producto.image,
                        categoria: producto.category,
                        color: producto.color,
                        precio: producto.price
                    }));
                    
                    console.log('✅ Detalle desde BD:', productFound.nombre);
                } else {
                    throw new Error('Producto no encontrado en BD');
                }
                
            } catch (dbError) {
                console.warn('⚠️ Error con BD, usando JSON:', dbError.message);
                // Fallback a JSON
                const productos = getProductos();
                productFound = productos.find(producto => producto.id == req.params.id);
                
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
                    productosRelacionados = productos
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
                    productosRelacionados: productosRelacionados 
                });
            }
            return res.render('detail', { producto: {}, productosRelacionados: [] });
        } catch (error) {
            console.error('Error al cargar producto:', error);
            return res.render('detail', { producto: {}, productosRelacionados: [] });
        }
    },
    crearProcess: async (req, res) => {  
        try {
            let errors = validationResult(req)
            if(errors.errors.length > 0){
                return res.render('create', {errors: errors.mapped(), old: req.body});
            } 
            
            console.log('🛍️ Creando nuevo producto en la base de datos...');
            
            // Crear producto directamente en la base de datos
            const newProduct = await db.Producto.create({
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                subcategory: req.body.subcategory,
                brand: req.body.brand,
                price: parseFloat(req.body.price),
                color: req.body.color || "No especificado",
                peso: req.body.peso || "No especificado",
                edad: req.body.edad || "No aplica",
                stock: parseInt(req.body.stock) || 0,
                image: req.file ? req.file.filename : 'logo_petshop.jpeg',
                destacado: req.body.destacado === 'true',
                borrado: false
            });
            
            console.log(`✅ Producto creado en BD: ID ${newProduct.id} - ${newProduct.name}`);
            
            // Redirigir al admin o a la página de productos
            return res.redirect('/admin/productos?created=true');
        } catch (error) {
            console.error('❌ Error al crear producto en BD:', error);
            return res.render('create', {
                errors: {general: {msg: 'Error del servidor al crear el producto: ' + error.message}},
                old: req.body
            });
        }
    },
        edit: async (req, res) => {
            try {
                const productId = req.params.id;
                
                if (!productId) {
                    return res.status(400).render('error', { 
                        message: 'ID de producto requerido',
                        backUrl: '/admin/productos'
                    });
                }
                
                // Buscar producto específico por ID
                const productFound = await db.Producto.findByPk(productId, {
                    where: { borrado: false }
                });
                
                if (!productFound) {
                    return res.status(404).render('error', { 
                        message: 'Producto no encontrado',
                        backUrl: '/admin/productos'
                    });
                }
                
                // Mapear producto para la vista
                const productoMapeado = {
                    id: productFound.id,
                    nombre: productFound.name,
                    descripcion: productFound.description,
                    precio: productFound.price,
                    categoria: productFound.category,
                    subcategoria: productFound.subcategory,
                    marca: productFound.brand,
                    color: productFound.color,
                    peso: productFound.peso,
                    edad: productFound.edad,
                    stock: productFound.stock,
                    img: productFound.image,
                    destacado: productFound.destacado
                };
                
                // Obtener lista de categorías disponibles para el select
                const productosDB = await db.Producto.findAll({
                    attributes: ['category'],
                    where: { borrado: false },
                    group: ['category']
                });
                
                const categorias = productosDB.map(p => p.category).filter(Boolean);
                
                return res.render('editar', {
                    producto: productoMapeado,
                    categoria: categorias
                });
                
            } catch (error) {
                console.error('❌ Error al cargar producto para editar:', error);
                return res.status(500).render('error', { 
                    message: 'Error del servidor al cargar el producto',
                    backUrl: '/admin/productos'
                });
            }
        },
        editProcess: async (req, res) => {
            try {
                const productId = req.params.id;
                let errors = validationResult(req);

                // Buscar producto por ID
                const productFound = await db.Producto.findByPk(productId, {
                    where: { borrado: false }
                });

                if (!productFound) {
                    return res.status(404).render('error', { 
                        message: 'Producto no encontrado',
                        backUrl: '/admin/productos'
                    });
                }

                if (errors.isEmpty()) {
                    // Actualizar producto con mapeo correcto de campos
                    await productFound.update({
                        name: req.body.nombre,
                        description: req.body.descripcion,
                        price: parseFloat(req.body.precio),
                        category: req.body.categoria,
                        subcategory: req.body.subcategoria || productFound.subcategory,
                        brand: req.body.marca || productFound.brand,
                        color: req.body.color || productFound.color,
                        peso: req.body.peso || productFound.peso,
                        edad: req.body.edad || productFound.edad,
                        stock: parseInt(req.body.stock) || 0,
                        image: req.file ? req.file.filename : productFound.image,
                        destacado: req.body.destacado === 'on' || req.body.destacado === 'true'
                    });
                    
                    console.log('✅ Producto actualizado en BD:', productFound.name);
                    return res.redirect('/admin/productos?updated=true');
                } else {
                    // En caso de errores, obtener categorías para el formulario
                    const productosDB = await db.Producto.findAll({
                        attributes: ['category'],
                        where: { borrado: false },
                        group: ['category']
                    });
                    
                    const categorias = productosDB.map(p => p.category).filter(Boolean);
                    
                    // Mapear producto para la vista
                    const productoMapeado = {
                        id: productFound.id,
                        nombre: productFound.name,
                        descripcion: productFound.description,
                        precio: productFound.price,
                        categoria: productFound.category,
                        subcategoria: productFound.subcategory,
                        marca: productFound.brand,
                        color: productFound.color,
                        peso: productFound.peso,
                        edad: productFound.edad,
                        stock: productFound.stock,
                        img: productFound.image,
                        destacado: productFound.destacado
                    };
                    
                    return res.render("editar", { 
                        errores: errors.array(),
                        categoria: categorias, 
                        producto: productoMapeado 
                    });
                }
                
            } catch (error) {
                console.error('❌ Error al procesar edición de producto:', error);
                return res.redirect('/admin/productos?error=edit');
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
                const productId = req.params.id;
                
                // Buscar producto por ID usando el modelo correcto
                const producto = await db.Producto.findByPk(productId, {
                    where: { borrado: false }
                });
                
                if (producto) {
                    // Redirigir a confirmación de eliminación en el admin
                    res.redirect(`/admin/productos?delete=${productId}&name=${encodeURIComponent(producto.name)}`);
                } else {
                    res.redirect('/admin/productos?error=not_found');
                }
            } catch (error) {
                console.error('❌ Error al buscar producto para eliminar:', error);
                res.redirect('/admin/productos?error=server_error');
            }
        },
        destroy: async function (req, res) {
            try {
                const productId = req.params.id;
                
                // Buscar producto por ID
                const producto = await db.Producto.findByPk(productId, {
                    where: { borrado: false }
                });
                
                if (producto) {
                    // Marcar como borrado en lugar de eliminar físicamente
                    await producto.update({ borrado: true });
                    console.log('✅ Producto marcado como borrado:', producto.name);
                    res.redirect('/admin/productos?deleted=true');
                } else {
                    res.redirect('/admin/productos?error=not_found');
                }
            } catch (error) {
                console.error('❌ Error al eliminar producto:', error);
                res.redirect('/admin/productos?error=delete_failed');
            }
        },
        restaurar: async function (req, res) {
            try {
                const productId = req.params.id;
                
                // Buscar producto borrado por ID (incluir borrados)
                const producto = await db.Producto.findByPk(productId);
                
                if (producto && producto.borrado) {
                    // Restaurar producto marcando borrado como false
                    await producto.update({ borrado: false });
                    console.log('✅ Producto restaurado:', producto.name);
                    res.redirect('/admin/productos?restored=true');
                } else if (producto && !producto.borrado) {
                    res.redirect('/admin/productos?error=not_deleted');
                } else {
                    res.redirect('/admin/productos?error=not_found');
                }
            } catch (error) {
                console.error('❌ Error al restaurar producto:', error);
                res.redirect('/admin/productos?error=restore_failed');
            }
        }
    
    }





module.exports = controller