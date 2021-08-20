require("dotenv").config();

const MYSQL = {
    logs: process.env.MYSQL_LOGS === 'true' ? true : false,
    live: process.env.MYSQL_LIVE, // URL
    local: process.env.MYSQL_LOCAL, // URL
    database: process.env.DATABASE,
    user_local: process.env.MYSQL_USER_LOCAL,
    user_live: process.env.MYSQL_USER_LIVE,
    password_live: process.env.MYSQL_PASSWORD_LIVE,
    password_local: process.env.MYSQL_PASSWORD_LOCAL
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

const CALLS = {
    FIRST_1: +process.env.FIRST_1,
    FIRST_2: +process.env.FIRST_2,

    SECOND_1: +process.env.SECOND_1,
    SECOND_2: +process.env.SECOND_2,

    FINAL_1: +process.env.FINAL_1,
    FINAL_2: +process.env.FINAL_2,

    ZERO_1: +process.env.ZERO_1,
    ZERO_2: +process.env.ZERO_2,
}

module.exports = { MYSQL, CONFIG, EMAIL, CALLS }