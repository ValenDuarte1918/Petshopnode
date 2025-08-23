const express = require("express");
const app = express();
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const path = require("path");
const methodOverride = require('method-override');
const mainRouter = require('./routes/mainRouter')
const userRouter = require('./routes/usersRoutes')
const productRouter = require('./routes/productRouter')
const adminRouter = require('./routes/adminRoutes')

// Manejo de errores de sesión EPERM
process.on('uncaughtException', (err) => {
    if (err.code === 'EPERM' && err.path && err.path.includes('sessions')) {
        console.log('⚠️ Error de permisos en sesiones (ignorado):', err.message);
        return; // Continuar sin crash
    }
    console.error('💥 Error crítico:', err);
    process.exit(1);
});

// Configuración de sesiones con almacenamiento persistente
app.use(session({
    store: new FileStore({
        path: './sessions',
        ttl: 60 * 60 * 24, // 24 horas
        retries: 3,
        factor: 2,
        minTimeout: 100,
        maxTimeout: 1000,
        reapInterval: 60 * 60, // Limpiar archivos expirados cada hora
        logFn: function() {
            // Deshabilitar completamente los logs del FileStore
            // para evitar mensajes confusos
        },
        fileExtension: '.json',
        encoding: 'utf8',
        encoder: JSON.stringify,
        decoder: JSON.parse
    }),
    secret: 'petshop-innovador-secret-key-2025',
    resave: false, // No forzar guardado con FileStore
    saveUninitialized: false,
    name: 'petshop.session',
    rolling: true, // Renovar sesión en cada request
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 horas
        secure: false, // Para desarrollo local (no HTTPS)
        httpOnly: true, // Prevenir acceso desde JavaScript del cliente
        sameSite: 'lax'
    }
}));

// Middleware para hacer la sesión disponible en todas las vistas
app.use((req, res, next) => {
    // Debug solo para rutas de edición y admin
    if (req.url.includes('/admin') || req.url.includes('/edit')) {
        console.log(`📊 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
        console.log(`📊 Session ID: ${req.sessionID}`);
        console.log(`📊 Usuario logueado: ${req.session.userLogged ? req.session.userLogged.email : 'NO'}`);
    }
    
    res.locals.userLogged = req.session.userLogged;
    res.locals.isLoggedIn = !!req.session.userLogged;
    
    // Calcular cantidad de items en carrito
    const carrito = req.session.carrito || [];
    res.locals.cartCount = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    next();
});


app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Rutas - DEBEN ir antes de app.listen()
app.use('/', mainRouter)
app.use('/users', userRouter)  // Cambié de '/user' a '/users'
app.use('/productos', productRouter)  // Ruta específica para productos
app.use('/', productRouter)
app.use('/admin', adminRouter)

app.listen(3000, ()=>{
    console.log("Servidor corriendo en el puerto 3000")
})









