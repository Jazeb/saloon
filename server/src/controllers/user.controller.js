const _ = require('lodash');
const fs = require('fs');
const { Op } = require('sequelize');
const validator = require("email-validator");

const { encryptPassword, generateToken, isValidPassword } = require('../../utils/shared');
const userService = require('../services/user.services');
const mailer = require("../../config/mailer");
const resp = require('../../config/api.response');
const view = require('../../utils/views');

module.exports = {
    login,
    get,
    vendorSignup,
    getVenderByServiceId,
    updateUser,
    updatePassword,
    forgotPassword,
    updatePassword,
    resetPassword,
    placeService
}



async function placeService(req, res) {
    try {
        const { lat, long, service_id, sub_service_id } = req.body;
        if(!lat || !long || !service_id || !sub_service_id)
            return resp.error(res, 'Provide required fields');
        
        const users = await userService.getUserService(service_id, lat, long);
        return resp.success(res, users);
        
    } catch (error) {
        console.log(error);
        return resp.error(res, 'Error placing service order');
    }
}

async function getVenderByServiceId(req, res) {
    try {
        const service_id = req.params.service_id;
        if(!service_id)
            return resp.error(res, 'Provide service id');
    
        const users = await userService.getVenderByServiceId(service_id);
        return resp.success(res, users);
    } catch (error) {
        console.log(error)
        resp.error(res, 'Error getting vendors', error);
    }
}

async function vendorSignup(req, res) {
    const { first_name, last_name, email, password, service_id } = req.body;
    if (_.isEmpty(first_name) || _.isEmpty(last_name) || _.isEmpty(email) || _.isEmpty(password) || !service_id)
        return resp.error(res, 'Provide required fields');

    if (!validator.validate(email)) return resp.error(res, 'Provide a valid email');
    try {
        let validate_user = await view.find('VENDORS', 'email', email);
        if(!_.isEmpty(validate_user))
            return resp.error(res, 'User already exists with this email');

        const user = req.body;
        if (req.files && req.files.profile_image) {
            const image = req.files.profile_image;
            let fileName = image.name.replace(' ', '_').split('.').reverse()[0];
            fileName = '/image_' + Date.now() + '.' + fileName;

            let dest_url = process.cwd() + '/server/assets/profile_images' + fileName;
            image.mv(dest_url);
            user.image_url = fileName;
        }
        user.service_id = service_id;
        user.user_type = 'VENDOR';
        user.password = encryptPassword(user.password);

        let new_user = await userService.vendorSignup(user);
        new_user = new_user.toJSON();
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
        console.log(req.body)
        let user = await userService.updateUser(req.body);
        user && resp.success(res, user);
        return
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

        let user = await view.find('USERS', 'email', email);
        if (_.isEmpty(user))
            return resp.error(res, 'Invalid user');

        user = user.toJSON();

        let isValid = await isValidPassword(password, user.password);
        if (!isValid)
            return resp.error(res, 'Invalid password');

        delete user.password;
        delete user.created_at;
        delete user.updated_at;
        let token = generateToken(user);
        user.token = token;
        return resp.success(res, user);
    } catch (err) {
        console.error(err)
        return resp.error(res, 'Something went wrong', err);
    }
}

async function resetPassword(req, res) {
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
}

async function updatePassword(req, res) {

    try {
        const { old_password, new_password, confirm_password } = req.body;
        if (_.isEmpty(old_password) ||_.isEmpty(new_password) || _.isEmpty(confirm_password))
            return resp.error(res, 'Provide required fields');
    
        const curr_user = await getUser('id', req.user.id);
        if(!curr_user)
            return resp.error(res, 'Invalid id');

        let isValid = await isValidPassword(old_password, curr_user.password);
        if(!isValid)
            return resp.error(res, 'Invalid current password');

        if (new_password !== confirm_password)
            return resp.error(res, 'Password must match');
    
        userService.resetPassword(curr_user.email, new_password).then(_ => resp.success(res, 'Password updated successfully'))
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
    const { email } = req.body;
    if (_.isEmpty(email))
        return resp.error(res, 'Provide email');

    const user = await view.find({ table_name: 'USERS', key: 'email', value: email });
    if (_.isEmpty(user) || user.is_social_login)
        return resp.error(res, 'Invalid user email');

    mailer.sendForgotEmail(user).then(_ => resp.success(res, 'Email sent successfully')).catch(err => {
        console.error(err);
        return resp.error(res, 'Error sending email', err);
    });
}

function getUser(key, value){
    return new Promise((resolve, reject) => {
        view.find('USERS', key, value).then(user => resolve(user))
        .catch(err => reject(err));
    });
}

const stringToBoolean = string => string === 'false' ? false : !!string;
