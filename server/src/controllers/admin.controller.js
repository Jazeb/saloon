const validator = require("email-validator");
const _ = require("lodash");

const resp = require("../../config/api.response");
const { generateToken, isValidPassword } = require('../../utils/shared');
const userService = require('../services/user.services');
const view = require('../../utils/views');


module.exports = {
    login,
    getOrders,
    getCustomers,
    getServices,
    getUsers,
    addService,
    updateService,
    updateCustomers,
    getVendors,
    updateOrders,
    updateVendors
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!validator.validate(email))
            return resp.error(res, 'Provide a valid email');

        if (_.isEmpty(password))
            return resp.error(res, 'Provide required fields');

        let user = await view.find('ADMIN', 'email', email);
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

        user.is_admin = true;
        user.token = token;
        return resp.success(res, user);
    } catch (err) {
        console.error(err)
        return resp.error(res, 'Something went wrong', err);
    }
}

async function getUsers(req, res) {
    try {
        const users = await userService.getUsers();
        return resp.success(res, users);
    } catch (error) {
        console.error(error);
        return resp.error(res, error);
    }
}

async function getCustomers(req, res) {
    try {
        const customers = await userService.getCustomers();
        return resp.success(res, customers);
    } catch (error) {
        console.error(error);
        return resp.error(res, error);
    }
}

async function updateCustomers(req, res) {
    try {
        const data = req.body;
        const customers = await userService.updateCustomers(data);
        return resp.success(res, customers);
    } catch (error) {
        console.error(error);
        return resp.error(res, error);
    }
}

async function getVendors(req, res) {
    try {
        const vendors = await userService.getVendors();
        return resp.success(res, vendors);
    } catch (error) {
        console.error(error);
        return resp.error(res, error);
    }
}

async function updateVendors(req, res) {
    try {
        const data = req.body;
        const vendros = await userService.updateVendros(data);
        return resp.success(res, vendros);
    } catch (error) {
        console.error(error);
        return resp.error(res, error);
    }
}

async function getOrders(req, res) {
    try {
        const orders = await userService.getOrders();
        return resp.success(res, orders);
    } catch (error) {
        console.error(error);
        return resp.error(res, error);
    }
}

async function updateOrders(req, res) {
    try {
        const data = req.body;
        const vendros = await userService.updateOrders(data);
        return resp.success(res, vendros);
    } catch (error) {
        console.error(error);
        return resp.error(res, error);
    }
}


// SERVICES CRUD
async function getServices(req, res) {
    try {
        const services = await userService.getServices();
        return resp.success(res, services);
    } catch (error) {
        console.error(error);
        return resp.error(res, error);
    }
}

async function updateService(req, res) {
    try {
        const data = req.body;
        const updated = await userService.updateService(data);
        return resp.success(res, updated);
    } catch (error) {
        console.error(error);
        return resp.error(res, error);
    }
}

async function addService(req, res) {
    try {
        const data = req.body;

        if (req.files && req.files.service_image) {
            const image = req.files.service_image;
            let fileName = image.name.replace(' ', '_').split('.').reverse()[0];
            fileName = '/image_' + Date.now() + '.' + fileName;

            let dest_url = process.cwd() + '/server/assets/service_images' + fileName;
            image.mv(dest_url);
            data.image_url = fileName;
        }
        const added = await userService.addService(data);
        console.log(added);
        return resp.success(res, added);
    } catch (error) {
        console.error(error);
        return resp.error(res, error);
    }
}