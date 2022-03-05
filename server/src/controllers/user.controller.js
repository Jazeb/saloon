const _ = require('lodash');
const fs = require('fs');
const validator = require("email-validator");

const { encryptPassword, generateToken, isValidPassword } = require('../../utils/shared');
const userService = require('../services/user.services');
const mailer = require("../../config/mailer");
const resp = require('../../config/api.response');
const view = require('../../utils/views');
const fcm = require('../../../pushNotifications');

module.exports = {
    login,
    logout,
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
    getCustomerBookings,
    cancelService,
    getNotifications,
    getVendorBookings,
    arrivedOrderUpdate,
    updateFCM
}


function logout(req, res) {
    let { id } = req.user;
    let model = req.url == '/vendor/logout' ? 'VENDOR' : 'CUSTOMER';

    userService.updateLogout(id, model)
        .then(_ => resp.success(res, 'Logout success'))
        .catch(err => resp.error(res, 'Something went wrong', err));
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

        const sub_serivce = await view.find('SUB_SERVICE', 'service_id', order.service_id);

        let user_id = req.user.id;
        let customer = await view.find('CUSTOMER', 'id', order.customer_id);

        let data = {
            sub_serivce,
            order,
            order_id,
            state: `${status}ED`,
            // accepted_by: user_id,
            vendor_id: user_id,
            // order_status: 'ON_THE_WAY',
            // vendor_status: 'ON_THE_WAY',
            customer_id: order.customer_id,
            vendor: req.user,
            customer: customer
        }

        const notif_data = {
            user_id,
            message: `Your job has been ${status}ED`
        }

        if(status == 'REJECT') {
            data.rejected_by_id = user_id;
            data.order_status = 'REJECTED';
            data.rejected_by = req.user.user_type;
        }
        else if (status == 'ACCEPT') {

            data.order_status = 'ON_THE_WAY';
            data.accepted_by = user_id;
            
            notif_data.user_id = order.customer_id;
        }

        sendOrderSubscription(data);

        Promise.all([
            userService.addVendorNotification(notif_data),
            userService.addCustomerNotification(notif_data),
            userService.updateOrders(data)
        ])
        .then(_ => resp.success(res, data))
        .catch(err => resp.error(res, 'Something went wrong', err)); 
        return;
        
        data.customer = customer;

        let vendor_name = req.user.first_name + ' ' + req.user.last_name;
        let fcm_obj = {
            reg_id: customer.fcm_token,
            title: `Order is ${status}ED by the Vendor`,
            body: `You order is ${status}ED by the vendor ${vendor_name}`
        }
        return await fcm.sendNotification(fcm_obj);

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Something went wrong', error);
    }
}

async function arrivedOrderUpdate(req, res) {
    try {
        const { order_id } = req.body;
        if (!order_id) return resp.error(res, 'Provide order id');

        const user_id = req.user.id;

        const order = await view.find('ORDER', 'id', order_id);
        if (_.isEmpty(order) || order.state !== 'ACCEPTED' || order.status !== 'PENDING' || order.accepted_by !== user_id)
            return resp.error(res, 'Invalid order id provided');

        resp.success(res, 'vendor arrived event sent');

        let data = {
            order_id,
            vendor: req.user,
            state: order.state,
            accepted_by: user_id,
            vendor_id: user_id,
            // vendor_status: 'ARRIVED',
            order_status: 'ARRIVED',
            customer_id: order.customer_id
        }

        sendOrderSubscription(data);

        let notif_data = {
            user_id,
            message: 'Your vendor has arrived'
        }
        await userService.addVendorNotification(notif_data);

        notif_data.user_id = user_id;
        await userService.addCustomerNotification(notif_data);

        let customer = await view.find('CUSTOMER', 'id', order.customer_id);

        let vendor_name = req.user.first_name + ' ' + req.user.last_name;
        let fcm_obj = {
            reg_id: customer.fcm_token,
            title: `Vendor has arrived`,
            body: `Your vendor ${vendor_name} arrived at your destination`
        }

        return await fcm.sendNotification(fcm_obj);

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Something went wrong', error);
    }
}

