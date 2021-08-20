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
    signup,
    get,
    update,
    updatePassword,
    forgotPassword,
    updatePassword,
    resetPassword,
}


async function signup(req, res) {
    let userModel = {
        first_name: null,
        last_name: null,
        email: null,
        password: null,
        gender: null,
        address: null,
        city: null,
        latitude: null,
        longitude: null,
        phone_number: null,
        image_url: null,
        dob: null,
        is_social_login: false,
        provider_type: false,
        provider_key: null,
    }

    const { first_name, last_name, email, password, phone_number, address, city, gender, dob, latitude, longitude } = req.body;
    if (_.isEmpty(first_name) || _.isEmpty(last_name) || _.isEmpty(email))
        return resp.error(res, 'Provide required fields');

    if (!validator.validate(email))
        return resp.error(res, 'Provide a valid email');

    try {
        let u = await view.find({ table_name: 'USERS', key: 'email', value: email })
        if (u && !u.is_social_login)
            return resp.error(res, 'User already exists');
        // let isValidUser = await userService.validateUser(email);
        // if (!isValidUser)
        //     return resp.error(res, 'User already exists');

        let user = {
            first_name,
            last_name,
            email,
            phone_number: phone_number || null,
            password: encryptPassword(password),
            address: address || null,
            city: city || null,
            gender: gender || null,
            dob: dob || null,
            latitude: latitude || null,
            longitude: longitude || null,
        }

        Object.assign(userModel, user)
        if (req.files && req.files.image) {
            let fileName = req.files.image.name.replace(' ', '_').split('.').reverse()[0];
            fileName = '/image_' + Date.now() + '.' + fileName

            let bucketimageInfo = {
                Bucket: 'ibtekar-assets',
                contentType: 'image/jpeg',
                fileName: fileName,
                file: req.files.image
            }
            let uploadedImage = await s3.Upload(bucketimageInfo)


            // let dest_url = process.cwd() + '/server/assets/profile_images' + fileName;
            // req.files.image.mv(dest_url);
            user.image_url = uploadedImage;
        }

        const new_user = await userService.signup(user);
        new_user.password = null;
        new_user.created_at = null;
        new_user.updated_at = null;

        const token = generateToken(new_user);
        new_user.token = token
        new_user.coins = { coins_count: 0 }
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


async function update(req, res) {
    try {
        let should_return = false;
        let params = req.body;
        params.id = req.user.id;

        if (req.files && req.files.image) {
            const allowedExts = ['png', 'jpg', 'JPG', 'jpeg', 'gif', 'mp4', 'webm', 'mpeg'];
            const ext = req.files.image.name.replace(' ', '_').split('.').reverse()[0];
            if (!allowedExts.includes(ext)) {
                should_return = true;
                return resp.error(res, 'Invalid file extension');
            }
            let fileName = '/image_' + Date.now() + '.' + ext;
            // let dest_url = process.cwd() + '/server/assets/profile_images' + fileName;
            // req.files.image.mv(dest_url);

            let bucketimageInfo = {
                Bucket: 'ibtekar-assets',
                contentType: 'image/jpeg',
                fileName: fileName,
                file: req.files.image
            }
            let uploadedImage = await s3.Upload(bucketimageInfo)

            params.image_url = uploadedImage;
            // req.user.image_url && fs.unlink(process.cwd() + '/server/assets/profile_images' + req.user.image_url, (err, data) => err && console.error(err))
            req.user.image_url = uploadedImage;
        }
        if (should_return) return
        let user = await userService.updateUser(params);
        user && resp.success(res, user);
        return
    } catch (err) {
        console.error(err);
        return resp.error(res, 'Error updating user', err)
    }
}

async function updatePassword(req, res) {
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

function resetPassword(req, res) {

    const { new_password, confirm_password, email } = req.body;
    if (_.isEmpty(new_password) || _.isEmpty(confirm_password) || _.isEmpty(email))
        return resp.error(res, 'Provide required fields');

    if (new_password !== confirm_password)
        return resp.error(res, 'Password must match');

    userService.resetPassword(email, new_password).then(_ => resp.success(res, 'Password updated successfully'))
        .catch(err => {
            console.error(err);
            return resp.error(res, 'Error updating password', err);
        });
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

const stringToBoolean = string => string === 'false' ? false : !!string
