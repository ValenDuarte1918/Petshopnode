const path = require("path")

const {body} = require("express-validator")

const validations = [
    body("nombre").notEmpty().withMessage("Tienes que escribir un nombre"),
    body("apellido").notEmpty().withMessage("Tienes que escribir un apellido"),
    body("correo").notEmpty().withMessage("Tienes que escribir un email").bail().isEmail().withMessage("Debes escribir un formato de email válido"),
    body("contrasena").notEmpty().withMessage("Tienes que escribir una contraseña"),
    body("categoria").notEmpty().withMessage("Tienes que elegir un país"),
    body('foto_perfil').custom((value, {req}) => {
        let file = req.file;
        let acceptedExtensions = [".jpg", ".png", ".gif"]
        if(!file){
            throw new Error("Tienes que subir una imagen")
        }
        else{
            let fileExtension = path.extname(file.originalname)
            if(!acceptedExtensions.includes(fileExtension)){
                throw new Error(`Las extensiones de archivo permitidas son ${acceptedExtensions.join(", ")}`)
            }
        }
        return true
    })
]

module.exports = validations;