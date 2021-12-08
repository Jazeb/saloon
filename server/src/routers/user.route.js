const express = require('express');

const { authCustomer, authVendor } = require("../../config/auth");
const userCrtl = require('../controllers/user.controller');
const router = express.Router();


router.use('/vendor/profileImage', express.static(process.cwd() + '/server/assets/profile_images/'));
router.use('/customer/profileImage', express.static(process.cwd() + '/server/assets/profile_images/'));


// vendor APIs
router.post('/vendor/login', userCrtl.login);
router.post('/vendor/logout', authVendor, userCrtl.logout);
router.post('/vendor/signup', userCrtl.userSignup);
router.put('/vendor/update', authVendor, userCrtl.updateUser);
router.post('/vendor/review', authVendor, userCrtl.submitReview);

router.post('/vendor/order/end', authVendor, userCrtl.endService); // send status = COMPLETED
router.post('/vendor/order/start', authVendor, userCrtl.startService); // send status = ARRIVED DONE
router.post('/vendor/order/accept', authVendor, userCrtl.acceptServiceOrder); // send status = ACCEPTED DONE
router.post('/vendor/order/arrived', authVendor, userCrtl.arrivedOrderUpdate); // send status = ARRIVED DONE
router.post('/vendor/order/cancel', authVendor, userCrtl.cancelService);


router.get('/vendor/notifications', authVendor, userCrtl.getNotifications);
router.get('/vendor/bookings', authVendor, userCrtl.getVendorBookings);

router.post('/vendor/changePassword', authVendor, userCrtl.changePassword);
router.post('/vendor/forgotPassword', userCrtl.forgotPassword);
router.post('/vendor/updateLocation', authVendor, userCrtl.updateLocation);

router.put('/vendor/updateFCM', authVendor, userCrtl.updateFCM);

router.get('/vendor/:service_id', userCrtl.getVendersByServiceId);

// customer APIs
router.post('/customer/logout', authCustomer, userCrtl.logout);
router.put('/customer/update', authCustomer, userCrtl.updateUser);
router.post('/customer/signup', userCrtl.userSignup);
router.post('/customer/login', userCrtl.login);
router.post('/customer/service/place', authCustomer, userCrtl.placeService);
router.post('/customer/review', authCustomer, userCrtl.submitReview);

router.post('/customer/order/end', authCustomer, userCrtl.endService);
router.post('/customer/order/cancel', authCustomer, userCrtl.cancelService);
router.get('/customer/bookings', authCustomer, userCrtl.getCustomerBookings);
router.get('/customer/notifications', authCustomer, userCrtl.getNotifications);

router.post('/customer/changePassword', authCustomer, userCrtl.changePassword);
router.post('/customer/forgotPassword', userCrtl.forgotPassword);

router.put('/customer/updateFCM', authCustomer, userCrtl.updateFCM);


module.exports = router;