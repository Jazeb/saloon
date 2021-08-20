const _ = require('lodash');
const moment = require('moment');
const { Op } = require('sequelize');

const sequelize = require('../config/db.connection');
const { User } = require('../models/index');

// use this function to get data by any key
const find = ({ table_name, key, value }) => {
    return new Promise(async (resolve, reject) => {
        
    });
}

// use this function to get data based on multiple where options
const findOne = ({ table_name, where }) => {
    return new Promise(async (resolve, reject) => {
        
    });
}

const findAll = async model => {
    return new Promise((resolve, reject) => {
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