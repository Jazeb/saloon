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
            if (err) return resolve(false);
            return resolve(result);
        });
    });
}

const validateUser = async token => {
    try {
        let user = await views.find(token.user_type, 'id', token.id );
        if(_.isEmpty(user))
            return false;
        user.user_type = token.user_type;
        return user
    } catch (err) {
        console.error(err);
        return err;
    }
}

module.exports = { encryptPassword, generateToken, isValidPassword, verifyToken, validateUser }
