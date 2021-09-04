module.exports = function (sequelize, DataTypes) {
    return sequelize.define('notifications', {
        message: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        user_type: {
            type: DataTypes.ENUM(['VENDOR', 'CUSTOMER']),
            allowNull: false
        },
        // skip:{
        //     type: DataTypes.BOOLEAN(),
        //     default: false
        // }
    }, {
        sequelize,
        tableName: 'notifications',
        timestamps: true
    });
}