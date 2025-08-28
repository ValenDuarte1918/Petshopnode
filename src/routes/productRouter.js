const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const uploadFile = require('../middlewares/multer')

// Middleware para verificar autenticación en rutas de edición
const requireAuth = (req, res, next) => {
    if (!req.session.userLogged) {
        return res.redirect('/users/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    next();
};

// Middleware para verificar que sea admin en rutas de edición
const requireAdmin = (req, res, next) => {
    if (!req.session.userLogged) {
        return res.redirect('/users/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    
    if (req.session.userLogged.category !== 'Administrador') {
        return res.status(403).render('error', { 
            message: 'Acceso denegado. Solo administradores pueden editar productos.',
            backUrl: '/'
        });
    }
    
    next();
};

router.get('/producto', productController.list);

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
router.post('/producto/delete/:id', requireAdmin, productController.delete);
router.get('/producto/restore/:id', requireAdmin, productController.restore)

// Ruta alternativa para detalle de producto
router.get('/detalle/:id', productController.detail);

module.exports = router;