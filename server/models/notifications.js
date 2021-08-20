module.exports = function (sequelize, DataTypes) {
    return sequelize.define('notifications', {
        message: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        skip:{
            type: DataTypes.BOOLEAN(),
            default: false
        }
    }, {
        sequelize,
        tableName: 'notifications',
        timestamps: true
    });
}