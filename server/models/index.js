const Sequelize = require("sequelize");

const sequelize = require('../config/db.connection');
const db = { Sequelize, sequelize };

Vendors = require('./vendors')(sequelize, Sequelize);
Service = require('./services')(sequelize, Sequelize);
Customers = require('./customers.js')(sequelize, Sequelize);
SubService = require('./sub_services')(sequelize, Sequelize);
ServiceOrders = require('./services_orders')(sequelize, Sequelize);

Service.hasMany(SubService, {
    foreignKey: 'service_id',
    targetKey:'id'
});

Vendors.belongsTo(Service, {
    foreignKey: 'service_id',
    targetKey:'id'
});

Customers.hasMany(ServiceOrders, {
    foreignKey: 'customer_id',
    targetKey:'id'
});

Vendors.hasMany(ServiceOrders, {
    foreignKey: 'vendor_id',
    targetKey:'id'
});

module.exports = { db, Customers, Vendors, Service, SubService, ServiceOrders };
