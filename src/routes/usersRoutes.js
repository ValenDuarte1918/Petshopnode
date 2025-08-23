const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middlewares/multerMiddleware');
const validations = require('../middlewares/validationMiddleware');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiting');
const { checkLoginAttempts, requireAuth } = require('../middlewares/security');
const {check} = require("express-validator");

// Rutas de usuarios
router.get('/login', userController.login);
router.post('/login', 
    loginLimiter,           // Rate limiting específico para login
    checkLoginAttempts,     // Verificar intentos de login fallidos
    [
        check('email').isEmail().withMessage('Debe ser un email válido'),
        check('contraseña').notEmpty().withMessage('El campo contraseña es obligatorio.')
    ], 
    userController.loginProcess
);

router.get('/logout', userController.logout);
router.get('/profile', requireAuth, userController.profile); // Requerir autenticación

router.get('/registro', userController.registro);
router.post('/registro', 
    registerLimiter,        // Rate limiting para registro
    upload.single('foto_perfil'), 
    validations, 
    userController.registroPost
);

// Ruta de prueba para sesión (solo desarrollo)
router.get('/session-test', (req, res) => {
  res.json({
    session: req.session,
    userLogged: req.session.userLogged,
    sessionID: req.sessionID
  });
});

module.exports = router;