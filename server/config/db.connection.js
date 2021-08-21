const Sequelize = require('sequelize');
const { MYSQL, CONFIG } = require('./keys');

const mysql_pwd = CONFIG.env == 'DEVELOPMENT' ? MYSQL.password_local : MYSQL.password_live;
const mysql_host = CONFIG.env == 'DEVELOPMENT' ? MYSQL.local : MYSQL.live;
const mysql_user = CONFIG.env == 'DEVELOPMENT' ? MYSQL.user_local : MYSQL.user_live;

const sequelize = new Sequelize(MYSQL.database, mysql_user, mysql_pwd, {
    host: mysql_host,
    dialect: 'mysql',
    operatorsAliases: 0,
    logging: MYSQL.logs,
    dialectOptions: {
        multipleStatements: true
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});


sequelize.authenticate()
    .then(() => console.log(`DB ${MYSQL.database} connected on: ${mysql_host}, user:${mysql_user}`))
    .catch(err => console.error('Unable to connect to the database:', err))


CONFIG.sync && sequelize.sync({ force:true }).then(() => console.log(`Database & tables created!`));

module.exports = sequelize
