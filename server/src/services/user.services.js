const _ = require('lodash');
const { Op } = require('sequelize');
const sequelize = require('../../config/db.connection');

const { encryptPassword } = require('../../utils/shared');
const { User } = require('../../models/index');

module.exports = {
    signup,
    updateUser,
    validateUser,
    resetPassword,
    updateFirebaseKey,
}

function signup(user) {
    return new Promise(async (resolve, reject) => {
        User.create(user)
            .then(new_user => {
                addCoinsWallet(new_user.id).then(() => console.log('Wallet created for the user'))
                return resolve(new_user);
            })
            .catch(err => reject(err));
    });
}

function validateUser(email) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ where: { email } });
            _.isEmpty(user) ? resolve(true) : resolve(false)
        } catch (err) {
            console.error(err);
            return reject(err)
        }
    });
}

function resetPassword(email, password) {
    password = encryptPassword(password);
    return new Promise((resolve, reject) => {
        User.update({ password }, { where: { email } }).then(() => resolve(true)).catch(err => reject(err));
    });
}

const getUser = id => User.findOne({ where: { id }, attributes: { exclude: ['password', 'created_at', 'updated_at'] } });

function updateUser(data) {
    user_id = data.id
    delete data.password
    delete data.updated_at
    delete data.created_at
    delete data.is_verified
    delete data.is_social_login
    delete data.provider_key
    delete data.provider_type
    delete data.id

    return new Promise((resolve, reject) => {
        User.update(data, { where: { id: user_id } })
            .then(() => resolve(getUser(user_id)))
            .catch(err => reject(err));
    });
}

function updateFirebaseKey(firebase_key, user_id) {
    return new Promise((resolve, reject) => {
        User.update({ firebase_key }, { where: { id: user_id } })
            .then((result) => result[0] ? resolve(true) : resolve(false))
            .catch(err => reject(err));
    });
}
