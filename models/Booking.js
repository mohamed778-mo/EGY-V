const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  
  trip_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  trip_name:{type:String},
  trip_location:{type:String},
  date: { type: Date, required: true },
  number_of_travellers: { type: String, required: true, default: 1 },

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema); 