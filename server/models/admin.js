module.exports = function (sequelize, DataTypes) {
    return sequelize.define('admin', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        first_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        last_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'admin',
        timestamps: false
    });
}