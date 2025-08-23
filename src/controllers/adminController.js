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
    
    // Estadísticas de usuarios
    const usuariosRecientes = usuarios.filter(u => {
      // Considerar usuarios de los últimos 30 días como recientes
      if (!u.fechaRegistro) return false;
      const fechaRegistro = new Date(u.fechaRegistro);
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      return fechaRegistro >= hace30Dias;
    });

    // Estadísticas de productos por categoría
    const productosPorCategoria = productosActivos.reduce((acc, producto) => {
      const categoria = producto.category || 'Sin categoría';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});

    // Productos más populares (simulado basado en ID más bajo = más antiguo = más popular)
    const productosPopulares = productosActivos
      .sort((a, b) => a.id - b.id)
      .slice(0, 5);

    // Valor total del inventario
    const valorInventario = productosActivos.reduce((total, producto) => {
      const precio = parseFloat(producto.precio) || 0;
      const stock = parseInt(producto.stock) || 0;
      return total + (precio * stock);
    }, 0);

    // Productos con stock crítico (menos de 5 unidades)
    const stockCritico = productosActivos.filter(p => {
      const stock = parseInt(p.stock) || 0;
      return stock > 0 && stock < 5;
    });

    const stats = {
      // Usuarios
      totalUsuarios: usuarios.length,
      clientesRegulares: usuarios.filter(u => (u.category || 'Cliente') === 'Cliente').length,
      administradores: usuarios.filter(u => u.category === 'Administrador').length,
      usuariosRecientes: usuariosRecientes.length,
      
      // Productos
      totalProductos: productosActivos.length,
      productosActivos: productosActivos.filter(p => (p.stock || 0) > 0).length,
      productosSinStock: productosActivos.filter(p => (p.stock || 0) === 0).length,
      stockCritico: stockCritico.length,
      
      // Financiero
      valorInventario: valorInventario.toFixed(2),
      
      // Categorías
      productosPorCategoria,
      categoriaPopular: Object.keys(productosPorCategoria).reduce((a, b) => 
        productosPorCategoria[a] > productosPorCategoria[b] ? a : b, 'N/A'
      ),
      
      // Crecimiento (simulado)
      crecimientoUsuarios: usuariosRecientes.length > 0 ? '+' + Math.round((usuariosRecientes.length / usuarios.length) * 100) + '%' : '0%',
      eficienciaStock: productosActivos.length > 0 ? Math.round((productosActivos.filter(p => (p.stock || 0) > 0).length / productosActivos.length) * 100) + '%' : '0%'
    };

    res.render('admin/dashboard', { 
      user: req.session.userLogged,
      stats,
      usuarios: usuarios.slice(-5).reverse(), // Últimos 5 usuarios registrados
      productos: productosActivos.slice(-5).reverse(), // Últimos 5 productos agregados
      productosPopulares,
      stockCritico: stockCritico.slice(0, 5) // Top 5 productos con stock crítico
    });
  },

  // Gestión de usuarios
  usuarios: (req, res) => {
    const usuarios = getUsuarios();
    
    // Asegurar que todos los usuarios tengan una categoría
    const usuariosConCategoria = usuarios.map(usuario => ({
      ...usuario,
      category: usuario.category || 'Cliente'
    }));
    
    res.render('admin/usuarios', { 
      user: req.session.userLogged,
      usuarios: usuariosConCategoria 
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
  },

  // Panel de seguridad
  seguridad: (req, res) => {
    // Leer logs de seguridad
    const fs = require('fs');
    const path = require('path');
    
    let securityLogs = [];
    let securityStats = {
      totalLoginAttempts: 0,
      failedAttempts: 0,
      successfulLogins: 0,
      blockedIPs: 0
    };
    
    try {
      const logPath = path.join(__dirname, '../logs/security.log');
      if (fs.existsSync(logPath)) {
        const logContent = fs.readFileSync(logPath, 'utf-8');
        const logLines = logContent.trim().split('\n');
        
        // Parsear logs y filtrar últimas 24 horas
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        securityLogs = logLines
          .filter(line => line.trim())
          .map(line => {
            try {
              return JSON.parse(line);
            } catch (e) {
              return null;
            }
          })
          .filter(log => log && new Date(log.timestamp) >= yesterday)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 50); // Últimos 50 eventos
        
        // Calcular estadísticas
        securityStats.totalLoginAttempts = securityLogs.filter(log => 
          log.event === 'failed_login' || log.event === 'successful_login'
        ).length;
        
        securityStats.failedAttempts = securityLogs.filter(log => 
          log.event === 'failed_login'
        ).length;
        
        securityStats.successfulLogins = securityLogs.filter(log => 
          log.event === 'successful_login'
        ).length;
        
        // Contar IPs únicas con intentos fallidos
        const failedIPs = new Set(
          securityLogs
            .filter(log => log.event === 'failed_login')
            .map(log => log.data.ip)
        );
        securityStats.blockedIPs = failedIPs.size;
        
      }
    } catch (error) {
      console.error('Error leyendo logs de seguridad:', error);
    }
    
    res.render('admin/seguridad', {
      user: req.session.userLogged,
      securityLogs,
      securityStats
    });
  }
};

module.exports = adminController;
