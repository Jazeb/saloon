const express = require('express')
const adminCrtl = require('../controllers/admin.controller');
const { authAdmin } = require("../../config/auth");

const router = express.Router();

router.post('/login', adminCrtl.login);
router.get('/orders', authAdmin, adminCrtl.getOrders);

router.get('/customer', adminCrtl.getCustomers);
router.put('/customer', adminCrtl.updateCustomers);

router.get('/vendor', adminCrtl.getVendors);
router.put('/vendor', adminCrtl.updateVendors);

router.get('/order', adminCrtl.getOrders);
router.put('/order', adminCrtl.updateOrders);

router.get('/service', adminCrtl.getServices);
router.put('/service', adminCrtl.updateService);
router.post('/service', adminCrtl.addService);


module.exports = router