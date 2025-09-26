const rateLimit = require('express-rate-limit');

// Rate limiting para login (más permisivo en desarrollo)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 5 : 50, // 50 intentos en dev, 5 en prod
    message: {
        error: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.',
        type: 'rate_limit_exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // No contar requests exitosos
    skip: (req) => {
        // En desarrollo, ser más permisivo con localhost
        if (process.env.NODE_ENV !== 'production') {
            const ip = req.ip || req.connection.remoteAddress;
            return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
        }
        return false;
    }
});

// Rate limiting general (más permisivo en desarrollo)
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: process.env.NODE_ENV === 'production' ? 100 : 10000, // 10000 requests en dev, 100 en prod
    message: {
        error: 'Demasiadas peticiones desde esta IP. Intenta nuevamente más tarde.',
        type: 'rate_limit_exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // En desarrollo, permitir localhost sin límites
        if (process.env.NODE_ENV !== 'production') {
            const ip = req.ip || req.connection.remoteAddress;
            return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
        }
        return false;
    }
});

// Rate limiting para registro
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 registros por IP por hora
    message: {
        error: 'Demasiados registros desde esta IP. Intenta nuevamente en 1 hora.',
        type: 'rate_limit_exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting para upload de archivos
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 uploads por IP
    message: {
        error: 'Demasiadas subidas de archivos. Intenta nuevamente más tarde.',
        type: 'rate_limit_exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    generalLimiter,
    registerLimiter,
    uploadLimiter
};
