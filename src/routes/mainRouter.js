const express = require('express')
const router = express.Router()

const multer = require('multer')
const path = require('path')
const mainController = require('../controllers/mainControllers')
const { requireAuth } = require('../middlewares/security')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../public/images"))
    },
    filename: (req, file, cb) => {
        const newFileName = "producto-" + Date.now() + path.extname(file.originalname)
        cb(null, newFileName)
    }   
})


const upload = multer({storage})

router.get('/', mainController.home)
router.get('/productos', mainController.productos) // Nueva ruta para ver todos los productos

// Rutas del carrito que requieren autenticación
router.get('/carrito', requireAuth, mainController.carrito)
router.post('/carrito/add', requireAuth, mainController.addToCart) // Ruta sin ID para AJAX
router.post('/carrito/add/:id', requireAuth, mainController.addToCart) // Ruta con ID (legacy)
router.put('/carrito/update/:id', requireAuth, mainController.updateCartItem)
router.delete('/carrito/remove/:id', requireAuth, mainController.removeFromCart)
router.post('/carrito/clear', requireAuth, mainController.clearCart)

// Ruta debug (solo para desarrollo)
router.get('/debug/cart', mainController.debugCart)

router.get('/create', mainController.create)
router.post('/create', upload.single('image'), mainController.store)
router.get('/detail/:id', mainController.detail)
router.get('/edit/:id', mainController.edit)
router.put('/edit/:id', upload.single('image'), mainController.update)
router.get('/delete/:id', mainController.delete)


module.exports = router