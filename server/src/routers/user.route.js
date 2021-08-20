const express = require('express');

const authenticateUser = require("../../config/auth");
const userCrtl = require('../controllers/user.controller');
const router = express.Router();


router.use('/profileImage', express.static(process.cwd() + '/server/assets/profile_images/'));

router.post('/signup', userCrtl.signup);

router.post('/resetPassword', userCrtl.resetPassword);
router.post('/updatePassword', authenticateUser, userCrtl.updatePassword);
router.post('/forgotPassword', userCrtl.forgotPassword);


module.exports = router