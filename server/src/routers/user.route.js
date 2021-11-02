const express = require('express');

const { authCustomer, authVendor } = require("../../config/auth");
const userCrtl = require('../controllers/user.controller');
const router = express.Router();


router.use('/vendor/profileImage', express.static(process.cwd() + '/server/assets/profile_images/'));
router.use('/customer/profileImage', express.static(process.cwd() + '/server/assets/profile_images/'));


// vendor APIs
router.post('/vendor/login', userCrtl.login);
router.post('/vendor/signup', userCrtl.userSignup);
router.put('/vendor/update', authVendor, userCrtl.updateUser);
router.post('/vendor/review', authVendor, userCrtl.submitReview);
router.get('/vendor/:service_id', userCrtl.getVendersByServiceId);
router.post('/vendor/order/end', authVendor, userCrtl.endService);
router.post('/vendor/order/start', authVendor, userCrtl.startService);
router.post('/vendor/order/accept', authVendor, userCrtl.acceptServiceOrder);

router.post('/vendor/changePassword', authVendor, userCrtl.changePassword);
router.post('/vendor/forgotPassword', userCrtl.forgotPassword);


// customer APIs
router.put('/customer/update', authCustomer, userCrtl.updateUser);
router.post('/customer/signup', userCrtl.userSignup);
router.post('/customer/login', userCrtl.login);
router.post('/customer/service/place', authCustomer, userCrtl.placeService);
router.post('/customer/review', authCustomer, userCrtl.submitReview);


router.post('/customer/changePassword', authCustomer, userCrtl.changePassword);
router.post('/customer/forgotPassword', userCrtl.forgotPassword);



module.exports = router;