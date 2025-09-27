const db = require('../database/models');
const { Op } = require('sequelize');
const ResponseFactory = require('../utils/ResponseFactory');
const ProductRepository = require('../repositories/ProductRepository');

const apiController = {
    // API para búsqueda de productos
    searchProducts: async (req, res) => {
        try {
            
            const { q: query, limit = 8, category, minPrice, maxPrice, sortBy } = req.query;
            
            if (!query || query.trim().length < 2) {
                
                const errorResponse = ResponseFactory.validationError(
                    [{ field: 'q', message: 'La búsqueda debe tener al menos 2 caracteres' }],
                    'Parámetros de búsqueda inválidos'
                );
                return res.status(400).json(errorResponse);
            }

            const searchTerm = query.trim().toLowerCase();
            
            
            // Usar Repository Pattern
            const productRepository = new ProductRepository();
            
            // Buscar productos usando Repository
            const productosDB = await productRepository.searchProducts(searchTerm, {
                limit,
                category,
                minPrice,
                maxPrice,
                sortBy
            });

            

            // Mapear productos para respuesta
            const productos = productosDB.map(producto => ({
                id: producto.id,
                nombre: producto.name,
                descripcion: producto.description,
                img: producto.image,
                categoria: producto.category,
                subcategoria: producto.subcategory,
                brand: producto.brand,
                color: producto.color,
                precio: producto.price,
                stock: producto.stock
            }));

            // Usar ResponseFactory para respuesta estandarizada
            const response = ResponseFactory.success(
                {
                    productos: productos,  // Mantener compatibilidad con frontend
                    stats: {
                        totalFound: productos.length,
                        query: query,
                        hasMore: productos.length === parseInt(limit)
                    },
                    filters: { category, minPrice, maxPrice }
                },
                `Búsqueda completada para: "${query}"`
            );
            

            
            res.status(200).json(response);

        } catch (error) {
            
            const errorResponse = ResponseFactory.error(
                'SEARCH_ERROR',
                'Error al buscar productos',
                500,
                { query: req.query }
            );
            res.status(500).json(errorResponse);
        }
    },

    // API para obtener sugerencias de búsqueda
    getSearchSuggestions: async (req, res) => {
        try {
            const { q: query } = req.query;
            
            if (!query || query.trim().length < 2) {
                const response = ResponseFactory.success({ suggestions: [] }, 'No hay sugerencias disponibles');
                return res.status(200).json(response);
            }

            const searchTerm = query.trim().toLowerCase();
            const productRepository = new ProductRepository();

            // Obtener sugerencias de categorías, marcas y nombres de productos
            const [categories, brands, products] = await Promise.all([
                // Categorías únicas
                db.Producto.findAll({
                    attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('category')), 'category']],
                    where: {
                        borrado: false,
                        category: { [Op.like]: `%${searchTerm}%` }
                    },
                    limit: 3,
                    raw: true
                }),
                
                // Marcas únicas
                db.Producto.findAll({
                    attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('brand')), 'brand']],
                    where: {
                        borrado: false,
                        brand: {
                            [Op.and]: [
                                { [Op.like]: `%${searchTerm}%` },
                                { [Op.ne]: null }
                            ]
                        }
                    },
                    limit: 3,
                    raw: true
                }),
                
                // Nombres de productos populares
                db.Producto.findAll({
                    attributes: ['name'],
                    where: {
                        borrado: false,
                        name: { [Op.like]: `%${searchTerm}%` }
                    },
                    limit: 4,
                    order: [['name', 'ASC']],
                    raw: true
                })
            ]);

            const suggestions = [
                ...categories.map(c => ({ type: 'category', text: c.category })),
                ...brands.map(b => ({ type: 'brand', text: b.brand })),
                ...products.map(p => ({ type: 'product', text: p.name }))
            ].slice(0, 8);

            res.status(200).json({
                success: true,
                data: { suggestions }
            });

        } catch (error) {
            console.error('Error en sugerencias:', error);
            res.status(500).json({
                success: false,
                error: 'SUGGESTIONS_ERROR',
                message: 'Error al obtener sugerencias'
            });
        }
    },
    // API para obtener información del carrito
    getCartInfo: async (req, res) => {
        try {
            if (!req.session.userLogged) {
                return res.status(401).json({
                    success: false,
                    error: 'UNAUTHORIZED',
                    message: 'Usuario no autenticado'
                });
            }

            if (!req.session.cart || req.session.cart.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: {
                        items: [],
                        total: 0,
                        itemCount: 0
                    }
                });
            }

            const total = req.session.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            const itemCount = req.session.cart.reduce((sum, item) => sum + item.cantidad, 0);

            res.status(200).json({
                success: true,
                data: {
                    items: req.session.cart,
                    total: total,
                    itemCount: itemCount,
                    currency: 'ARS'
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'INTERNAL_ERROR',
                message: 'Error interno del servidor'
            });
        }
    },

    // API para proceder al pago
    processPayment: async (req, res) => {
        try {
            if (!req.session.userLogged) {
                return res.status(401).json({
                    success: false,
                    error: 'UNAUTHORIZED',
                    message: 'Usuario no autenticado'
                });
            }

            if (!req.session.cart || req.session.cart.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'EMPTY_CART',
                    message: 'El carrito está vacío'
                });
            }

            const { 
                shippingAddress, 
                paymentMethod, 
                cardDetails 
            } = req.body;

            // Validar datos requeridos
            if (!shippingAddress || !paymentMethod) {
                return res.status(400).json({
                    success: false,
                    error: 'MISSING_DATA',
                    message: 'Faltan datos requeridos para el pago',
                    required: ['shippingAddress', 'paymentMethod']
                });
            }

            // Calcular totales
            const subtotal = req.session.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            const shipping = subtotal >= 45000 ? 0 : 5000; // Envío gratis para compras >= $45,000
            const tax = subtotal * 0.21; // IVA 21%
            const total = subtotal + shipping + tax;

            // Verificar stock de productos
            for (const item of req.session.cart) {
                const producto = await db.Producto.findByPk(item.id);
                if (!producto || producto.stock < item.cantidad) {
                    return res.status(400).json({
                        success: false,
                        error: 'INSUFFICIENT_STOCK',
                        message: `Stock insuficiente para ${item.nombre}`,
                        product: {
                            id: item.id,
                            name: item.nombre,
                            requestedQuantity: item.cantidad,
                            availableStock: producto ? producto.stock : 0
                        }
                    });
                }
            }

            // Simular procesamiento de pago
            // En un caso real, aquí integrarías con Stripe, MercadoPago, etc.
            const paymentResult = await simulatePaymentProcessing({
                amount: total,
                method: paymentMethod,
                cardDetails: cardDetails
            });

            if (!paymentResult.success) {
                return res.status(400).json({
                    success: false,
                    error: 'PAYMENT_FAILED',
                    message: paymentResult.message || 'Error en el procesamiento del pago',
                    details: paymentResult.details
                });
            }

            // Crear orden en la base de datos
            const orderNumber = `ORD-${Date.now()}`;
            
            const orden = await db.Orden.create({
                user_id: req.session.userLogged.id,
                order_number: orderNumber,
                status: 'pendiente',
                payment_method: paymentMethod,
                payment_status: 'pagado',
                shipping_address: shippingAddress.address,
                shipping_city: shippingAddress.city,
                shipping_state: shippingAddress.state,
                shipping_postal_code: shippingAddress.postalCode,
                subtotal: subtotal,
                shipping_cost: shipping,
                tax: tax,
                total: total,
                notes: `Pago procesado - ID: ${paymentResult.transactionId}`,
                estimated_delivery: getEstimatedDelivery(shippingAddress.postalCode)
            });

            // Crear items de la orden
            for (const item of req.session.cart) {
                await db.OrdenItem.create({
                    orden_id: orden.id,
                    producto_id: item.id,
                    quantity: item.cantidad,
                    unit_price: item.precio,  // Corregido
                    total_price: item.precio * item.cantidad,
                    product_name: item.nombre,  // Corregido
                    product_image: item.imagen  // Corregido
                });
            }

            // Actualizar stock de productos
            for (const item of req.session.cart) {
                await db.Producto.decrement('stock', {
                    by: item.cantidad,
                    where: { id: item.id }
                });
            }

            // Limpiar carrito
            req.session.cart = [];

            // Respuesta exitosa
            res.status(200).json({
                success: true,
                data: {
                    orderId: orden.order_number,
                    transactionId: paymentResult.transactionId,
                    amount: total,
                    currency: 'ARS',
                    status: 'confirmed',
                    estimatedDelivery: getEstimatedDelivery(shippingAddress.postalCode),
                    breakdown: {
                        subtotal: subtotal,
                        shipping: shipping,
                        tax: tax,
                        total: total
                    }
                },
                message: 'Pago procesado exitosamente'
            });

        } catch (error) {
            console.error('Error en processPayment:', error);
            res.status(500).json({
                success: false,
                error: 'INTERNAL_ERROR',
                message: 'Error interno del servidor',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // API para obtener métodos de pago disponibles
    getPaymentMethods: async (req, res) => {
        try {
            const paymentMethods = [
                {
                    id: 'credit_card',
                    name: 'Tarjeta de Crédito',
                    description: 'Visa, Mastercard, American Express',
                    icon: 'fas fa-credit-card',
                    enabled: true
                },
                {
                    id: 'debit_card',
                    name: 'Tarjeta de Débito',
                    description: 'Visa Débito, Mastercard Débito',
                    icon: 'fas fa-money-check-alt',
                    enabled: true
                },
                {
                    id: 'mercadopago',
                    name: 'MercadoPago',
                    description: 'Pagar con MercadoPago',
                    icon: 'fab fa-cc-mastercard',
                    enabled: true
                },
                {
                    id: 'bank_transfer',
                    name: 'Transferencia Bancaria',
                    description: 'CBU: 1234567890123456789012',
                    icon: 'fas fa-university',
                    enabled: true
                }
            ];

            res.status(200).json({
                success: true,
                data: paymentMethods
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'INTERNAL_ERROR',
                message: 'Error interno del servidor'
            });
        }
    },

    // API para validar dirección de envío
    validateShippingAddress: async (req, res) => {
        try {
            const { address, city, postalCode, state } = req.body;

            if (!address || !city || !postalCode || !state) {
                return res.status(400).json({
                    success: false,
                    error: 'INCOMPLETE_ADDRESS',
                    message: 'Todos los campos de dirección son requeridos'
                });
            }

            // Simular validación de dirección
            const isValid = await validateAddress({ address, city, postalCode, state });
            
            if (!isValid.valid) {
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_ADDRESS',
                    message: isValid.message
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    valid: true,
                    shippingCost: calculateShippingCost(postalCode),
                    estimatedDelivery: getEstimatedDelivery(postalCode)
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'INTERNAL_ERROR',
                message: 'Error interno del servidor'
            });
        }
    }
};

// Funciones auxiliares
async function simulatePaymentProcessing(paymentData) {
    // Simular demora de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular validación de tarjeta
    if (paymentData.method === 'credit_card' || paymentData.method === 'debit_card') {
        if (!paymentData.cardDetails || !paymentData.cardDetails.number) {
            return {
                success: false,
                message: 'Número de tarjeta inválido'
            };
        }
        
        // Simular algunos casos de fallo
        if (paymentData.cardDetails.number === '4000000000000002') {
            return {
                success: false,
                message: 'Tarjeta declinada'
            };
        }
    }
    
    return {
        success: true,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message: 'Pago procesado exitosamente'
    };
}

function calculateShippingCost(postalCode) {
    // Lógica básica para calcular costo de envío
    const zone = getShippingZone(postalCode);
    const costs = {
        local: 2500,
        regional: 4000,
        national: 6500
    };
    return costs[zone] || costs.national;
}

function getShippingZone(postalCode) {
    // Simplificado: basado en código postal
    if (postalCode.startsWith('1')) return 'local'; // CABA
    if (postalCode.startsWith('16') || postalCode.startsWith('17')) return 'regional'; // GBA
    return 'national';
}

function getEstimatedDelivery(postalCode) {
    const zone = postalCode ? getShippingZone(postalCode) : 'local';
    const daysToAdd = {
        local: 2,      // 2 días para entrega local
        regional: 3,   // 3 días para entrega regional
        national: 5    // 5 días para entrega nacional
    };
    
    const deliveryDays = daysToAdd[zone] || daysToAdd.national;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
    
    return estimatedDate;
}

async function validateAddress(addressData) {
    // Simular validación de dirección
    // En un caso real, usarías un servicio como Google Maps API
    
    if (addressData.address.length < 100) {
        return {
            valid: false,
            message: 'La dirección es muy corta'
        };
    }
    
    if (!/^\d{4}$/.test(addressData.postalCode)) {
        return {
            valid: false,
            message: 'Código postal inválido (debe ser 4 dígitos)'
        };
    }
    
    return {
        valid: true,
        message: 'Dirección válida'
    };
}

module.exports = apiController;
