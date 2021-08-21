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
    getServices
}


function getServices(req, res) {
    view.findAll('SERVICES').then(services => resp.success(res, services))
    .catch(err => resp.error(res, 'Error getting services', err));
}