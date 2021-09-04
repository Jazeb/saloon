module.exports = function (sequelize, DataTypes) {
    return sequelize.define('customers_reviews', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        stars: {
            type: DataTypes.INTEGER(7),
            allowNull: false
        },
        order_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        review: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
    }, {
        sequelize,
        tableName: 'customers_reviews',
        timestamps: false
    });
}