const express = require('express');

const authenticateUser = require("../../config/auth");
const servicesCrtl = require('../controllers/services.controller');
const router = express.Router();


router.use('/profileImage', express.static(process.cwd() + '/server/assets/profile_images/'));

router.get('/', authenticateUser, servicesCrtl.getServices);


module.exports = router