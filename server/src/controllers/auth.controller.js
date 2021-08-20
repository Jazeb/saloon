const fs = require('fs');
const _ = require('lodash');
const jwt = require('jsonwebtoken')
const admin = require('firebase-admin');
const validator = require("email-validator");

const apiRes = require("../../config/api.response");
const firebase_SDK_file = require('../../config/firebase.json');
const { generateToken, isValidPassword } = require('../../utils/shared');
const { signup } = require('../services/user.services');
const view = require('../../utils/views');
const { CONFIG } = require('../../config/keys');

const app = admin.initializeApp({
    credential: admin.credential.cert(firebase_SDK_file),
});

module.exports = {
    signIn,
    activateUser,
    socialLogin,
    appleSignin
}

async function signIn(req, res) {
    try {
        const { email, password } = req.body;

        if (!validator.validate(email))
            return apiRes.error(res, 'Provide a valid email');

        if (_.isEmpty(password) || _.isEmpty(email))
            return apiRes.error(res, 'Provide required fields');

        let user = await view.find({ table_name: 'USERS', key: 'email', value: email });
        if (_.isEmpty(user))
            return apiRes.error(res, 'Invalid user');

        await view.updateSession(user.id);
        user = user.toJSON();

        if (!user.status)
            return apiRes.error(res, 'User is inactive');

        if (user.is_archived)
            return apiRes.error(res, 'User is is archived');

        const coins = await view.find({ table_name: 'UserCoins', key: 'user_id', value: user.id });
        user.coins = coins || {}

        if (user.is_social_login && !user.password)
            return apiRes.error(res, 'Invalid user');

        let isValid = await isValidPassword(password, user.password);
        if (!isValid)
            return apiRes.error(res, 'Invalid password');

        delete user.password;
        delete user.created_at;
        delete user.updated_at;
        let token = generateToken(user);
        user.token = token;
        return apiRes.success(res, user);
    } catch (err) {
        console.error(err)
        return apiRes.error(res, 'Something went wrong', err);
    }
}

async function activateUser(req, res) {
    const { phone_number, idToken } = req.body;
    if (!phone_number || _.isEmpty(idToken))
        return apiRes.error(res, 'Provide required fields');

    try {
        let activate = await app.auth().verifyIdToken(idToken);
        const data = { is_verified: 1, phone_number };
        const where = { id: req.user.id };
        activate && view.update({ data, where })
            .then(() => apiRes.success(res, 'User is activated'))
            .catch(err => apiRes.error(res, 'Invalid id', err));
    } catch (err) {
        console.error(err);
        return apiRes.error(res, err)
    }
}

async function socialLogin(req, res) {
    const { provider_key, provider_type, email, social_image_url, first_name, last_name } = req.body;
    if (_.isEmpty(provider_key) || _.isEmpty(provider_type) || _.isEmpty(email))
        return apiRes.error(res, "Provide required params");

    const where = { email, provider_type, is_social_login: true }
    let user = await view.findOne({ table_name: 'USERS', where });

    if (!_.isEmpty(user) && provider_type == user.provider_type) {
        user = user.toJSON();
        if (!user.status)
            return apiRes.error(res, 'User is inactive');

        if (user.is_archived)
            return apiRes.error(res, 'User is is archived');

        const coins = await view.find({ table_name: 'UserCoins', key: 'user_id', value: user.id });
        user.coins = coins || {}

        let token = generateToken(user);
        user.token = token;
        user.exists = true

        delete user.created_at
        delete user.updated_at
        return apiRes.success(res, user)
    }

    const new_user = {
        email, provider_key, provider_type, social_image_url, first_name, last_name
    }
    new_user.is_social_login = true;
    new_user.is_verified = true;

    try {
        user = await signup(new_user);
        user = user.toJSON();
        delete user.password
        delete user.created_at
        delete user.updated_at

        user.exists = false
        user.token = generateToken(user);
        return apiRes.success(res, user);
    } catch (err) {
        console.error(err);
        return apiRes.error(res, 'Error singing up user', err);
    }
}

const getClientSecret = () => {
    const time = new Date().getTime() / 1000; // Current time in seconds since Epoch
    const privateKey = fs.readFileSync(process.cwd() + '/server/config/AuthKey_U26J27JYCK.p8', 'utf-8');

    const headers = {
        kid: CONFIG.key_id,
        typ: undefined
    }

    const claims = {
        'iss': CONFIG.team_id,
        'iat': time, // The time the token was generated
        'exp': time + 86400 * 180, // Token expiration date
        'aud': 'https://appleid.apple.com',
        'sub': CONFIG.service_id,
    }

    token = jwt.sign(claims, privateKey, {
        algorithm: 'ES256',
        header: headers
    });

    return token
}

function appleSignin(req, res) {
    if (res.statusCode == 200) {
        let returnURL = ""
        let firstName = ""
        let middleName = ""
        let lastName = ""
        let email = ""
        if (req.body.hasOwnProperty('user')) {
            const userdata = req.body.user
            const user = JSON.parse(userdata)
            firstName = '&first_name=' + user.name['firstName']
            middleName = '&middle_name=' + user.name['middleName']
            lastName = '&last_name=' + user.name['lastName']
            email = '&email=' + user.email
        }

        var code = '&code=' + req.body.code
        var clientSecret = '&client_secret=' + getClientSecret()
        returnURL = '?success=true' + code + clientSecret + firstName + middleName + lastName + email
        return res.redirect(returnURL)
    } else {
        return res.redirect('?success=false')
    }
}