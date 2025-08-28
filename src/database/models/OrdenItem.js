module.exports = (sequelize, DataTypes) => {
    const OrdenItem = sequelize.define('OrdenItem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        orden_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'ordenes',
                key: 'id'
            }
        },
        producto_id: {
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
            allowNull: false
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        product_name: {
            type: DataTypes.STRING(255),
            allowNull: false // Guardamos el nombre del producto al momento de la compra
        },
        product_image: {
            type: DataTypes.STRING(255),
            allowNull: true // Guardamos la imagen del producto al momento de la compra
        }
    }, {
        tableName: 'orden_items',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    OrdenItem.associate = function(models) {
        // Relación con Orden
        OrdenItem.belongsTo(models.Orden, {
            foreignKey: 'orden_id',
            as: 'orden'
        });

        // Relación con Producto
        OrdenItem.belongsTo(models.Producto, {
            foreignKey: 'producto_id',
            as: 'producto'
        });
    };

    return OrdenItem;
};
