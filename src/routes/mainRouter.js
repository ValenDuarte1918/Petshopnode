const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const controller = require('../controllers/mainControllers');

// Rutas principales
const { requireAuth } = require('../middlewares/security');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../public/images"))
    },
    filename: (req, file, cb) => {
        const newFileName = "producto-" + Date.now() + path.extname(file.originalname)
        cb(null, newFileName)
    }   
});

const upload = multer({storage});

router.get('/', controller.home);
router.get('/productos', controller.productos);

// Rutas del carrito que requieren autenticación
router.get('/carrito', requireAuth, controller.carrito);
router.post('/carrito/add', requireAuth, controller.addToCart);
router.post('/carrito/add/:id', requireAuth, controller.addToCart);
router.put('/carrito/update/:id', requireAuth, controller.updateCartItem);
router.delete('/carrito/remove/:id', requireAuth, controller.removeFromCart);
router.post('/carrito/clear', requireAuth, controller.clearCart);

// Ruta del checkout que requiere autenticación
router.get('/checkout', requireAuth, controller.checkout);

// Ruta de confirmación de pedido
router.get('/order-confirmation', requireAuth, controller.orderConfirmation);

router.get('/create', controller.create);
router.post('/create', upload.single('image'), controller.store);
router.get('/detail/:id', controller.detail);
router.get('/edit/:id', controller.edit);
router.post('/edit/:id', upload.single('image'), controller.update);

module.exports = router;
