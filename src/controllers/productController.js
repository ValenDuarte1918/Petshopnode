const path = require('path')
const fs = require('fs')
// Conexión a la base de datos
const db = require('../database/models');
const { validationResult } = require('express-validator')

const controller = {
    list: async (req, res) => {
        try {
            const productosDB = await db.Producto.findAll({
                where: { borrado: false },
                order: [['name', 'ASC']]
            });
            
            const productosListados = productosDB.map(producto => ({
                id: producto.id,
                nombre: producto.name,
                descripcion: producto.description,
                img: producto.image,
                categoria: producto.category,
                color: producto.color,
                precio: producto.price
            }));
            res.render('productos', { 
                productos: productosListados,
                categoria: 'Todos los productos',
                totalProductos: productosListados.length,
                marcas: [],
                currentFilters: {
                    categoria: null,
                    mascota: null,
                    marca: null
                }
            });
            
        } catch (error) {
            res.status(500).render('error', { 
                message: 'Error al cargar productos',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    // Filtrar por categoría
    category: async (req, res) => {
        try {
            const { categoria, subcategoria } = req.params;
            
            // Función helper para normalizar nombres con guiones
            const normalizeUrlParam = (param) => {
                if (!param) return param;
                return param.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            };
            
            // Usar base de datos
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
            
            const productosFiltrados = productosDB.map(producto => ({
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
            res.status(500).render('error', {
                message: 'Error al filtrar productos',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    mascota: async (req, res) => {
        try {
            const { mascota } = req.params;
            const mascotaCapitalized = mascota.charAt(0).toUpperCase() + mascota.slice(1);
            
            // Usar base de datos
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
            
            // Mapear los datos para que coincidan con la estructura esperada
            const productosMappeados = productosDB.map(producto => ({
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
            res.status(500).render('error', {
                message: 'Error al cargar productos',
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
                precio: producto.price
            }));
            
            return res.render('detail', { 
                producto: productFound, 
                productosRelacionados: productosRelacionados 
            });
            
        } catch (error) {
            return res.status(500).render('error', { 
                message: 'Error al cargar producto',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    crearProcess: async (req, res) => {  
        try {
            let errors = validationResult(req)
            if(errors.errors.length > 0){
                return res.render('create', {errors: errors.mapped(), old: req.body});
            } 
            
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
            
            res.redirect('/admin/productos');
            
        } catch (error) {
            res.status(500).render('error', {
                message: 'Error al crear producto',
                error: process.env.NODE_ENV === 'development' ? error : {}
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

    editProcess: async (req, res) => {
        try {
            let errors = validationResult(req);
            if (errors.errors.length > 0) {
                const producto = await db.Producto.findByPk(req.params.id);
                return res.render('editar', {
                    errors: errors.mapped(),
                    old: req.body,
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
            }

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

            res.redirect('/admin/productos');
            
        } catch (error) {
            res.status(500).render('error', {
                message: 'Error al actualizar producto',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    // Borrado lógico
    delete: async (req, res) => {
        try {
            await db.Producto.update(
                { borrado: true },
                { where: { id: req.params.id } }
            );
            
            res.redirect('/admin/productos');
            
        } catch (error) {
            res.status(500).render('error', {
                message: 'Error al borrar producto',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    // Restaurar producto
    restore: async (req, res) => {
        try {
            await db.Producto.update(
                { borrado: false },
                { where: { id: req.params.id } }
            );
            
            res.redirect('/admin/productos');
            
        } catch (error) {
            res.status(500).render('error', {
                message: 'Error al restaurar producto',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    // Funciones para vistas
    add: function (req, res) {
        res.render('create');
    },
    
    create: async function (req, res) {
        res.render('crearProducto');
    },
    
    update: async function (req, res) {
        res.render('productos');
    }
}

module.exports = controller
