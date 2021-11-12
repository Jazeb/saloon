const Sequelize = require("sequelize");

const sequelize = require('../config/db.connection');
const db = { Sequelize, sequelize };

Vendors = require('./vendors')(sequelize, Sequelize);
Service = require('./services')(sequelize, Sequelize);
Customers = require('./customers.js')(sequelize, Sequelize);
SubService = require('./sub_services')(sequelize, Sequelize);
ServiceOrders = require('./services_orders')(sequelize, Sequelize);
VendorsReviews = require('./vendor_reviews')(sequelize, Sequelize);
CustomersReviews = require('./customer_reviews')(sequelize, Sequelize);
Notifications = require('./notifications')(sequelize, Sequelize);
Admin = require('./admin')(sequelize, Sequelize);

Service.hasMany(SubService, {
    foreignKey: 'service_id',
    targetKey:'id'
});

ServiceOrders.belongsTo(Service, {
    foreignKey: 'service_id',
    targetKey:'id'
});

ServiceOrders.belongsTo(Customers, {
    foreignKey: 'service_id',
    targetKey:'id'
});

ServiceOrders.belongsTo(Vendors, {
    foreignKey: 'service_id',
    targetKey:'id'
});

// Customers relationships
Customers.hasMany(CustomersReviews, {
    foreignKey: 'customer_id',
    targetKey:'id'
});

Customers.hasMany(ServiceOrders, {
    foreignKey: 'customer_id',
    targetKey:'id'
});

// ServiceOrders.hasOne(CustomersReviews, {
//     foreignKey: 'customer_id',
//     targetKey:'id'
// })

// Vendors relationships
Vendors.hasMany(ServiceOrders, {
    foreignKey: 'vendor_id',
    targetKey:'id'
});

Vendors.hasMany(VendorsReviews, {
    foreignKey: 'vendor_id',
    targetKey:'id'
});

Vendors.belongsTo(Service, {
    foreignKey: 'service_id',
    targetKey:'id'
});

// Service.belongsTo(Service, {
//     as: 'parentServices', 
//     foreignKey: 'parent_id'
// });

module.exports = { db, Admin, SubService,Customers, Vendors, Service, ServiceOrders, CustomersReviews, VendorsReviews, Notifications };
