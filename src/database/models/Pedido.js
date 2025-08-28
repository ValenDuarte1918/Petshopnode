module.exports = (sequelize, DataTypes) => {
    const Pedido = sequelize.define('Pedido', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            }
        },
        orderNumber: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        status: {
            type: DataTypes.ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'),
            defaultValue: 'pendiente'
        },
        paymentMethod: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        paymentStatus: {
            type: DataTypes.ENUM('pendiente', 'pagado', 'fallido', 'reembolsado'),
            defaultValue: 'pendiente'
        },
        shippingAddress: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        shippingCity: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        shippingState: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        shippingPostalCode: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        shippingCost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        tax: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        trackingNumber: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        estimatedDelivery: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deliveredAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'pedidos',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Pedido.associate = function(models) {
        // Relación con Usuario
        Pedido.belongsTo(models.Usuario, {
            foreignKey: 'userId',
            as: 'usuario'
        });

        // Relación con Productos del Pedido
        Pedido.hasMany(models.PedidoProducto, {
            foreignKey: 'pedidoId',
            as: 'productos'
        });
    };

    return Pedido;
};
