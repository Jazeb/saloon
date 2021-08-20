const express = require('express');

const authenticateUser = require("../../config/auth");
const userCrtl = require('../controllers/user.controller');
const router = express.Router();


router.use('/profileImage', express.static(process.cwd() + '/server/assets/profile_images/'));

router.get('/get', authenticateUser, userCrtl.get);
router.get('/product/favorites', authenticateUser, userCrtl.getFavoriteProducts);

router.post('/signup', userCrtl.signup);
router.put('/updateFirebase', authenticateUser, userCrtl.updateFirebase);
router.post('/update', authenticateUser, userCrtl.update);
router.post('/buyTicket', authenticateUser, userCrtl.buyTicket);
router.post('/placeBid', authenticateUser, userCrtl.placeBid);
router.post('/survey', authenticateUser, userCrtl.addSurvey);
router.post('/ticket', userCrtl.createTicket);
router.post('/support', authenticateUser, userCrtl.createSupport);

router.post('/resetPassword', userCrtl.resetPassword);
router.post('/updatePassword', authenticateUser, userCrtl.updatePassword);
router.post('/forgotPassword', userCrtl.forgotPassword);

router.put('/product/toggleFavorite', authenticateUser, userCrtl.toggleFavourite);


router.get('/myProducts', authenticateUser, userCrtl.myProducts);
router.get('/myBids', authenticateUser, userCrtl.myBids);
router.get('/coins', authenticateUser, userCrtl.getCoins);
router.get('/activities', authenticateUser, userCrtl.getActivities);
router.get('/notifications', authenticateUser, userCrtl.getNotifications);
router.get('/logout', authenticateUser, userCrtl.logout);
router.get('/transactionHistory', authenticateUser, userCrtl.transactionHistory);

router.get('/faqs', authenticateUser, userCrtl.getFaqs);

module.exports = router