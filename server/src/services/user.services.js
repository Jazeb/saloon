const _ = require('lodash');

const { encryptPassword } = require('../../utils/shared');
const {
    Admin,
    User,
    Customers,
    Vendors,
    Service,
    SubService,
    ServiceOrders,
    VendorsReviews,
    CustomersReviews,
    Notifications
} = require('../../models/index');


module.exports = {
    updateLogout,
    getCustomers,
    getUsers,
    updateCustomers,
    getVendors,
    updateVendors,
    getOrders,
    getServices,
    addService,
    updateOrders,
    vendorSignup,
    customerSignup,
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
    addVendorNotification,
    updateLocation,
    getOrdersByCustomer,
    getNotifications,
    getOrdersByVendor,
    updateFCM
}

function updateLogout(id, model) {
    return new Promise((resolve, reject) => {

        let Model = null;

        if (model == 'VENDOR') Model = Vendors;
        else Model = Customers;

        if (!Model) return console.error('model not defined');
        Model.update({ fcm_key: null, is_login: false }, { where: { id } })
            .then(_ => resolve(true))
            .catch(err => reject(err));

    })
}

function vendorSignup(user) {
    return new Promise((resolve, reject) => {
        Vendors.create(user, { include: [Service] })
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

function resetPassword(id, password, table_name) {
    password = encryptPassword(password);
    let Model = table_name == 'VENDOR' ? Vendors : Customers;
    return new Promise((resolve, reject) => {
        Model.update({ password }, { where: { id } }).then(_ => resolve(true)).catch(err => reject(err));
    });
}

// const getUser = id => User.findOne({ where: { id }, attributes: { exclude: ['password', 'created_at', 'updated_at'] } });

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

function getVenderByServiceId(data) {

    return new Promise(async (resolve, reject) => {
        const vendors = [];

        const include = [{ model: Service, include: [{ model: SubService }] }];
        const users = await Vendors.findAll({ where: { service_id: data.service_id }, include });

        for (let user of users) {
            let dist = findDistance(user.lat, user.lon, data.lat, data.lon);
            if (dist <= 60) vendors.push(user);
            console.log({ dist });
        }
        return resolve(vendors);
    });
}

function findDistance(lat1, lon1, lat2, lon2, unit) {
    console.log({ lat1, lon1, lat2, lon2 })
    let radlat1 = Math.PI * lat1 / 180;
    let radlat2 = Math.PI * lat2 / 180;
    let theta = lon1 - lon2;
    let radtheta = Math.PI * theta / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) dist = 1;
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") dist = dist * 1.609344;
    if (unit == "N") dist = dist * 0.8684;
    return dist;
}


// save the service data
function saveService(body) {
    return new Promise((resolve, reject) => {
        ServiceOrders.create(body)
            .then(data => resolve(data))
            .catch(err => reject(err));
    });
}

// function updateOrders(data) {
//     console.log({data})
//     return new Promise((resolve, reject) => {
//         const id = data.id;
//         delete data.id;
//         ServiceOrders.update(data, { where: { id } })
//             .then(_ => resolve(true))
//             .catch(err => reject(err));
//     });
// }

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
        Notifications.create({ user_id: data.user_id, message:data.message, user_type: 'VENDOR' })
            .then(_ => resolve(true))
            .catch(err => reject(err));
    });
}

function addCustomerNotification(data) {
    return new Promise((resolve, reject) => {
        Notifications.create({ message:data.message, user_id:data.user_id, user_type: 'CUSTOMER' })
            .then(_ => resolve(true))
            .catch(err => reject(err));
    });
}

function getUsers() {
    return new Promise((resolve, reject) => {
        Admin.findAll()
            .then(users => resolve(users))
            .catch(err => reject(err));
    })
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
        Customers.update(data, { where: { id } })
            .then(_ => Customers.findOne({ where: { id }, attributes: { exclude: ['password', 'created_at', 'updated_at'] } }).then(customer => resolve(customer)))
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
        Vendors.update(data, { where: { id }, attributes: { exclude: ['password', 'created_at', 'updated_at'] } })
            .then(_ => Vendors.findOne({ where: { id } }).then(vendor => resolve(vendor)))
            .catch(err => reject(err));
    });
}

// ORDERS CRUD
function getOrders() {
    return new Promise((resolve, reject) => {
        ServiceOrders.findAll()
            .then(orders => resolve(orders))
            .catch(err => reject(err));
    });
}

function updateOrders(data) {
    return new Promise((resolve, reject) => {
        ServiceOrders.update(data, { where: { id: data.order_id } })
            .then(orders => resolve(orders))
            .catch(err => reject(err));
    });
}


// Services CRUD
function getServices() {
    return new Promise((resolve, reject) => {
        const include = ["parentServices", "subservices"]
        Service.findAll({ include })
            .then(services => resolve(services))
            .catch(err => reject(err));
    });
}

function updateService(data) {
    return new Promise((resolve, reject) => {
        let id = data.id;
        delete data.id;
        Service.update(data, { where: { id } })
            .then(services => resolve(services))
            .catch(err => reject(err));
    });
}

function addService(data) {
    return new Promise((resolve, reject) => {
        Service.create(data, { include: [SubService] })
            .then(services => resolve(services))
            .catch(err => reject(err));
    });
}

function updateLocation(data) {
    return new Promise((resolve, reject) => {
        Vendors.update({ lat: data.lat, lon: data.lon }, { where: { id: data.user_id } })
            .then(_ => resolve(true))
            .catch(err => reject(err));
    });
}

function getOrdersByCustomer(user_id) {
    return new Promise((resolve, reject) => {
        const include = [{ model: Service, include: [{ model: SubService }] }];

        ServiceOrders.findAll({ where: { status: 'COMPLETED', customer_id: user_id }, include })
            .then(async result => {
                const bookings = [];
                for(let booking of result) {
                    booking = booking.toJSON();
                    booking.vendor = await Vendors.findOne({ where:{ id: booking.vendor_id }, raw:true });
                    bookings.push(booking);
                }
                return resolve(bookings);
            })
            .catch(err => reject(err));
    });
}

function getOrdersByVendor(user_id) {
    return new Promise((resolve, reject) => {
        const include = [{ model: Service }, { model: Customers }];

        ServiceOrders.findAll({ where: { accepted_by:user_id }, include })
            .then(orders => resolve(orders))
            .catch(err => reject(err));
    });
}


function getNotifications(user_id, user_type) {
    return new Promise((resolve, reject) => {
        Notifications.findAll({ where: { user_id, user_type } })
            .then(notifications => resolve(notifications))
            .catch(err => reject(err));
    })
}

function updateFCM(user_type, fcm_token, id) {
    return new Promise((resolve, reject) => {
        const model = user_type == 'VENDOR' ? Vendors : Customers;
        model.update({ fcm_token }, { where: { id }}).then(_ => resolve(true)).catch(err => reject(err));
    });
}