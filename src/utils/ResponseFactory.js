/**
 * 🏭 FACTORY PATTERN - Response Factory
 * Estandariza las respuestas de la API para mantener consistencia
 */

class ResponseFactory {
    /**
     * Crear respuesta exitosa estandarizada
     * @param {*} data - Datos de la respuesta
     * @param {string} message - Mensaje descriptivo
     * @param {Object} meta - Metadatos adicionales
     */
    static success(data, message = 'Operación exitosa', meta = {}) {
        return {
            success: true,
            message,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: this.generateRequestId(),
                ...meta
            }
        };
    }

    /**
     * Crear respuesta de error estandarizada
     * @param {string|Error} error - Error o código de error
     * @param {string} message - Mensaje de error personalizado
     * @param {number} statusCode - Código HTTP
     * @param {Object} details - Detalles adicionales del error
     */
    static error(error, message = null, statusCode = 500, details = {}) {
        const errorCode = typeof error === 'string' ? error : error.code || 'INTERNAL_ERROR';
        const errorMessage = message || (typeof error === 'object' ? error.message : error) || 'Error interno del servidor';

        return {
            success: false,
            error: {
                code: errorCode,
                message: errorMessage,
                statusCode,
                ...details
            },
            meta: {
                timestamp: new Date().toISOString(),
                requestId: this.generateRequestId()
            }
        };
    }

    /**
     * Respuesta para búsquedas con paginación
     * @param {Array} items - Elementos encontrados
     * @param {Object} pagination - Información de paginación
     * @param {string} query - Término de búsqueda
     */
    static searchResults(items, pagination = {}, query = '') {
        return this.success(
            {
                items,
                pagination: {
                    total: items.length,
                    page: 1,
                    limit: items.length,
                    hasMore: false,
                    ...pagination
                }
            },
            `Búsqueda completada${query ? ` para: "${query}"` : ''}`,
            { 
                searchQuery: query,
                resultCount: items.length 
            }
        );
    }

    /**
     * Respuesta para operaciones CRUD
     * @param {string} operation - Tipo de operación (create, update, delete)
     * @param {*} data - Datos resultantes
     * @param {string} resource - Nombre del recurso
     */
    static crudOperation(operation, data, resource = 'recurso') {
        const messages = {
            'create': `${resource} creado exitosamente`,
            'update': `${resource} actualizado exitosamente`,
            'delete': `${resource} eliminado exitosamente`,
            'read': `${resource} obtenido exitosamente`
        };

        return this.success(
            data,
            messages[operation] || `Operación ${operation} completada`,
            { operation, resource }
        );
    }

    /**
     * Respuesta para validaciones fallidas
     * @param {Array|Object} validationErrors - Errores de validación
     * @param {string} message - Mensaje personalizado
     */
    static validationError(validationErrors, message = 'Datos de entrada inválidos') {
        return this.error(
            'VALIDATION_ERROR',
            message,
            400,
            { validationErrors }
        );
    }

    /**
     * Respuesta para recursos no encontrados
     * @param {string} resource - Recurso que no se encontró
     */
    static notFound(resource = 'Recurso') {
        return this.error(
            'NOT_FOUND',
            `${resource} no encontrado`,
            404
        );
    }

    /**
     * Respuesta para acceso no autorizado
     * @param {string} message - Mensaje personalizado
     */
    static unauthorized(message = 'Acceso no autorizado') {
        return this.error(
            'UNAUTHORIZED',
            message,
            401
        );
    }

    /**
     * Generar ID único para el request
     * @private
     */
    static generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

module.exports = ResponseFactory;