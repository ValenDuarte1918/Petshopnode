const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middlewares/multerMiddleware');
const uploadProduct = require('../middlewares/multerProductMiddleware');
const { requireAdmin } = require('../middlewares/security');
const { uploadLimiter } = require('../middlewares/rateLimiting');

// Middleware para verificar que sea administrador en todas las rutas
router.use(requireAdmin); // Reemplazamos adminController.isAdmin con el nuevo middleware

// Dashboard principal
router.get('/', adminController.dashboard);
router.get('/dashboard', adminController.dashboard);

// Gestión de usuarios
router.get('/usuarios', adminController.usuarios);
router.delete('/usuarios/:id', adminController.deleteUser);
router.put('/usuarios/:id/role', adminController.changeUserRole);

// Gestión de productos
router.get('/productos', adminController.productos);
router.get('/productos/crear', adminController.createProduct);
router.post('/productos/crear', uploadProduct.single('imagen'), adminController.createProductPost);
router.get('/productos/editar/:id', adminController.editProduct);
router.put('/productos/editar/:id', uploadProduct.single('imagen'), adminController.editProductPost);
router.delete('/productos/:id', adminController.deleteProduct);

// Estadísticas
router.get('/estadisticas', adminController.estadisticas);

// Seguridad
router.get('/seguridad', adminController.seguridad);

module.exports = router;
