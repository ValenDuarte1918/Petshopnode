const multer = require("multer")
const path = require("path")

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../public/images/users"))
    },
    filename: (req, file, cb) => {
        const newFileName = "user-" + Date.now() + path.extname(file.originalname)
        cb(null, newFileName)
    }   
})

const upload = multer({storage})

module.exports = upload;
