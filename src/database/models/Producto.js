module.exports = function(sequelize, DataTypes) {
    let alias = 'Producto';
    let cols = {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'name'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'image'
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'category'
        },
        subcategory: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'subcategory'
        },
        brand: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'brand'
        },
        color: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'color'
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'price'
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'stock'
        },
        borrado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'borrado'
        },
        destacado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'destacado'
        },
        peso: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'peso'
        },
        edad: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'edad'
        },
        created_at: {
            type: DataTypes.DATE,
            field: 'created_at'
        },
        updated_at: {
            type: DataTypes.DATE,
            field: 'updated_at'
        },
        deleted_at: {
            type: DataTypes.DATE,
            field: 'deleted_at'
        }
    };

    let config = {
        tableName: 'productos',
        timestamps: true,
        paranoid: true,
        deletedAt: "deleted_at",
        updatedAt: "updated_at",
        createdAt: "created_at",
        underscored: true
    };

    let Producto = sequelize.define(alias, cols, config);

    Producto.associate = function(models) {
        // Asociaciones futuras
        // Producto.belongsTo(models.Categoria, {
        //     foreignKey: 'category_id',
        //     as: 'categoria'
        // });
        
        // Producto.belongsToMany(models.Factura, {
        //     through: 'Factura_Producto',
        //     foreignKey: 'producto_id',
        //     as: 'facturas'
        // });
    };

    return Producto;
};