async function startService(req, res) {
    try {
        const { order_id } = req.body;
        const user_id = req.user.id;
        if (!order_id) return resp.error(res, 'Provide required fields');
        
        const order = await view.find('ORDER', 'id', order_id);
        if (_.isEmpty(order) || order.state !== 'ACCEPTED' || order.status !== 'PENDING')
            return resp.error(res, 'Invalid order id provided');
        
        let should_return = false;
        
        if (order.accepted_by !== user_id)
            return resp.error(res, 'This order is accepted by another vendor');

        const data = {
            order_id,
            status: 'ONGOING',
            customer_id: order.customer_id,
            order_status: 'ONGOING',
            // vendor_status: 'ARRIVED',
            started_at: Date.now()
        }
        userService.updateOrders(data)
            .then(_ => resp.success(res, 'Order is started'))
            .catch(err => {
                resp.error(res, 'Something went wrong', err);
                should_return = true;
            });

        if(should_return) return;
        
        sendOrderSubscription(data);

        let notif_data = {
            user_id,
            message: 'You job has been started'
        }

        await userService.addVendorNotification(notif_data);

        notif_data.user_id = user_id;

        await userService.addCustomerNotification(notif_data);

        let customer = await view.find('CUSTOMER', 'id', order.customer_id);

        let vendor_name = req.user.first_name + ' ' + req.user.last_name;
        let fcm_obj = {
            reg_id: customer.fcm_token,
            title: `Order is started`,
            body: `You order is started by the vendor ${vendor_name}`
        }

        return await fcm.sendNotification(fcm_obj);

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Something went wrong', error);
    }
}

async function endService(req, res) {
    try {
        let should_return = false;
        const { order_id } = req.body;
        if (!order_id)
            return resp.error(res, 'Provide required fields');

        const user_id = req.user.id;
        const order = await view.find('ORDER', 'id', order_id);
        if (_.isEmpty(order) || order.state !== 'ACCEPTED')
            return resp.error(res, 'Invalid order id provided');

        const data = {
            order_id,
            price: order.price,
            tax: order.tax,
            total_price: order.total_price,
            completed_at: Date.now(),
            vendor_id: order.vendor_id,
            accepted_by: order.vendor_id, 
            order_status: 'COMPLETED',
            status: 'COMPLETED',
            customer_id: order.customer_id,
        }

        if(req.user.user_type ==  'VENDOR'){
            data.completed_by_vendor = true
        }else{
            data.completed_by_customer = true;
        }

        sendOrderSubscription(data);
        
        userService.updateOrders(data)
            .then(_ => resp.success(res, 'Order is completed'))
            .catch(err => {
                resp.error(res, 'Something went wrong', err);
                should_return = true;
            });

        if(should_return) return;

        let notif_data = {
            user_id,
            message: 'You job has been completed'
        }

        await userService.addVendorNotification(notif_data);

        notif_data.user_id = user_id;

        await userService.addCustomerNotification(notif_data);

        let customer = await view.find('CUSTOMER', 'id', order.customer_id);

        let vendor_name = req.user.first_name + ' ' + req.user.last_name;
        let fcm_obj = {
            reg_id: customer.fcm_token,
            title: `Your order is completed`,
            body: `Your vendor ${vendor_name} has marked your order as completed`
        }

        return await fcm.sendNotification(fcm_obj);

    } catch (error) {
        console.error(error);
        return resp.error(res, 'Something went wrong', error);
    }
}

// cancel service order
async function cancelService(req, res) {
    const { order_id, reason } = req.body;
    if(!order_id || !reason) return resp.error(res, 'Provide required fields');

    try {
        const curr_order = await view.find('ORDER', 'id', order_id);
        if(_.isEmpty(curr_order) || ['COMPLETED', 'CANCELLED'].includes(curr_order.status))
            return resp.error(res, 'Cannot cancel already completed order');

        const user_id = req.user.id;
        const data = {
            reason,
            order_id,
            status: 'CANCELLED',
            order_status: 'CANCELLED',
            cancelled_by_id: user_id,
            cancelled_by: req.user.user_type
        }
        
        let notif_data = {
            user_id,
            message: 'Your job has been cancelled'
        }

        await userService.addVendorNotification(notif_data);
        
        notif_data.user_id = user_id;

        await userService.addCustomerNotification(notif_data);

        userService.updateOrders(data)
            .then(_ => sendOrderSubscription(data))
            .then(_ => resp.success(res, 'Order cancelled'))
            .catch(err => resp.error(res, 'Error updating service order', err));
        
    } catch (err) {
        console.error(err);
        return resp.error(res, 'Error updating service order', err);
    }
}

