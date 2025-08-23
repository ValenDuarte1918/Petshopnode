const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const uploadFile = require('../middlewares/multer')

// Middleware para verificar autenticación en rutas de edición
const requireAuth = (req, res, next) => {
    console.log('🔍 requireAuth - Verificando sesión...');
    console.log('🔍 req.session.userLogged:', req.session.userLogged ? 'EXISTE' : 'NO EXISTE');
    console.log('🔍 URL solicitada:', req.originalUrl);
    console.log('🔍 Session ID:', req.sessionID);
    
    if (!req.session.userLogged) {
        console.log('❌ Sin sesión - Redirigiendo al login');
        return res.redirect('/users/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    console.log('✅ Sesión válida - Continuando...');
    next();
};

// Middleware para verificar que sea admin en rutas de edición
const requireAdmin = (req, res, next) => {
    // Log solo si hay problemas
    if (!req.session.userLogged) {
        console.log('❌ productRouter: Sin sesión - Redirigiendo al login');
        console.log('❌ URL:', req.originalUrl);
        console.log('❌ Session ID:', req.sessionID);
        return res.redirect('/users/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    
    if (req.session.userLogged.category !== 'Administrador') {
        console.log('❌ productRouter: No es administrador:', req.session.userLogged.email);
        return res.status(403).render('error', { 
            message: 'Acceso denegado. Solo administradores pueden editar productos.',
            backUrl: '/'
        });
    }
    
    next();
};

router.get('/producto', productController.list);
/* router.get('/crearProducto', productController.new); */

// Nuevas rutas para categorías
router.get('/categoria/:categoria', productController.category);
router.get('/categoria/:categoria/:subcategoria', productController.category);

// Rutas específicas para mascotas (filtro por subcategoría)
router.get('/mascotas/:mascota', productController.mascota);

//Rutas exigidas para la creación del CRUD
router.get('/producto/add', requireAdmin, productController.add);
router.post('/producto/create' , requireAdmin, uploadFile.single('img') ,productController.crearProcess);
router.get('/producto/detail/:id', productController.detail);
router.get('/producto/edit', requireAdmin, productController.edit);
router.put('/producto/edit/:id', requireAdmin, productController.editProcess);
router.post('/producto/update/:id', requireAdmin, productController.update);
router.get('/producto/delete/:id', requireAdmin, productController.delete);
router.post('/producto/delete/:id', requireAdmin, productController.destroy);
router.get('/producto/restore/:id', requireAdmin, productController.restaurar)

// Ruta alternativa para detalle de producto
router.get('/detalle/:id', productController.detail);

module.exports = router;