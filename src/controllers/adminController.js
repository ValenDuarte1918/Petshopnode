const fs = require('fs');
const path = require('path');

// Rutas de archivos
const usuariosPath = path.join(__dirname, '../data/usuarios.json');
const productosPath = path.join(__dirname, '../data/productos.json');

// Funciones auxiliares para cargar datos
const getUsuarios = () => {
  try {
    return JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));
  } catch (error) {
    return [];
  }
};

const getProductos = () => {
  try {
    return JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
  } catch (error) {
    return [];
  }
};

const saveUsuarios = (usuarios) => {
  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2), 'utf-8');
};

const saveProductos = (productos) => {
  fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2), 'utf-8');
};

const adminController = {
  // Verificar si el usuario es administrador
  isAdmin: (req, res, next) => {
    // Verificar si hay sesión de usuario logueado
    if (!req.session.userLogged) {
      return res.redirect('/users/login?redirect=' + encodeURIComponent(req.originalUrl));
    }

    // Verificar si es administrador
    if (req.session.userLogged.category !== 'Administrador') {
      return res.status(403).render('error', { 
        message: 'Acceso denegado. Solo administradores pueden acceder a esta sección.',
        backUrl: '/'
      });
    }

    next();
  },

  // Dashboard principal del administrador
  dashboard: (req, res) => {
    const usuarios = getUsuarios();
    const productos = getProductos();
    const productosActivos = productos.filter(p => !p.borrado); // Solo productos no borrados
    
    const stats = {
      totalUsuarios: usuarios.length,
      totalProductos: productosActivos.length, // Contar solo productos activos
      clientesRegulares: usuarios.filter(u => u.category === 'Cliente').length,
      administradores: usuarios.filter(u => u.category === 'Administrador').length,
      productosActivos: productosActivos.filter(p => (p.stock || 0) > 0).length,
      productosSinStock: productosActivos.filter(p => (p.stock || 0) === 0).length
    };

    res.render('admin/dashboard', { 
      user: req.session.userLogged,
      stats,
      usuarios: usuarios.slice(0, 5), // Últimos 5 usuarios
      productos: productosActivos.slice(0, 5) // Últimos 5 productos activos
    });
  },

  // Gestión de usuarios
  usuarios: (req, res) => {
    const usuarios = getUsuarios();
    res.render('admin/usuarios', { 
      user: req.session.userLogged,
      usuarios 
    });
  },

  // Eliminar usuario
  deleteUser: (req, res) => {
    const userId = parseInt(req.params.id);
    let usuarios = getUsuarios();
    
    // No permitir que el admin se elimine a sí mismo
    if (userId === req.session.userLogged.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }
    
    usuarios = usuarios.filter(u => u.id !== userId);
    saveUsuarios(usuarios);
    
    res.redirect('/admin/usuarios');
  },

  // Cambiar rol de usuario
  changeUserRole: (req, res) => {
    const userId = parseInt(req.params.id);
    const { newRole } = req.body;
    let usuarios = getUsuarios();
    
    const userIndex = usuarios.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      usuarios[userIndex].category = newRole;
      saveUsuarios(usuarios);
    }
    
    res.redirect('/admin/usuarios');
  },

  // Gestión de productos
  productos: (req, res) => {
    const productos = getProductos();
    const productosActivos = productos.filter(p => !p.borrado); // Solo productos activos
    res.render('admin/productos', { 
      user: req.session.userLogged,
      productos: productosActivos
    });
  },

  // Crear nuevo producto
  createProduct: (req, res) => {
    res.render('admin/crear-producto', { 
      user: req.session.userLogged 
    });
  },

  // Procesar creación de producto
  createProductPost: (req, res) => {
    const productos = getProductos();
    const newId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
    
    const newProduct = {
      id: newId,
      name: req.body.nombre,
      price: parseFloat(req.body.precio),
      description: req.body.descripcion,
      category: req.body.categoria,
      stock: parseInt(req.body.stock) || 0,
      image: req.file ? req.file.filename : 'default.jpg',
      destacado: req.body.destacado === 'on',
      borrado: false
    };
    
    productos.push(newProduct);
    saveProductos(productos);
    
    res.redirect('/admin/productos');
  },

  // Editar producto
  editProduct: (req, res) => {
    const productId = parseInt(req.params.id);
    const productos = getProductos();
    const producto = productos.find(p => p.id === productId);
    
    if (!producto) {
      return res.status(404).render('error', { 
        message: 'Producto no encontrado',
        backUrl: '/admin/productos'
      });
    }

    // Mapear los campos del JSON a los nombres esperados en la vista
    const productoMapeado = {
      id: producto.id,
      nombre: producto.name,
      precio: producto.price,
      descripcion: producto.description,
      categoria: producto.category,
      stock: producto.stock || 0,
      img: producto.image,
      destacado: producto.destacado || false
    };
    
    res.render('admin/editar-producto', { 
      user: req.session.userLogged,
      producto: productoMapeado
    });
  },

  // Procesar edición de producto
  editProductPost: (req, res) => {
    const productId = parseInt(req.params.id);
    let productos = getProductos();
    const productIndex = productos.findIndex(p => p.id === productId);
    
    if (productIndex !== -1) {
      // Mapear los campos del formulario al formato del JSON
      productos[productIndex] = {
        ...productos[productIndex],
        name: req.body.nombre,
        price: parseFloat(req.body.precio),
        description: req.body.descripcion,
        category: req.body.categoria,
        stock: parseInt(req.body.stock) || 0,
        image: req.file ? req.file.filename : productos[productIndex].image,
        destacado: req.body.destacado === 'on'
      };
      
      saveProductos(productos);
    }
    
    res.redirect('/admin/productos');
  },

  // Eliminar producto
  deleteProduct: (req, res) => {
    const productId = parseInt(req.params.id);
    let productos = getProductos();
    
    console.log(`🗑️ Eliminando producto ID: ${productId}`);
    productos = productos.filter(p => p.id !== productId);
    saveProductos(productos);
    console.log('✅ Producto eliminado exitosamente');
    
    res.redirect('/admin/productos');
  },

  // Estadísticas avanzadas
  estadisticas: (req, res) => {
    const usuarios = getUsuarios();
    const productos = getProductos();
    
    const estadisticas = {
      usuarios: {
        total: usuarios.length,
        porCategoria: {
          clientes: usuarios.filter(u => u.category === 'Cliente').length,
          administradores: usuarios.filter(u => u.category === 'Administrador').length
        },
        registrosPorMes: {} // Aquí podrías agregar lógica para agrupar por fecha
      },
      productos: {
        total: productos.length,
        porCategoria: {},
        stockTotal: productos.reduce((sum, p) => sum + p.stock, 0),
        valorInventario: productos.reduce((sum, p) => sum + (p.precio * p.stock), 0)
      }
    };
    
    // Calcular productos por categoría
    productos.forEach(p => {
      if (estadisticas.productos.porCategoria[p.categoria]) {
        estadisticas.productos.porCategoria[p.categoria]++;
      } else {
        estadisticas.productos.porCategoria[p.categoria] = 1;
      }
    });
    
    res.render('admin/estadisticas', { 
      user: req.session.userLogged,
      estadisticas 
    });
  }
};

module.exports = adminController;
