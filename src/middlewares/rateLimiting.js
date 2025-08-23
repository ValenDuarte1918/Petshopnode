const rateLimit = require('express-rate-limit');

// Rate limiting para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por IP
    message: {
        error: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.',
        type: 'rate_limit_exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // No contar requests exitosos
});

// Rate limiting general
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por IP
    message: {
        error: 'Demasiadas peticiones desde esta IP. Intenta nuevamente más tarde.',
        type: 'rate_limit_exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false
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
