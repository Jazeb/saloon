const express = require('express')
const authCrtl = require('../controllers/auth.controller');
const authenticateToken = require("../../config/auth");

const router = express.Router();

router.post('/signin', authCrtl.signIn);
router.patch('/activateUser', authenticateToken, authCrtl.activateUser);
router.post('/socialLogin', authCrtl.socialLogin);
router.post('/appleSignin/callback', authCrtl.appleSignin);


module.exports = router