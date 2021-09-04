const express = require('express');

const { authCustomer, authVendor } = require("../../config/auth");
const userCrtl = require('../controllers/user.controller');
const router = express.Router();


router.use('/profileImage', express.static(process.cwd() + '/server/assets/profile_images/'));


// vendor APIs
router.post('/vendor/signup', userCrtl.userSignup);
router.get('/vendor/:service_id', userCrtl.getVendersByServiceId);
router.post('/vendor/login', userCrtl.login);
router.put('/update', authVendor, userCrtl.updateUser);
router.post('/vendor/order/accept', authVendor, userCrtl.acceptServiceOrder);
router.post('/vendor/order/start', authVendor, userCrtl.startService);
router.post('/vendor/order/end', authVendor, userCrtl.endService);
router.post('/vendor/review', authVendor, userCrtl.submitReview);


// customer APIs
router.post('/customer/signup', userCrtl.userSignup);
router.post('/customer/login', userCrtl.login);
router.post('/customer/service/place', authCustomer, userCrtl.placeService);
router.post('/customer/review', authCustomer, userCrtl.submitReview);


router.post('/resetPassword', userCrtl.resetPassword);
router.post('/updatePassword', authCustomer, userCrtl.updatePassword);
router.post('/forgotPassword', userCrtl.forgotPassword);



module.exports = router;