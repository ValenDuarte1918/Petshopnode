// SOLUCIÓN ALTERNATIVA: Session Store en archivo
// Para implementar si el problema persiste

const session = require('express-session');
const FileStore = require('session-file-store')(session);

app.use(session({
    store: new FileStore({
        path: './sessions',
        ttl: 86400, // 24 horas
        reapInterval: 3600 // limpiar cada hora
    }),
    secret: 'petshop-innovador-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    name: 'petshop.session',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 horas
        secure: false,
        httpOnly: true,
        sameSite: 'lax'
    }
}));
