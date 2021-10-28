const express = require('express');

// const authenticateUser = require("../../config/auth");
const servicesCrtl = require('../controllers/services.controller');
const router = express.Router();


router.use('/icon', express.static(process.cwd() + '/server/assets/service_images/'));

router.get('/', servicesCrtl.getServices);

module.exports = router