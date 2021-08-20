const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('users', {
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
        gender: {
            type: DataTypes.ENUM({
                values: ['Male', 'Female']
            }),
            allowNull: true
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        firebase_key: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        latitude: {
            type: DataTypes.FLOAT(11),
            allowNull: true
        },
        longitude: {
            type: DataTypes.FLOAT(11),
            allowNull: true
        },
        phone_number: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        social_image_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        dob: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        is_verified: {
            type: DataTypes.BOOLEAN(),
            allowNull: false,
            defaultValue: false
        },
        is_admin: {
            type: DataTypes.BOOLEAN(),
            allowNull: false,
            defaultValue: false
        },
        is_archived: {
            type: DataTypes.BOOLEAN(),
            allowNull: false,
            defaultValue: false
        },
        token: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        city: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        country: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        postal_code: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        about_me: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        provider_key: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        provider_type: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        is_social_login: {
            type: DataTypes.BOOLEAN(),
            allowNull: false,
            defaultValue: false
        },
        status: {
            type: DataTypes.BOOLEAN(),
            allowNull: false,
            defaultValue: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()')
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()')
        }
    }, {
        sequelize,
        tableName: 'users',
        timestamps: false
    });
}