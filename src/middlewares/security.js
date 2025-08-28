const fs = require('fs');
const path = require('path');

// Registro de intentos de login fallidos
const loginAttempts = new Map();
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 5;

// Middleware para autenticación de admin
const requireAdmin = (req, res, next) => {
    console.log('🔐 requireAdmin - Verificando acceso admin...');
    console.log('🔐 userLogged:', req.session.userLogged);
    
    // Verificar si está logueado
    if (!req.session.userLogged) {
        console.log('❌ No hay usuario logueado');
        return res.redirect('/users/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    
    console.log('🔐 Usuario logueado:', req.session.userLogged.email);
    console.log('🔐 Categoría del usuario:', req.session.userLogged.category);
    
    // Verificar si es administrador
    if (req.session.userLogged.category !== 'Administrador') {
        console.log('❌ Usuario no es administrador. Categoría:', req.session.userLogged.category);
        return res.status(403).render('error', {
            title: 'Acceso Denegado',
            message: 'No tienes permisos para acceder a esta sección.',
            error: { status: 403 }
        });
    }
    
    console.log('✅ Acceso admin autorizado');
    next();
};

// Middleware para autenticación de usuario
const requireAuth = (req, res, next) => {
    const isAjax = req.xhr || 
                   req.headers.accept?.indexOf('json') > -1 || 
                   req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                   req.headers['content-type']?.indexOf('json') > -1;
    
    if (!req.session.userLogged) {
        // Si es petición AJAX, devolver JSON
        if (isAjax) {
            return res.status(401).json({ 
                success: false, 
                message: 'Debes iniciar sesión para agregar productos al carrito',
                redirectUrl: '/users/login'
            });
        }
        // Si no es AJAX, redirigir al login
        return res.redirect('/users/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    next();
};

// Middleware para verificar intentos de login fallidos
const checkLoginAttempts = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const attempts = loginAttempts.get(clientIP);
    
    if (attempts && attempts.count >= MAX_ATTEMPTS) {
        const timeLeft = LOCKOUT_TIME - (Date.now() - attempts.lastAttempt);
        if (timeLeft > 0) {
            return res.status(429).json({
                error: `Cuenta bloqueada por múltiples intentos fallidos. Intenta nuevamente en ${Math.ceil(timeLeft / 60000)} minutos.`,
                timeLeft: timeLeft
            });
        } else {
            // Limpiar intentos si ya pasó el tiempo
            loginAttempts.delete(clientIP);
        }
    }
    
    next();
};

// Función para registrar intento fallido
const recordFailedAttempt = (req) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const attempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
    
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    
    loginAttempts.set(clientIP, attempts);
    
    // Log de seguridad
    logSecurityEvent('failed_login', {
        ip: clientIP,
        email: req.body.email,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        attempts: attempts.count
    });
};

// Función para limpiar intentos exitosos
const clearFailedAttempts = (req) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    loginAttempts.delete(clientIP);
};

// Logger de eventos de seguridad
const logSecurityEvent = (event, data) => {
    const logEntry = {
        event,
        data,
        timestamp: new Date().toISOString()
    };
    
    const logPath = path.join(__dirname, '../logs/security.log');
    const logDir = path.dirname(logPath);
    
    // Crear directorio de logs si no existe
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
};

// Middleware para validar permisos de archivo (versión mejorada)
const validateFileAccess = (req, res, next) => {
    const requestedPath = req.path;
    
    // Lista de archivos y directorios permitidos
    const allowedPaths = [
        '/css/',
        '/js/',
        '/images/',
        '/favicon.ico'
    ];
    
    // Verificar si la ruta está permitida
    const isAllowed = allowedPaths.some(allowedPath => 
        requestedPath.startsWith(allowedPath)
    );
    
    // Verificar extensiones de archivo permitidas
    const allowedExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp'];
    const hasAllowedExtension = allowedExtensions.some(ext => 
        requestedPath.toLowerCase().endsWith(ext)
    );
    
    if (!isAllowed || !hasAllowedExtension) {
        logSecurityEvent('unauthorized_file_access', {
            ip: req.ip,
            path: requestedPath,
            userAgent: req.get('User-Agent'),
            referer: req.get('Referer')
        });
        return res.status(403).send('Acceso denegado');
    }
    
    next();
};

// Middleware para sanitizar input
const sanitizeInput = (req, res, next) => {
    // Función para limpiar strings
    const sanitize = (str) => {
        if (typeof str !== 'string') return str;
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
            .replace(/javascript:/gi, '') // Remover javascript:
            .replace(/on\w+\s*=/gi, '') // Remover event handlers
            .trim();
    };
    
    // Sanitizar body
    if (req.body && typeof req.body === 'object') {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitize(req.body[key]);
            }
        });
    }
    
    // Sanitizar query params
    if (req.query && typeof req.query === 'object') {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitize(req.query[key]);
            }
        });
    }
    
    next();
};

module.exports = {
    requireAdmin,
    requireAuth,
    checkLoginAttempts,
    recordFailedAttempt,
    clearFailedAttempts,
    logSecurityEvent,
    validateFileAccess,
    sanitizeInput
};