function sendOrderSubscription(data) {
    let pubsub = require('../../graphql/pubsub');
    return pubsub.publish('ORDER_STATUS', { ORDER_STATUS: data });
}

// function orderCancelSub(data) {
//     let pubsub = require('../../graphql/pubsub');

//     pubsub.publish('ORDER_CANCEL', {
//         ORDER_CANCEL: { order_id: data.order_id, vendor_id: data.vendor_id }
//     });
// }

// function orderAcceptedSub(data) {
//     let pubsub = require('../../graphql/pubsub');

//     pubsub.publish('ORDER_ACCEPTED', {
//         ORDER_ACCEPTED: { customer_id: data.customer_id, order_id: data.order_id, vendor_id: data.vendor_id, accepted_by:data.accepted_by }
//     });
// }

async function placeService(req, res) {
    try {
        const pubsub = require('../../graphql/pubsub');
        const { lat, lon, service_id, sub_service_id } = req.body;
        if (!lat || !lon || !service_id || !sub_service_id)
            return resp.error(res, 'Provide required fields');

        const order_data = { lat, lon, service_id, sub_service_id };

        order_data['customer_id'] = req.user.id;

        const service_data = await userService.saveService(order_data);

        const service = await view.find('SERVICE', 'id', service_id);

        const obj = {
            sub_service_id,
            customer_name: req.user.first_name + ' ' + req.user.last_name,
            service_id, lat, lon, order_id: service_data.id,
            service_name: service.service_name,
            customer_image_url: req.user.image_url,
            customer_phone_no: req.user.phone_no,
            service_image_url: service.image_url,
            service_name: service.service_name
        }

        pubsub.publish('NEW_JOB_ALERT', {
            NEW_JOB_ALERT: obj
        });

        const fcm_obj = {
            reg_id: req.user.fcm_token,
            title: 'Order placed successfully',
            body: `You order for ${service.name} has been successfully placed`
        }

        resp.success(res, service_data, 'Service posted');
        return await fcm.sendNotification(fcm_obj);

    } catch (error) {
        console.log(error);
        return resp.error(res, 'Error placing service order');
    }
}

async function getVendersByServiceId(req, res) {
    try {
        const { service_id } = req.params;
        const { lat, lon } = req.query;

        if (!service_id || !lat || !lon)
            return resp.error(res, 'Provide required fields');

        const data = { service_id, lat, lon };
        const users = await userService.getVenderByServiceId(data);
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
    const { lat, lon } = req.body;
    if(!lat || !lon) return resp.error(res, 'Provide lat and lon');

    const user = req.user;
    const data = {
        lat, lon,
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

function getVendorBookings(req, res) {
    const user_id = req.user.id;
    userService.getOrdersByVendor(user_id)
        .then(bookings => resp.success(res, bookings))
        .catch(err => resp.error(res, 'Error getting bookings', err));
}

function getNotifications(req, res) {
    let id = req.user.id;
    let user_type  = req.user.user_type;

    userService.getNotifications(id, user_type)
        .then(notifications => resp.success(res, notifications))
        .catch(err => resp.error(res, 'Error getting notifications', err));
}

function updateFCM(req, res) {
    let fcm_token = req.body.fcm_token;
    if(!fcm_token) return resp.error(res, 'Provide FCM Token');

    let { user_type, id } = req.user;
    userService.updateFCM(user_type, fcm_token, id)
        .then(_ => resp.success(res, 'FCM Token updated successfully'))
        .catch(err => resp.error(res, 'Somthing went wrong', err.message));

}