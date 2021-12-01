const FCM = require('fcm-node');

const { FCM_KEY } = process.env;

module.exports = new FCM(FCM_KEY);