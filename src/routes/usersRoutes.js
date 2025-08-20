const express = require('express')
const router = express.Router()
const upload = require('../middlewares/multerMiddleware')
const validations = require('../middlewares/validationMiddleware')
const userController = require('../controllers/userController')
const {check} = require("express-validator");

router.get('/login', userController.login)
router.post('/login', [
    check('email').isEmail().withMessage('Debe ser un email válido'),
    check('contraseña').notEmpty().withMessage('El campo contraseña es obligatorio.')
], userController.loginProcess);

router.get('/logout', userController.logout);
router.get('/profile', userController.profile);

router.get('/registro', userController.registro)
router.post('/registro', upload.single('foto_perfil'), validations,userController.registroPost)

module.exports = router