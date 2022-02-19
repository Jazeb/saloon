
const fcm = require('./server/config/fcm');

const sendNotification = data => {
    return new Promise(async(resolve, reject) => {
        const message = {
            registration_ids: [data.reg_id],
            collapse_key: 'FROM_ADMIN',
            notification: {
                title: data.title,
                body: data.body
            },
            // data: data.msg,
            priority:'high'
        }
        fcm.send(message, (err, response) => {
            console.log(err || response)
            if (err) return console.error(err);
            return resolve(true);
        });
    });
}

module.exports = { sendNotification };