const express = require('express');
const router = express.Router();
const websiteControllers = require('../controllers/websiteControllers');
const {auth} = require('../middleware/auth');
const Iupload = require('../middleware/multer');



router.post('/register', Iupload.any(), websiteControllers.user_Register);
router.post('/verify-otp', websiteControllers.verify);
router.post('/resend-otp', websiteControllers.resend_otp);
router.post('/login', websiteControllers.login_user);

router.get('/filter-trips',auth , websiteControllers.filterTrips);
router.get('/get_all_trips', auth , websiteControllers.getAllTrips)
router.get('/get_trip/:id',auth, websiteControllers.getTrip)

router.post('/create-booking/:id',auth, websiteControllers.createBooking);


module.exports = router;
