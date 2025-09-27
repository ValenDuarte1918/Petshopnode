/**
 * 🗄️ REPOSITORY PATTERN - Product Repository
 * Centraliza todas las operaciones de acceso a datos de productos
 */

const db = require('../database/models');
const { Op } = require('sequelize');

class ProductRepository {
    constructor() {
        this.model = db.Producto;
    }

    /**
     * Buscar productos por término de búsqueda
     * @param {string} searchTerm - Término de búsqueda
     * @param {Object} options - Opciones de búsqueda
     */
    async searchProducts(searchTerm, options = {}) {
        const {
            limit = 8,
            offset = 0,
            category = null,
            minPrice = null,
            maxPrice = null,
            sortBy = 'relevance',
            includeDeleted = false
        } = options;

        try {
            const whereConditions = this.buildSearchConditions(searchTerm, {
                category,
                minPrice,
                maxPrice,
                includeDeleted
            });

            const orderConditions = this.buildOrderConditions(sortBy, searchTerm);


            const productos = await this.model.findAll({
                where: whereConditions,
                order: orderConditions,
                limit: parseInt(limit),
                offset: parseInt(offset),
                attributes: [
                    'id', 'name', 'description', 'image', 'category', 
                    'subcategory', 'brand', 'color', 'price', 'stock', 
                    'destacado', 'peso', 'edad'
                ]
            });

            return productos;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener productos destacados
     * @param {number} limit - Límite de productos
     */
    async getFeaturedProducts(limit = 6) {
        try {
            return await this.model.findAll({
                where: {
                    borrado: false,
                    destacado: true,
                    stock: { [Op.gt]: 0 }
                },
                order: [['updated_at', 'DESC']],
                limit: parseInt(limit)
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener productos por categoría
     * @param {string} category - Categoría
     * @param {Object} options - Opciones de filtrado
     */
    async getProductsByCategory(category, options = {}) {
        const { limit = 12, offset = 0, sortBy = 'name' } = options;

        try {
            return await this.model.findAll({
                where: {
                    borrado: false,
                    category: { [Op.like]: `%${category}%` },
                    stock: { [Op.gt]: 0 }
                },
                order: this.buildOrderConditions(sortBy),
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener sugerencias de búsqueda
     * @param {string} searchTerm - Término parcial
     * @param {number} limit - Límite de sugerencias
     */
    async getSearchSuggestions(searchTerm, limit = 5) {
        try {
            // Sugerencias por nombre de producto
            const productSuggestions = await this.model.findAll({
                attributes: ['name'],
                where: {
                    borrado: false,
                    name: { [Op.like]: `%${searchTerm}%` }
                },
                limit: parseInt(limit),
                order: [
                    [db.Sequelize.literal(`CASE WHEN LOWER(name) LIKE '${searchTerm.toLowerCase()}%' THEN 1 ELSE 2 END`), 'ASC'],
                    ['name', 'ASC']
                ]
            });

            // Sugerencias por categoría
            const categorySuggestions = await this.model.findAll({
                attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('category')), 'category']],
                where: {
                    borrado: false,
                    category: { [Op.like]: `%${searchTerm}%` }
                },
                limit: 3
            });

            // Sugerencias por marca
            const brandSuggestions = await this.model.findAll({
                attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('brand')), 'brand']],
                where: {
                    borrado: false,
                    brand: { 
                        [Op.and]: [
                            { [Op.not]: null },
                            { [Op.like]: `%${searchTerm}%` }
                        ]
                    }
                },
                limit: 3
            });

            return {
                products: productSuggestions.map(p => p.name),
                categories: categorySuggestions.map(c => c.category),
                brands: brandSuggestions.map(b => b.brand).filter(Boolean)
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Construir condiciones de búsqueda
     * @private
     */
    buildSearchConditions(searchTerm, options = {}) {
        const { category, minPrice, maxPrice, includeDeleted } = options;
        
        const conditions = {
            [Op.or]: [
                { name: { [Op.like]: `%${searchTerm}%` } },
                { description: { [Op.like]: `%${searchTerm}%` } },
                { category: { [Op.like]: `%${searchTerm}%` } },
                { subcategory: { [Op.like]: `%${searchTerm}%` } },
                { brand: { [Op.like]: `%${searchTerm}%` } }
            ]
        };

        // Solo incluir productos no borrados por defecto
        if (!includeDeleted) {
            conditions.borrado = false;
        }

        // Filtro por categoría
        if (category) {
            conditions.category = { [Op.like]: `%${category}%` };
        }

        // Filtro por precio
        if (minPrice || maxPrice) {
            conditions.price = {};
            if (minPrice) conditions.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) conditions.price[Op.lte] = parseFloat(maxPrice);
        }

        return conditions;
    }

    /**
     * Construir condiciones de ordenamiento
     * @private
     */
    buildOrderConditions(sortBy, searchTerm = '') {
        const orderOptions = {
            'relevance': searchTerm ? [
                [db.Sequelize.literal(`CASE WHEN LOWER(name) LIKE '%${searchTerm.toLowerCase()}%' THEN 1 ELSE 2 END`), 'ASC'],
                ['name', 'ASC']
            ] : [['name', 'ASC']],
            'name_asc': [['name', 'ASC']],
            'name_desc': [['name', 'DESC']],
            'price_asc': [['price', 'ASC']],
            'price_desc': [['price', 'DESC']],
            'newest': [['created_at', 'DESC']],
            'featured': [['destacado', 'DESC'], ['name', 'ASC']]
        };

        return orderOptions[sortBy] || orderOptions['relevance'];
    }

    /**
     * Contar productos que coinciden con la búsqueda
     * @param {string} searchTerm - Término de búsqueda
     * @param {Object} options - Opciones de filtrado
     */
    async countSearchResults(searchTerm, options = {}) {
        try {
            const whereConditions = this.buildSearchConditions(searchTerm, options);
            return await this.model.count({ where: whereConditions });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener producto por ID
     * @param {number} id - ID del producto
     */
    async findById(id) {
        try {
            return await this.model.findByPk(id, {
                where: { borrado: false }
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ProductRepository;