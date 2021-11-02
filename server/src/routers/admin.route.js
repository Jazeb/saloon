const express = require('express');
const adminCrtl = require('../controllers/admin.controller');
const { authAdmin } = require("../../config/auth");

const router = express.Router();

router.post('/login', adminCrtl.login);

router.get('/customer', authAdmin, adminCrtl.getCustomers);
router.put('/customer', authAdmin, adminCrtl.updateCustomers);
router.get('/users', authAdmin, adminCrtl.getUsers);

router.get('/vendor', authAdmin, adminCrtl.getVendors);
router.put('/vendor', authAdmin, adminCrtl.updateVendors);

router.get('/order', authAdmin, adminCrtl.getOrders);
router.put('/order', authAdmin, adminCrtl.updateOrders);

router.get('/service', authAdmin, adminCrtl.getServices);
router.put('/service', authAdmin, adminCrtl.updateService);
router.post('/service', authAdmin, adminCrtl.addService);

module.exports = router