module.exports = function(sequelize, DataTypes) {
    let alias = 'Usuario';
    let cols = {
        id:{
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        nombre:{
            type: DataTypes.STRING
        },
        apellido:{
            type: DataTypes.STRING
        },
        email:{
            type: DataTypes.STRING
        },
        password:{
            type: DataTypes.STRING
        },
        telefono:{
            type: DataTypes.STRING
        },
        fecha_nacimiento:{
            type: DataTypes.DATE
        },
        avatar:{
            type: DataTypes.STRING
        },
        rol:{
            type: DataTypes.ENUM('cliente', 'admin'),
            defaultValue: 'cliente'
        },
        activo:{
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_at:{
            type: DataTypes.DATE
        },
        updated_at:{
            type: DataTypes.DATE
        } 
    }
    let config = {
        tableName: 'usuarios',
        timestamps: false,
        paranoid: false,
        updatedAt: "updated_at",
        createdAt: "created_at"
    }
    let Usuario = sequelize.define(alias,cols,config)

    return Usuario
}