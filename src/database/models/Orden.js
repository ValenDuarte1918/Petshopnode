module.exports = (sequelize, DataTypes) => {
    const Orden = sequelize.define('Orden', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            }
        },
        order_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        status: {
            type: DataTypes.ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'),
            defaultValue: 'pendiente'
        },
        payment_method: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        payment_status: {
            type: DataTypes.ENUM('pendiente', 'pagado', 'fallido', 'reembolsado'),
            defaultValue: 'pendiente'
        },
        shipping_address: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        shipping_city: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        shipping_state: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        shipping_postal_code: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        shipping_cost: {
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
        tracking_number: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        estimated_delivery: {
            type: DataTypes.DATE,
            allowNull: true
        },
        delivered_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'ordenes',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Orden.associate = function(models) {
        // Relación con Usuario
        Orden.belongsTo(models.Usuario, {
            foreignKey: 'user_id',
            as: 'usuario'
        });

        // Relación con Items de la Orden
        Orden.hasMany(models.OrdenItem, {
            foreignKey: 'orden_id',
            as: 'items'
        });
    };

    return Orden;
};
