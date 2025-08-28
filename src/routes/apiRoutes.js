const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/security');
const apiController = require('../controllers/apiController');

// Middleware para logging de API
router.use((req, res, next) => {
    console.log(`🔗 API: ${req.method} ${req.originalUrl}`);
    res.header('Content-Type', 'application/json');
    next();
});

// === RUTAS DE PAGO ===
// GET /api/payment/methods - Obtener métodos de pago disponibles
router.get('/payment/methods', (req, res) => {
    return apiController.getPaymentMethods(req, res);
});

// POST /api/payment/process - Procesar pago
router.post('/payment/process', requireAuth, (req, res) => {
    return apiController.processPayment(req, res);
});

// POST /api/shipping/validate - Validar dirección de envío (no requiere auth)
router.post('/shipping/validate', (req, res) => {
    return apiController.validateShippingAddress(req, res);
});

// === RUTAS DE CARRITO ===
// GET /api/cart - Obtener carrito actual
router.get('/cart', requireAuth, (req, res) => {
    try {
        const cart = req.session.cart || [];
        
        // Convertir precios de string a número para cálculos
        const cartWithNumericPrices = cart.map(item => ({
            ...item,
            precio: parseFloat(item.precio) || 0
        }));
        
        const cartCount = cartWithNumericPrices.reduce((sum, item) => sum + item.cantidad, 0);
        const subtotal = cartWithNumericPrices.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

        console.log('🛒 Carrito API - Items:', cartWithNumericPrices);
        console.log('🛒 Carrito API - Count:', cartCount);
        console.log('🛒 Carrito API - Subtotal:', subtotal);

        res.json({
            success: true,
            data: {
                items: cartWithNumericPrices,
                count: cartCount,
                subtotal: subtotal
            }
        });
    } catch (error) {
        console.error('Error obteniendo carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// === DOCUMENTACIÓN DE API ===
// GET /api - Documentación básica de la API
router.get('/', (req, res) => {
    res.json({
        message: 'PetShop API v1.0',
        status: 'active',
        version: '1.0.0',
        endpoints: {
            payment: [
                'GET /api/payment/methods - Obtener métodos de pago',
                'POST /api/payment/process - Procesar pago'
            ],
            cart: [
                'GET /api/cart - Obtener carrito actual'
            ],
            documentation: [
                'GET /api - Esta documentación'
            ]
        }
    });
});

module.exports = router;
