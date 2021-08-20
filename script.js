/**
 * Run this script to deploy the base db 
 */

const fs = require('fs');
const path = require('path');

const sequelize = require('./server/config/db.connection');

const query = fs.readFileSync(path.join(__dirname, './server/db/basedb.sql')).toString();
query && sequelize.query(query).then(_ => process.exit(0)).catch(err => console.error(err) && process.exit(1));