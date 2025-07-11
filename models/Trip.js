const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true },
  image: { type: String ,default:null }, 
  
  about_this_experience:{type:String,required:true},
  highlights:[{type:String,required:true}],
  whatis_included:[{type:String,required:true}],
  available_date: [{ type: Date, required: true }],
  time: { type: String, required: true },
  available_seats: { type: Number, required: true },
  
}, 
{ timestamps: true });

module.exports = mongoose.model('Trip', tripSchema); 