const fs = require('fs');
const path = require('path');
const db = require('../database/models');

// Ya no necesitamos funciones para manejar JSON, todo va a la DB

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
  dashboard: async (req, res) => {
    try {
      // Obtener usuarios desde la base de datos
      const usuariosDB = await db.Usuario.findAll({
        where: { activo: true },
        order: [['created_at', 'DESC']]
      });
      
      const usuarios = usuariosDB.map(usuario => ({
        id: usuario.id,
        firstName: usuario.nombre,
        lastName: usuario.apellido,
        email: usuario.email,
        category: usuario.rol === 'admin' ? 'Administrador' : 'Cliente',
        rol: usuario.rol,
        image: usuario.avatar,
        fechaRegistro: usuario.created_at
      }));
      
      // Obtener productos desde la base de datos
      const productosDB = await db.Producto.findAll({
        where: { borrado: false },
        order: [['created_at', 'DESC']]
      });
      
      const productos = productosDB.map(producto => ({
        id: producto.id,
        name: producto.name,
        description: producto.description,
        image: producto.image,
        category: producto.category,
        brand: producto.brand,
        color: producto.color,
        price: producto.price,
        stock: producto.stock,
        created_at: producto.created_at
      }));
      
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
    const productosPorCategoria = productos.reduce((acc, producto) => {
      const categoria = producto.category || 'Sin categoría';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});

    // Productos más populares (simulado basado en ID más bajo = más antiguo = más popular)
    const productosPopulares = productos
      .sort((a, b) => a.id - b.id)
      .slice(0, 5);

    // Valor total del inventario
    const valorInventario = productos.reduce((total, producto) => {
      const precio = parseFloat(producto.price) || 0;
      const stock = parseInt(producto.stock) || 0;
      return total + (precio * stock);
    }, 0);

    // Productos con stock crítico (menos de 5 unidades)
    const stockCritico = productos.filter(p => {
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
      totalProductos: productos.length,
      productosActivos: productos.filter(p => (p.stock || 0) > 0).length,
      productosSinStock: productos.filter(p => (p.stock || 0) === 0).length,
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
      eficienciaStock: productos.length > 0 ? Math.round((productos.filter(p => (p.stock || 0) > 0).length / productos.length) * 100) + '%' : '0%'
    };

    res.render('admin/dashboard', { 
      user: req.session.userLogged,
      stats,
      usuarios: usuarios.slice(-5).reverse(), // Últimos 5 usuarios registrados
      productos: productos.slice(-5).reverse(), // Últimos 5 productos agregados
      productosPopulares,
      stockCritico: stockCritico.slice(0, 5) // Top 5 productos con stock crítico
    });
    
    } catch (error) {
      console.error('❌ Error en dashboard admin:', error);
      res.render('admin/dashboard', { 
        user: req.session.userLogged,
        stats: {
          totalUsuarios: 0,
          clientesRegulares: 0,
          administradores: 0,
          usuariosRecientes: 0,
          totalProductos: 0,
          productosActivos: 0,
          productosSinStock: 0,
          stockCritico: 0,
          valorInventario: '0.00',
          productosPorCategoria: {},
          categoriaPopular: 'N/A',
          crecimientoUsuarios: '0%',
          eficienciaStock: '0%'
        },
        usuarios: [],
        productos: [],
        productosPopulares: [],
        stockCritico: []
      });
    }
  },

  // Gestión de usuarios
  usuarios: async (req, res) => {
    try {
      // Obtener usuarios desde la base de datos
      const usuariosDB = await db.Usuario.findAll({
        where: { activo: true },
        order: [['created_at', 'DESC']]
      });
      
      const usuarios = usuariosDB.map(usuario => ({
        id: usuario.id,
        firstName: usuario.nombre,
        lastName: usuario.apellido,
        email: usuario.email,
        category: usuario.rol === 'admin' ? 'Administrador' : 'Cliente',
        rol: usuario.rol,
        image: usuario.avatar,
        fechaRegistro: usuario.created_at
      }));
      
      res.render('admin/usuarios', { 
        user: req.session.userLogged,
        usuarios: usuarios 
      });
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      res.render('admin/usuarios', { 
        user: req.session.userLogged,
        usuarios: [] 
      });
    }
  },

  // Eliminar usuario
  deleteUser: async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // No permitir que el admin se elimine a sí mismo
      if (userId === req.session.userLogged.id) {
        return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
      }
      
      // Marcar usuario como inactivo en lugar de eliminarlo
      await db.Usuario.update(
        { activo: false },
        { where: { id: userId } }
      );
      
      res.redirect('/admin/usuarios');
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  // Cambiar rol de usuario
  changeUserRole: async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { newRole } = req.body;
      
      // Mapear el rol para la base de datos
      const rol = newRole === 'Administrador' ? 'admin' : 'cliente';
      
      await db.Usuario.update(
        { rol: rol },
        { where: { id: userId } }
      );
      
      res.redirect('/admin/usuarios');
    } catch (error) {
      console.error('❌ Error al cambiar rol:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  // Gestión de productos
  productos: async (req, res) => {
    try {
      // Obtener productos desde la base de datos
      const productosDB = await db.Producto.findAll({
        where: { borrado: false },
        order: [['created_at', 'DESC']]
      });
      
      const productos = productosDB.map(producto => ({
        id: producto.id,
        name: producto.name,
        description: producto.description,
        image: producto.image,
        category: producto.category,
        brand: producto.brand,
        color: producto.color,
        price: producto.price,
        stock: producto.stock,
        created_at: producto.created_at
      }));
      
      res.render('admin/productos', { 
        user: req.session.userLogged,
        productos: productos
      });
    } catch (error) {
      console.error('❌ Error al obtener productos para admin:', error);
      res.render('admin/productos', { 
        user: req.session.userLogged,
        productos: []
      });
    }
  },

  // Crear nuevo producto
  createProduct: (req, res) => {
    res.render('admin/crear-producto', { 
      user: req.session.userLogged 
    });
  },

  // Procesar creación de producto
  createProductPost: async (req, res) => {
    try {
      // Crear producto en la base de datos
      const newProduct = await db.Producto.create({
        name: req.body.nombre || req.body.name,
        description: req.body.descripcion || req.body.description,
        category: req.body.categoria || req.body.category,
        subcategory: req.body.subcategoria || req.body.subcategory,
        brand: req.body.marca || req.body.brand,
        price: parseFloat(req.body.precio || req.body.price),
        color: req.body.color || "",
        peso: req.body.peso || "",
        edad: req.body.edad || "",
        stock: parseInt(req.body.stock) || 0,
        image: req.file ? req.file.filename : 'logo_petshop.jpeg',
        destacado: req.body.destacado === 'on' || req.body.destacado === 'true',
        borrado: false
      });
      
      console.log('✅ Producto creado en BD por admin:', newProduct.name);
      res.redirect('/admin/productos?created=true');
    } catch (error) {
      console.error('❌ Error en admin crear producto:', error);
      res.render('admin/crear-producto', { 
        user: req.session.userLogged,
        error: 'Error al crear el producto: ' + error.message
      });
    }
  },

  // Editar producto
  editProduct: async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      // Buscar producto en la base de datos
      const productoDB = await db.Producto.findByPk(productId, {
        where: { borrado: false }
      });
      
      if (!productoDB) {
        return res.status(404).render('error', { 
          message: 'Producto no encontrado',
          backUrl: '/admin/productos'
        });
      }
      
      // Mapear los campos de la BD a los nombres esperados en la vista
      const productoMapeado = {
        id: productoDB.id,
        nombre: productoDB.name,
        precio: productoDB.price,
        descripcion: productoDB.description,
        categoria: productoDB.category,
        subcategoria: productoDB.subcategory,
        marca: productoDB.brand,
        color: productoDB.color,
        peso: productoDB.peso,
        edad: productoDB.edad,
        stock: productoDB.stock || 0,
        img: productoDB.image,
        destacado: productoDB.destacado || false
      };
      
      res.render('admin/editar-producto', { 
        user: req.session.userLogged,
        producto: productoMapeado
      });
    } catch (error) {
      console.error('❌ Error al obtener producto para editar:', error);
      return res.status(404).render('error', { 
        message: 'Error al cargar el producto',
        backUrl: '/admin/productos'
      });
    }
  },

  // Procesar edición de producto
  editProductPost: async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      // Buscar producto en la base de datos
      const productoDB = await db.Producto.findByPk(productId, {
        where: { borrado: false }
      });
      
      if (!productoDB) {
        return res.status(404).render('error', { 
          message: 'Producto no encontrado',
          backUrl: '/admin/productos'
        });
      }
      
      // Actualizar producto en la base de datos
      await productoDB.update({
        name: req.body.nombre,
        price: parseFloat(req.body.precio),
        description: req.body.descripcion,
        category: req.body.categoria,
        subcategory: req.body.subcategoria || productoDB.subcategory,
        brand: req.body.marca || productoDB.brand,
        color: req.body.color || productoDB.color,
        peso: req.body.peso || productoDB.peso,
        edad: req.body.edad || productoDB.edad,
        stock: parseInt(req.body.stock) || 0,
        image: req.file ? req.file.filename : productoDB.image,
        destacado: req.body.destacado === 'on'
      });
      
      console.log('✅ Producto actualizado en BD por admin:', productoDB.name);
      res.redirect('/admin/productos');
    } catch (error) {
      console.error('❌ Error en admin editar producto:', error);
      res.redirect('/admin/productos?error=edit');
    }
  },

  // Eliminar producto
  deleteProduct: async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      // Buscar y eliminar producto en la base de datos (marcado como borrado)
      const productoDB = await db.Producto.findByPk(productId);
      
      if (!productoDB) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      // Marcar como borrado en lugar de eliminar físicamente
      await productoDB.update({ borrado: true });
      
      console.log('✅ Producto eliminado (marcado como borrado) en BD por admin:', productoDB.name);
      res.redirect('/admin/productos');
    } catch (error) {
      console.error('❌ Error en admin eliminar producto:', error);
      res.redirect('/admin/productos?error=delete');
    }
  },

  // Estadísticas avanzadas
  estadisticas: async (req, res) => {
    try {
      // Obtener usuarios desde la base de datos
      const usuariosDB = await db.Usuario.findAll({
        where: { activo: true }
      });
      
      const usuarios = usuariosDB.map(usuario => ({
        id: usuario.id,
        firstName: usuario.nombre,
        lastName: usuario.apellido,
        email: usuario.email,
        category: usuario.rol === 'admin' ? 'Administrador' : 'Cliente',
        rol: usuario.rol,
        fechaRegistro: usuario.created_at
      }));
      
      // Obtener productos desde la base de datos
      const productosDB = await db.Producto.findAll({
        where: { borrado: false }
      });
      
      const productos = productosDB.map(producto => ({
        id: producto.id,
        name: producto.name,
        category: producto.category,
        price: producto.price,
        stock: producto.stock
      }));
      
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
          valorInventario: productos.reduce((sum, p) => sum + (p.price * p.stock), 0)
        }
      };
      
      // Calcular productos por categoría
      productos.forEach(p => {
        if (estadisticas.productos.porCategoria[p.category]) {
          estadisticas.productos.porCategoria[p.category]++;
        } else {
          estadisticas.productos.porCategoria[p.category] = 1;
        }
      });
      
      res.render('admin/estadisticas', { 
        user: req.session.userLogged,
        estadisticas 
      });
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      res.render('admin/estadisticas', { 
        user: req.session.userLogged,
        estadisticas: {
          usuarios: { total: 0, porCategoria: {}, registrosPorMes: {} },
          productos: { total: 0, porCategoria: {}, stockTotal: 0, valorInventario: 0 }
        }
      });
    }
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
