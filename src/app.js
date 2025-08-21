const express = require("express");
const app = express();
const session = require('express-session');

const path = require("path");
const methodOverride = require('method-override');
const mainRouter = require('./routes/mainRouter')
const userRouter = require('./routes/usersRoutes')
const productRouter = require('./routes/productRouter')
const adminRouter = require('./routes/adminRoutes')

// Configuración de sesiones mejorada
app.use(session({
    secret: 'petshop-innovador-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    name: 'petshop.session',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 horas
        secure: false, // Para desarrollo local (no HTTPS)
        httpOnly: true, // Más seguro - no accesible desde JavaScript
        sameSite: 'lax'
    }
}));

// Middleware para hacer la sesión disponible en todas las vistas
app.use((req, res, next) => {
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









