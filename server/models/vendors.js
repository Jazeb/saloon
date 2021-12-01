module.exports = function (sequelize, DataTypes) {
    return sequelize.define('vendors', {
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
            allowNull: true
        },
        phone_no: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        lat: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        lon: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        fcm_token: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    }, {
        sequelize,
        tableName: 'vendors',
        timestamps: false
    });
}