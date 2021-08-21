const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { CONFIG } = require('../config/keys');
const views = require('./views');

const encryptPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync(13));
const generateToken = user => jwt.sign(JSON.stringify(user), CONFIG.jwtSecret);

const isValidPassword = (password, user_password) => {
    return new Promise((resolve, reject) => {
        if (!bcrypt.compareSync(password, user_password)) return resolve(false);
        else return resolve(true);
    });
}

const verifyToken = token => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, CONFIG.jwtSecret, async (err, result) => {
            if (err) return resolve(false)
            let user = await views.find('USERS', 'id', result.id );
            if (_.isEmpty(user)) return resolve(false);
            if (user.is_archived) return resolve(false);
            user = user.toJSON();
            delete user.password;
            delete user.firebase_key;
            delete user.address;
            return resolve(user);
        });
    });
}

module.exports = { encryptPassword, generateToken, isValidPassword, verifyToken }
