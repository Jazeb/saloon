module.exports = function (sequelize, DataTypes) {
    return sequelize.define('sub_services', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        sub_service_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    }, {
        sequelize,
        tableName: 'sub_services',
        timestamps: false
    });
}