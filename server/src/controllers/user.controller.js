const _ = require('lodash');
const fs = require('fs');
const validator = require("email-validator");

const { encryptPassword, generateToken, isValidPassword } = require('../../utils/shared');
const userService = require('../services/user.services');
const mailer = require("../../config/mailer");
const resp = require('../../config/api.response');
const view = require('../../utils/views');

module.exports = {
    login,
    get,
    userSignup,
    getVendersByServiceId,
    updateUser,
    changePassword,
    forgotPassword,
    placeService,
    startService,
    endService,
    acceptServiceOrder,
    submitReview,
    updateLocation,
    getCustomerBookings
}

async function acceptServiceOrder(req, res) {
    try {
        const { order_id, status } = req.body;
        if (!order_id || !status) return resp.error(res, 'Provide required fields');

        if (!['ACCEPT', 'REJECT'].includes(status))
            return resp.error(res, 'Invalid status provided');

        const order = await view.find('ORDER', 'id', order_id);
        if (_.isEmpty(order) || order.state !== 'PENDING' || order.status !== 'PENDING')
            return resp.error(res, 'Invalid order id provided');

        if (status == 'ACCEPT') {
            const data = {
                id: order_id,
                state: 'ACCEPTED',
                accepted_by: req.user.id,
                vendor_id: req.user.id
            }
            userService.updateOrders(data)
                .then(s => resp.success(res, 'Order is accepted'))
                .catch(err => resp.error(res, 'Something went wrong', err));
        }

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Something went wrong', error);
    }
}

async function startService(req, res) {
    try {
        const { order_id } = req.body;
        if (!order_id) return resp.error(res, 'Provide required fields');

        const order = await view.find('ORDER', 'id', order_id);
        if (_.isEmpty(order) || order.state !== 'ACCEPTED' || order.status !== 'PENDING')
            return resp.error(res, 'Invalid order id provided');

        if (order.accepted_by !== req.user.id)
            return resp.error(res, 'This order is accepted by another vendor');

        const data = {
            id: order_id,
            status: 'ONGOING',
            started_at: Date.now()
        }
        userService.updateService(data)
            .then(_ => resp.success(res, 'Order is started'))
            .catch(err => resp.error(res, 'Something went wrong', err));

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Something went wrong', error);
    }
}

async function endService(req, res) {
    // Complete the current order
    try {
        const { order_id } = req.body;
        if (!order_id)
            return resp.error(res, 'Provide required fields');

        const order = await view.find('ORDER', 'id', order_id);
        if (_.isEmpty(order) || order.state !== 'ACCEPTED' || order.status !== 'ONGOING')
            return resp.error(res, 'Invalid order id provided');

        const data = {
            id: order_id,
            status: 'COMPLETED',
            completed_at: Date.now()
        }
        userService.updateService(data)
            .then(_ => resp.success(res, 'Order is completed'))
            .catch(err => resp.error(res, 'Something went wrong', err));
        
        await userService.addVendorNotification();

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Something went wrong', error);
    }
}

async function placeService(req, res) {
    try {
        const pubsub = require('../../graphql/pubsub');
        const { lat, long, service_id } = req.body;
        if (!lat || !long || !service_id)
            return resp.error(res, 'Provide required fields');

        const order_data = { lat, long, service_id };

        order_data['customer_id'] = req.user.id;

        const service_data = await userService.saveService(order_data);


        pubsub.publish('NEW_JOB_ALERT', {
            NEW_JOB_ALERT: { service_id, lat, long, order_id: service_data.id }
        });
        return resp.success(res, order_data, 'Service posted');

    } catch (error) {
        console.log(error);
        return resp.error(res, 'Error placing service order');
    }
}

async function getVendersByServiceId(req, res) {
    try {
        const service_id = req.params.service_id;
        if (!service_id)
            return resp.error(res, 'Provide service id');

        const users = await userService.getVenderByServiceId(service_id);
        return resp.success(res, users);
    } catch (error) {
        console.log(error);
        return resp.error(res, 'Error getting vendors', error);
    }
}

