module.exports = function (sequelize, DataTypes) {
    return sequelize.define('vendor_reviews', {
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
        tableName: 'vendor_reviews',
        timestamps: false
    });
}