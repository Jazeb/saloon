const Sequelize = require("sequelize");
const sequelize = require('../config/db.connection');
const db = { Sequelize, sequelize };

User = require('./users.js')(sequelize, Sequelize);
module.exports = { db, User }