async function userSignup(req, res) {
    const { first_name, last_name, email, password, service_id, phone_no } = req.body;
    if (_.isEmpty(first_name) || _.isEmpty(last_name) || !phone_no || _.isEmpty(email) || _.isEmpty(password))
        return resp.error(res, 'Provide required fields');

    if (!validator.validate(email)) return resp.error(res, 'Provide a valid email');

    try {

        const model = req.url == '/vendor/signup' ? 'VENDOR' : 'CUSTOMER';
        let validate_user = await view.find(model, 'email', email);
        if (!_.isEmpty(validate_user))
            return resp.error(res, 'User already exists with this email');

        const user = req.body;
        if (req.files && req.files.profile_image) {
            let image = req.files.profile_image;
            let fileName = image.name.replace(' ', '_').split('.').reverse()[0];
            fileName = '/image_' + Date.now() + '.' + fileName;

            let dest_url = process.cwd() + '/server/assets/profile_images' + fileName;
            image.mv(dest_url);
            user.image_url = fileName;
        }

        user.service_id = service_id;
        user.password = encryptPassword(user.password);

        let new_user = model == 'VENDOR' ? await userService.vendorSignup(user) : await userService.customerSignup(user);
        new_user = new_user.toJSON();
        new_user.user_type = model;

        delete new_user.password;
        delete new_user.created_at;
        delete new_user.updated_at;

        const token = generateToken(new_user);
        new_user.token = token;
        new_user && resp.success(res, new_user);
        return
    } catch (err) {
        console.error(err);
        return resp.error(res, 'Error adding user', err);
    }
}

async function get(req, res) {

    try {
        let user = await view.find({ table_name: 'USERS', key: 'id', value: req.user.id });
        if (_.isEmpty(user))
            return resp.error(res, 'Invalid user id');

        user = user.toJSON();
        const coins = await view.find({ table_name: 'UserCoins', key: 'user_id', value: req.user.id });
        delete user.password
        user.coins = coins || {}
        user && resp.success(res, user);
        return
    } catch (err) {
        console.error(err);
        return resp.error(res, 'Error getting user', err);
    }
}


async function updateUser(req, res) {
    try {
        let should_return = false;
        let params = req.body;
        params.id = req.user.id;

        if (req.files && req.files.profile_image) {
            const image = req.files.profile_image;
            const allowedExts = ['png', 'jpg', 'JPG', 'jpeg', 'gif', 'mp4', 'webm', 'mpeg', 'webp'];
            const ext = image.name.replace(' ', '_').split('.').reverse()[0];
            if (!allowedExts.includes(ext)) {
                should_return = true;
                return resp.error(res, 'Invalid file extension');
            }
            let fileName = '/image_' + Date.now() + '.' + ext;
            let dest_url = process.cwd() + '/server/assets/profile_images' + fileName;
            image.mv(dest_url);

            req.user.image_url && fs.unlink(process.cwd() + '/server/assets/profile_images' + req.user.image_url, (err, data) => err && console.error(err));
            req.body.image_url = fileName;
        }
        if (should_return) return

        let new_user = req.user.user_type == 'VENDOR' ? await userService.updateVendors(params) : await userService.updateCustomers(params);

        return resp.success(res, new_user);
        
    } catch (err) {
        console.error(err);
        return resp.error(res, 'Error updating user', err)
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!validator.validate(email))
            return resp.error(res, 'Provide a valid email');

        if (_.isEmpty(password))
            return resp.error(res, 'Provide required fields');

        const model = req.url == '/vendor/login' ? 'VENDOR' : 'CUSTOMER';
        let user = await view.find(model, 'email', email);
        if (_.isEmpty(user))
            return resp.error(res, 'Invalid user');

        user = user.toJSON();

        let isValid = await isValidPassword(password, user.password);
        if (!isValid)
            return resp.error(res, 'Invalid password');

        delete user.password;
        delete user.created_at;
        delete user.updated_at;

        user.user_type = model;
        let token = generateToken(user);
        user.token = token;
        return resp.success(res, user);
    } catch (err) {
        console.error(err)
        return resp.error(res, 'Something went wrong', err);
    }
}

