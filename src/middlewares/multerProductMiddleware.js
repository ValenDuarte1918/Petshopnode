const multer = require("multer")
const path = require("path")

// Configuración de multer para productos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../public/images/products"))
    },
    filename: (req, file, cb) => {
        console.log(file)   
        const newFileName = "producto-" + Date.now() + path.extname(file.originalname)
        cb(null, newFileName)
    }   
})

const uploadProduct = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Solo permitir imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
})

module.exports = uploadProduct;
