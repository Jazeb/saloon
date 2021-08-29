const _ = require('lodash');
const { Op } = require('sequelize');
const sequelize = require('../../config/db.connection');

const { encryptPassword } = require('../../utils/shared');
const { User, Customers, Vendors, Service, ServiceOrders } = require('../../models/index');

module.exports = {
    vendorSignup,
    customerSignup,
    updateUser,
    validateUser,
    resetPassword,
    updateFirebaseKey,
    getUserService,
    saveService,
    updateService,
    getVenderByServiceId
}

function vendorSignup(user) {
    return new Promise((resolve, reject) => {
        Vendors.create(user)
            .then(new_user => resolve(new_user))
            .catch(err => reject(err));
    });
}

function customerSignup(user) {
    return new Promise((resolve, reject) => {
        Customers.create(user)
            .then(new_user => resolve(new_user))
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


function getUserService(service_id) {
    return new Promise((resolve, reject) => {
        User.findAll({ where: { service_id } }).then(users => resolve(users))
            .catch(err => reject(err));
    });
}

function getVenderByServiceId(service_id) {
    return new Promise((resolve, reject) => {
        const include = [{ model: Service }]
        Vendors.findAll({ where: { service_id }, include }).then(users => resolve(users))
            .catch(err => reject(err));
    });
}


// save the service data
function saveService(body) {
    return new Promise((resolve, reject) => {
        ServiceOrders.create(body)
            .then(data => {
                console.log(data);
                return resolve(data);
            })
            .catch(err => reject(err));
    });
}

function updateService(data) {
    return new Promise((resolve, reject) => {
        const id = data.id;
        delete data.id;

        ServiceOrders.update(data, { where: { id } })
            .then(_ => resolve(true))
            .catch(err => reject(err));
    });
}