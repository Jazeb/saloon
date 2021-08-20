const { Notifications } = require('../models/index');

module.exports = {
    addNotification: data => {
        return new Promise((resolve, reject) => {
            Notifications.create(data).then(_ => resolve(true)).catch(err => reject(err));
        });
    }
}