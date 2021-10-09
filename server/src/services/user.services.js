const _ = require('lodash');

const { encryptPassword } = require('../../utils/shared');
const { User, Customers, Vendors, Service, SubService, ServiceOrders, VendorsReviews, CustomersReviews, Notifications, Orders } = require('../../models/index');


module.exports = {
    getCustomers,
    updateCustomers,
    getVendors,
    updateVendors,
    getOrders,
    getServices,
    updateService,
    addService,
    updateOrders,
    vendorSignup,
    customerSignup,
    updateUser,
    validateUser,
    resetPassword,
    updateFirebaseKey,
    getUserService,
    saveService,
    updateService,
    getVenderByServiceId,
    addVendorReview,
    addCustomerReview,
    addCustomerNotification,
    addVendorNotification
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

function addVendorReview(data) {
    return new Promise((resolve, reject) => {
        VendorsReviews.create(data)
            .then(_ => resolve(true))
            .catch(err => reject(err));
    });
}

function addCustomerReview(data) {
    return new Promise((resolve, reject) => {
        CustomersReviews.create(data)
            .then(_ => resolve(true))
            .catch(err => reject(err));
    });
}

function addVendorNotification(data) {
    return new Promise((resolve, reject) => {
        const message = 'You order has been completed';
        Notifications.create({ message, user_type:'VENDOR' })
            .then(_ => resolve(true))
            .catch(err => reject(err));
    });
}

function addCustomerNotification(data) {
    return new Promise((resolve, reject) => {
        const message = 'You job has been completed';
        Notifications.create({ message, user_type:'CUSTOMER' })
            .then(_ => resolve(true))
            .catch(err => reject(err));
    });
}



// CUSTOMERS CRUD
function getCustomers() {
    return new Promise((resolve, reject) => {
        Customers.findAll()
            .then(customers => resolve(customers))
            .catch(err => reject(err));
    })
}

function updateCustomers(data) {
    return new Promise((resolve, reject) => {
        let id = data.id;
        delete data.id;
        Customers.update(data, { where:{ id }})
            .then(customers => resolve(customers))
            .catch(err => reject(err));
    });
}

// VENDORS CRUD
function getVendors() {
    return new Promise((resolve, reject) => {
        Vendors.findAll()
            .then(vendors => resolve(vendors))
            .catch(err => reject(err));
    })
}

function updateVendors(data) {
    return new Promise((resolve, reject) => {
        let id = data.id;
        delete data.id;
        Vendors.update(data, { where:{ id }})
            .then(vendors => resolve(vendors))
            .catch(err => reject(err));
    });
}

// ORDERS CRUD
function getOrders() {
    return new Promise((resolve, reject) => {
        Orders.findAll()
            .then(orders => resolve(orders))
            .catch(err => reject(err));
    });
}

function updateOrders(data) {
    return new Promise((resolve, reject) => {
        let id = data.id;
        delete data.id;
        Orders.update(data, { where:{ id }})
            .then(orders => resolve(orders))
            .catch(err => reject(err));
    });
}


// Services CRUD
function getServices() {
    return new Promise((resolve, reject) => {
        const include = [ { model: SubService } ]
        Service.findAll({ include })
            .then(services => resolve(services))
            .catch(err => reject(err));
    });
}

function updateService(data) {
    return new Promise((resolve, reject) => {
        let id = data.id;
        delete data.id;
        Service.update(data, { where:{ id }})
            .then(services => resolve(services))
            .catch(err => reject(err));
    });
}

function addService(data) {
    return new Promise((resolve, reject) => {
        Service.create(data, { include: [ SubService ]})
            .then(services => resolve(services))
            .catch(err => reject(err));
    });
}

