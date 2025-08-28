module.exports = (sequelize, DataTypes) => {
    const PedidoProducto = sequelize.define('PedidoProducto', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        pedidoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'pedidos',
                key: 'id'
            }
        },
        productoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'productos',
                key: 'id'
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        product_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        product_image: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    }, {
        tableName: 'pedido_productos',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    PedidoProducto.associate = function(models) {
        // Relación con Pedido
        PedidoProducto.belongsTo(models.Pedido, {
            foreignKey: 'pedidoId',
            as: 'pedido'
        });

        // Relación con Producto
        PedidoProducto.belongsTo(models.Producto, {
            foreignKey: 'productoId',
            as: 'producto'
        });
    };

    return PedidoProducto;
};
