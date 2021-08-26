module.exports = function (sequelize, DataTypes) {
    return sequelize.define('orders', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        service_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        // user_type: {
        //     type: DataTypes.ENUM(['VENDOR', 'CUSTOMER']),
        //     allowNull: false
        // },
        order_place_at: {
            type: DataTypes.DATETIME(),
            allowNull: false
        },
        order_end_at: {
            type: DataTypes.DATETIME(),
            allowNull: false
        },
        order_location: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM(['PENDING', 'ONGOING', 'COMPLETED']),
            allowNull: false
        },
    }, {
        sequelize,
        tableName: 'orders',
        timestamps: false
    });
}