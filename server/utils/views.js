const _ = require('lodash');
const moment = require('moment');
const { Op } = require('sequelize');

const sequelize = require('../config/db.connection');
const { Vendors, Service, SubService } = require('../models/index');

// use this function to get data by any key
const find = (table_name, key, value) => {
    return new Promise(async (resolve, reject) => {
        let Model = null;
        if(table_name == 'VENDORS') Model = Vendors;

        Model && Model.findOne({ where:{ [key]:value }}).then(data => resolve(data))
        .catch(err => reject(err));
    });
}

// use this function to get data based on multiple where options
const findOne = ({ table_name, where }) => {
    return new Promise(async (resolve, reject) => {
        
    });
}

const findAll = model => {
    return new Promise((resolve, reject) => {
        let Model = null;
        if(model == 'SERVICES') Model = Service;
        
        const include = [ { model: SubService}]
        Model.findAll({ include }).then(services => resolve(services))
        .catch(err => reject(err));
    });
}

const update = async ({ data, where }) => {
    return new Promise((resolve, reject) => {
        User.update(data, { where })
            .then(_ => resolve(true))
            .catch(err => reject(err.parent.sqlMessage));
    });
}

module.exports = { find, findOne, findAll, update }