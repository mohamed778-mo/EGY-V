const User = require('../models/User');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

require('dotenv').config()

exports.sendOTPEmail = async ({ to, name, otp }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: 'icmobile.company@gmail.com',
        pass: process.env.USER_PASS, 
      },
    });

    await transporter.sendMail({
      from: 'IC Mobile <icmobile.company@gmail.com>',
      to:to,
      subject: "Your Verification Code",
      text: `Hello ${name}, your verification code is: ${otp}. It is valid for 10 minutes.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f9f9f9;
              margin: 0;
              padding: 0;
            }
            .email-container {
              max-width: 500px;
              margin: 50px auto;
              background: #fff;
              padding: 30px;
              border-radius: 15px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            h1 {
              color: #4a90e2;
              margin-bottom: 20px;
            }
            .otp-code {
              font-size: 30px;
              font-weight: bold;
              color: #333;
              background: #f0f0f0;
              padding: 15px 25px;
              border-radius: 10px;
              display: inline-block;
              letter-spacing: 5px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <h1>Email Verification</h1>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your verification code is:</p>
            <div class="otp-code">${otp}</div>
            <p>The code is valid for <strong>10 minutes</strong>.</p>
            <div class="footer">
              <p>If you did not request this code, you can ignore this message.</p>
              <p>&copy; 2025 IC Mobile. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Error sending email:", error.message);
    console.error(error);
  }
};

exports.user_Register = async (req, res) => {
  try {
    const { name, email, phone, age, password, address } = req.body;

    const file = req.files?.find(f => f.fieldname === 'file');

    let link;
    if (file) {
      link = `http://localhost:3000/uploads/${file.filename}`;
    } else {
      link = null;
    }

    const duplicatedEmail = await User.findOne({ email: email });
    if (duplicatedEmail) {
      const message = 'Email already exists!';
      return res.status(400).send({ message });
    }
    const otp = crypto.randomInt(10000000, 99999999).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000;
    const newUser = new User({
      name,
      email,
      phone,
      age,
      photo_id: link,
      password,
      address,
      otp,
      otpExpires: otpExpire,
      verfied: false
    });
    await exports.sendOTPEmail({ to: email, name: req.body.name, otp });
    await newUser.save();
    const message = 'Verification code sent to your email.';
    res.status(200).send({ message });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.verify = async (req, res) => {
  try {
    const otp = req.body.otp;
    const email = req.body.email;
    const user = await User.findOne({ email: email, otp: otp });
    if (user) {
      if (user.otpExpires > Date.now()) {
        user.otp = null;
        user.verfied = true;
        await user.save();
        const message = 'Verification successful';
        res.status(200).send({ message });
      } else {
        res.status(400).send('The code has expired. Please register again.');
      }
    } else {
      const message = 'Invalid code';
      return res.status(404).send({ message });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.resend_otp = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      const message = 'Invalid email address';
      return res.status(404).send({ message });
    }
    const otp = crypto.randomInt(10000000, 99999999).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000;
    user.otp = otp;
    user.otpExpires = otpExpire;
    await user.save();
    await exports.sendOTPEmail({ to: email, name: user.name, otp });
    const message = 'Verification code sent to your email.';
    res.status(200).send({ message });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.login_user = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      const message = 'Invalid email or password';
      return res.status(404).send({ message });
    }
    if (!user.verfied) {
      const message = 'Please verify your email first';
      return res.status(403).send({ message });
    }
    const isPassword = await bcryptjs.compare(password, user.password);
    if (!isPassword) {
      const message = 'Invalid email or password';
      return res.status(404).send({ message });
    }
    const SECRETKEY = process.env.SECRETKEY;
    const token = jwt.sign({ id: user._id, type: user.role }, SECRETKEY,{ expiresIn: '7d' }) ;
    res.cookie("access_token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      secure: false,      
      sameSite: 'Lax',  
      httpOnly: false,
    });
    user.tokens.push(token);
    await user.save();
    
    
    
   const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    return res.status(200).send({
      success: 'Login successful!',
      user: userData,
   
    });
    
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.filterTrips = async (req, res) => {
  try {
    const {destination , date ,travelers }=req.body
    
    if (!date || isNaN(new Date(date))) {
      return res.status(400).json({ error: "Invalid or missing date" });
    }

    const selectedDate = new Date(date);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + 1);

    const trips = await Trip.find({
      location: destination,
      available_seats: { $gte: travelers },
      available_date: {
        $gte: selectedDate,
        $lt: nextDate
      }
    });

    res.status(200).json({trips});
  }catch(e){
    res.status(500).send({error:e.message})
  }
};


exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find().select('-about_this_experience -highlights -whatis_included -available_date -time -available_seats');

    if (trips.length === 0) {
      return res.status(200).json({ message: 'No trips available', trips: [] });
    }

    res.status(200).json({trips});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.status(200).json({trip});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.createBooking = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date, number_of_travellers } = req.body;
    const trip_id =req.params.id
    const trip_data =await Trip.findOne({_id:trip_id})
    if(!trip_data){res.status(404).send("Trip Not Found!!")}
    const booking = new Booking({
      first_name,
      last_name,
      email,
      phone,
      trip_id,
      trip_name:trip_data.title,
      trip_location:trip_data.location,
      date,
      number_of_travellers
    });
    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.access_token;
    if (token) {
      const user = await User.findOne({ tokens: token });
      if (user) {
        user.tokens = user.tokens.filter(t => t !== token);
        await user.save();
      }
    }
    res.clearCookie("access_token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
