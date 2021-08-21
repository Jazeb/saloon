const Sequelize = require("sequelize");

const sequelize = require('../config/db.connection');
const db = { Sequelize, sequelize };

Customers = require('./customers.js')(sequelize, Sequelize);
Vendors = require('./vendors')(sequelize, Sequelize);
Service = require('./services')(sequelize, Sequelize);
SubService = require('./sub_services')(sequelize, Sequelize);

Service.hasMany(SubService, {
    foreignKey: 'service_id',
    targetKey:'id'
});

Vendors.belongsTo(Service, {
    foreignKey: 'service_id',
    targetKey:'id'
});

module.exports = { db, Customers, Vendors, Service, SubService };
