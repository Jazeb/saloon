module.exports = function (sequelize, DataTypes) {
    return sequelize.define('services_orders', {
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
        sub_service_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        lat: {
            type: DataTypes.STRING(11),
            allowNull: true
        },
        lon: {
            type: DataTypes.STRING(11),
            allowNull: true
        },
        accepted_by: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM(['PENDING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
            allowNull: false,
            defaultValue: 'PENDING'
        },
        state: {
            type: DataTypes.ENUM(['PENDING', 'ACCEPTED', 'REJECTED']),
            allowNull: false,
            defaultValue: 'PENDING'
        },
        started_at:{
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
        completed_at:{
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
    }, {
        sequelize,
        tableName: 'services_orders',
        timestamps: false
    });
}