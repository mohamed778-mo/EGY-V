const Admin = require('../models/Admin');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');

require('dotenv').config()


exports.register_admin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: 'Email already exists' });
    const admin = new Admin({ name, email, password });
    await admin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.login_admin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await Admin.findOne({ email });
    if (!user) {
      const message = 'Invalid email or password';
      return res.status(404).send({ message });
    }
    if (!user.isAdmin) {
      const message = 'Please verify your email first';
      return res.status(403).send({ message });
    }
    const isPassword = await bcryptjs.compare(password, user.password);
    if (!isPassword) {
      const message = 'Invalid email or password';
      return res.status(404).send({ message });
    }
    const SECRETKEY = process.env.SECRETKEY2;
    const token = jwt.sign({ id: user._id, type: user.role }, SECRETKEY,{ expiresIn: '7d' });
    res.cookie("access_token", `Bearer ${token}`, {
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      secure: true, 
      httpOnly: true,
    });
    user.tokens.push(token);
    await user.save();
    const message = 'Login successful!';
    res.status(200).send({ success: message });
  } catch (error) {
    res.status(500).send(error.message);
  }
};


exports.createTrip = async (req, res) => {
  try {
    const file = req.files?.find(f => f.fieldname === 'file');
    let imageLink = file ? `http://localhost:3000/uploads/${file.filename}` : null;
    const {
      title,
      description,
      price,
      location,
      rating,
      about_this_experience,
      highlights,
      whatis_included,
      available_date,
      time,
      available_seats
    } = req.body;
    const trip = new Trip({
      title,
      description,
      price,
      location,
      rating,
      image: imageLink,
      about_this_experience,
      highlights: Array.isArray(highlights) ? highlights : [highlights],
      whatis_included: Array.isArray(whatis_included) ? whatis_included : [whatis_included],
      available_date: Array.isArray(available_date) ? available_date : [available_date],
      time,
      available_seats
    });
    await trip.save();
    res.status(201).json({ message: 'Trip created successfully', trip });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find();
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editTrip = async (req, res) => {
  try {
    const file = req.files?.find(f => f.fieldname === 'file');
    let imageLink = file ? `http://localhost:3000/uploads/${file.filename}` : null;
    const updateData = { ...req.body };
    if (imageLink) updateData.image = imageLink;
    if (updateData.highlights && !Array.isArray(updateData.highlights)) updateData.highlights = [updateData.highlights];
    if (updateData.whatis_included && !Array.isArray(updateData.whatis_included)) updateData.whatis_included = [updateData.whatis_included];
    if (updateData.available_date && !Array.isArray(updateData.available_date)) updateData.available_date = [updateData.available_date];
    const trip = await Trip.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.status(200).json({ message: 'Trip updated successfully', trip });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editBooking = async (req, res) => {
  try {
    const updateData = { ...req.body };
    const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


