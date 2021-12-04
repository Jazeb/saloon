module.exports = function (sequelize, DataTypes) {
    return sequelize.define('customers', {
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
        phone_no: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        // user_type: {
        //     type: DataTypes.ENUM(['VENDOR', 'CUSTOMER']),
        //     allowNull: false
        // },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        fcm_token: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        lat: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        lon: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
    }, {
        sequelize,
        tableName: 'customers',
        timestamps: false
    });
}