/*async function resetPassword(req, res) {
    try {
        const { old_password, new_password } = req.body;
        if (_.isEmpty(new_password) || _.isEmpty(old_password))
            return resp.error(res, 'Provide required fields');

        const id = req.user.id
        const user = await view.findOne({ table_name: 'USERS', where: { id } });
        let isValid = await isValidPassword(old_password, user.password);

        if (!isValid)
            return resp.error(res, 'Invalid old password, please try again');

        const update_password = await userService.resetPassword(id, new_password);
        update_password && resp.success(res, 'Password updated successfully');
        return
    } catch (err) {
        console.error(err)
        return resp.error(res, 'Error updating password', err)
    }
}*/

async function changePassword(req, res) {

    try {
        const { old_password, new_password, confirm_password } = req.body;
        if (_.isEmpty(old_password) || _.isEmpty(new_password) || _.isEmpty(confirm_password))
            return resp.error(res, 'Provide required fields');

        const table_name = req.url == '/vendor/changePassword' ? 'VENDOR' : 'CUSTOMER';
        const curr_user = await getUser('id', req.user.id, table_name);
        if (!curr_user)
            return resp.error(res, 'Invalid id');

        let isValid = await isValidPassword(old_password, curr_user.password);
        if (!isValid)
            return resp.error(res, 'Invalid current password');

        if (new_password !== confirm_password)
            return resp.error(res, 'Password must match');

        userService.resetPassword(req.user.id, new_password, table_name).then(_ => resp.success(res, 'Password updated successfully'))
            .catch(err => {
                console.error(err);
                return resp.error(res, 'Error updating password', err);
            });

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Error updating password', error);
    }
}

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        if (_.isEmpty(email))
            return resp.error(res, 'Provide email');
    
        const table_name = req.url == '/vendor/forgotPassword' ? 'vendors' : 'customers';
        const curr_user = await getUser('email', email, table_name);
        if (!curr_user)
            return resp.error(res, 'Invalid email');
    
        mailer.sendForgotEmail(user).then(_ => resp.success(res, 'Email sent successfully')).catch(err => {
            console.error(err);
            return resp.error(res, 'Error sending email', err);
        });
        
    } catch (error) {
        console.error(error);
        return resp.error(res, 'Error sending email', error);
    }
}

function getUser(key, value, table_name) {
    return new Promise((resolve, reject) => {
        view.find(table_name, key, value).then(user => resolve(user))
            .catch(err => reject(err));
    });
}

function submitReview(req, res) {
    try {
        const { stars, review, order_id } = req.body;
        if (!stars || !review || !order_id)
            return resp.error(res, 'Provide required fields');

        const data = { stars, review, order_id };
        const { user_type } = req.user;

        // const order = await view.find('ORDER', 'id', id);

        data['order_id'] = order_id;
        // data['customer_id'] = order.customer_id;
        user_type == 'VENDOR' ? data['customer_id'] = req.user.id : data['vendor_id'] = req.user.id;


        if (user_type == 'VENDOR') {
            userService.addCustomerReview(data)
                .then(_ => resp.success(res, 'Reviews submitted successfully'))
                .catch(err => resp.error(res, 'Error submitting review', err));
        }
        else {
            userService.addVendorReview(data)
                .then(_ => resp.success(res, 'Reviews submitted successfully'))
                .catch(err => resp.error(res, 'Error submitting review', err));
        }

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Error addming review', error);
    }
}

const stringToBoolean = string => string === 'false' ? false : !!string;

function updateLocation(req, res) {
    const { lat, long } = req.body;
    if(!lat || !long) return resp.error(res, 'Provide lat and long');

    const user = req.user;
    const data = {
        lat, long,
        user_id: user.id,
    }
    userService.updateLocation(data)
        .then(sendsubscriptionEvent(data))
        .then(_ => resp.success(res, 'Location updated'))
        .catch(err => resp.error(res, 'Error updating location', err));
}

function sendsubscriptionEvent(data) {
    const pubsub = require('../../graphql/pubsub');
    
    pubsub.publish('LOCATION_UPDATE', {
        LOCATION_UPDATE: data
    });
}

function getCustomerBookings(req, res) {
    const user_id = req.user.id;
    userService.getOrdersByCustomer(user_id)
        .then(bookings => resp.success(res, bookings))
        .catch(err => resp.error(res, 'Error getting bookings', err));
}