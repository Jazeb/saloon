module.exports = function (sequelize, DataTypes) {
    return sequelize.define('customer_reviews', {
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
        review_msg: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
    }, {
        sequelize,
        tableName: 'customer_reviews',
        timestamps: false
    });
}