const _ = require('lodash');
const moment = require('moment');
const { Op } = require('sequelize');

// const sequelize = require('../config/db.connection');
const { Vendors, Service, Customers, SubService, ServiceOrders, Admin } = require('../models/index');

// use this function to get data by any key
const find = (table_name, key, value) => {
    return new Promise(async (resolve, reject) => {
        let Model = null;
        if (table_name == 'ADMIN') Model = Admin;
        if (table_name == 'VENDOR') Model = Vendors;
        if (table_name == 'SERVICE') Model = Service;
        if (table_name == 'CUSTOMER') Model = Customers;
        if (table_name == 'ORDER') Model = ServiceOrders;
        if (table_name == 'SUB_SERVICE') Model = SubService;
        
        !Model && console.error('Invalid model name');

        Model && Model.findOne({ where: { [key]: value }, raw: true }).then(data => resolve(data))
            .catch(err => reject(err));
    });
}

const findAll = model => {
    return new Promise((resolve, reject) => {
        let Model = null;
        if (model == 'SERVICES') Model = Service;

        // const include = [ { model: SubService}]
        Model.findAll().then(services => resolve(services))
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

const getServices = () => {
    return new Promise((resolve, reject) => {
        let include = [{ model: SubService }];
        
        Service.findAll({ include }).then(services => resolve(services))
            .catch(err => reject(err));
    });
}

module.exports = { find, findAll, update, getServices }