const Sequelize = require('sequelize');
const { MYSQL, CONFIG } = require('./keys');

const mysql_pwd = process.env.MYSQL_LOCAL_PASSWORD;//CONFIG.env == 'DEVELOPMENT' ? MYSQL.password_local : MYSQL.password_live;
const mysql_host = 'localhost';//CONFIG.env == 'DEVELOPMENT' ? MYSQL.local : MYSQL.live;
const mysql_user = process.env.MYSQL_LOCAL_USER;//CONFIG.env == 'DEVELOPMENT' ? MYSQL.user_local : MYSQL.user_live;
const DATABASE = process.env.DATABASE;

const sequelize = new Sequelize(DATABASE, mysql_user, mysql_pwd, {
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
    .then(() => console.log(`DB ${DATABASE} connected on: ${mysql_host}, user:${mysql_user}`))
    .catch(err => console.error('Unable to connect to the database:', err));


CONFIG.sync && sequelize.sync({ force:true }).then(() => console.log(`Database & tables created!`));

module.exports = sequelize
