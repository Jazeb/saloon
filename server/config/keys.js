require("dotenv").config();
const MYSQL = {
    logs: process.env.MYSQL_LOGS === 'true' ? true : false,
    live: process.env.MYSQL_LIVE, // URL
    local: process.env.MYSQL_LOCAL_HOST, // URL
    database: process.env.MYSQL_DB,
    user_local: process.env.MYSQL_LOCAL_USER,
    user_live: process.env.MYSQL_LIVE_USER,
    password_live: process.env.MYSQL_LIVE_PASSWORD,
    password_local: process.env.MYSQL_LOCAL_PASSWORD
};

const CONFIG = {
    auth: process.env.AUTH === 'true' ? true : false,
    validate: process.env.VALIDATE === 'true' ? true : false,
    env: process.env.ENV,
    sync: process.env.SYNC === 'true' ? true : false,
    port: process.env.SERVER_PORT,
    jwtSecret: process.env.JWT_SECRET,
    schedules_server_port: process.env.SCHEDULES_SERVER_PORT,
    fcm_key: process.env.FCM_KEY,
    key_id: process.env.KEY_ID,
    service_id: process.env.SERVICE_ID,
    team_id: process.env.TEAM_ID,
    base_url: process.env.BASE_URL
};

const EMAIL = {
    mailerEmail: process.env.MAILER_EMAIL,
    mailerEmailPassword: process.env.MAILER_EMAIL_PASSWORD
};

module.exports = { MYSQL, CONFIG, EMAIL }