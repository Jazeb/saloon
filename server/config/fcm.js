const FCM = require('fcm-node');
const { CONFIG } = require('./keys');

module.exports = new FCM(CONFIG.fcm_key);