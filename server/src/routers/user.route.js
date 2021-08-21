const express = require('express');

const authenticateUser = require("../../config/auth");
const userCrtl = require('../controllers/user.controller');
const router = express.Router();


router.use('/profileImage', express.static(process.cwd() + '/server/assets/profile_images/'));

router.post('/vendor/signup', userCrtl.vendorSignup);
router.get('/vendor/:service_id', userCrtl.getVenderByServiceId);
// router.post('/customer/signup', userCrtl.customerSignup);
router.post('/login', userCrtl.login);
router.put('/update', authenticateUser, userCrtl.updateUser);


router.post('/service/place', authenticateUser, userCrtl.placeService);

router.post('/resetPassword', userCrtl.resetPassword);
router.post('/updatePassword', authenticateUser, userCrtl.updatePassword);
router.post('/forgotPassword', userCrtl.forgotPassword);


module.exports = router