const express = require('express');
const router = express.Router();
const dashboardControllers = require('../controllers/dashboardControllers');

const {adminAuth} = require('../middleware/auth');
const Iupload = require('../middleware/multer');


router.post('/register', dashboardControllers.register_admin);
router.post('/login', dashboardControllers.login_admin);

// Trip
router.post('/create_trip',adminAuth, Iupload.any(), dashboardControllers.createTrip); 
router.get('/get_trip/:id',adminAuth, dashboardControllers.getTrip); 
router.get('/get_all_trips',adminAuth, dashboardControllers.getAllTrips); 
router.put('/edit_trip/:id', adminAuth,Iupload.any(), dashboardControllers.editTrip); 
router.delete('/delete_trip/:id',adminAuth, dashboardControllers.deleteTrip); 

// Booking 
router.get('/get_all_bookings',adminAuth, dashboardControllers.getAllBookings); 
router.put('/edit_booking/:id',adminAuth, dashboardControllers.editBooking); 
router.delete('/delete_booking/:id',adminAuth, dashboardControllers.deleteBooking); 

module.exports = router;
