const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
require('dotenv').config()

const auth = async (req, res, next) => {
  try {
    const cookieToken = req?.cookies?.access_token;
    const headerAuth = req?.headers?.authorization;

    const headerToken = headerAuth?.startsWith("Bearer ")
      ? headerAuth.split(" ")[1]
      : null;

    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).send("Please login!");
    }

    const SECRETKEY = process.env.SECRETKEY;
    const decoded = jwt.verify(token, SECRETKEY);

    const user = await User.findById(decoded.id);
    if (!user || !user.tokens.includes(token)) {
      return res.status(401).send("Please login!");
    }

    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send("Authentication failed: " + e.message);
  }
};



const adminAuth = async (req, res, next) => {
  try {
    const token = req?.cookies?.access_token?.split(" ")[1];
    const tokenHeader = req?.headers?.authorization?.split(" ")[1];

    if (!token && !tokenHeader) {
      return res.status(401).send("Please login!");
    }

    const SECRETKEY = process.env.SECRETKEY2;
    const accessToken = token || tokenHeader;
    const decoded = jwt.verify(accessToken, SECRETKEY);

    const admin = await Admin.findById(decoded.id);
if (!admin || !admin.tokens.includes(accessToken) || !admin.isAdmin) {
  return res.status(403).send("Available for ADMIN only");
}

    req.user = admin;
    next();
  } catch (e) {
    res.status(500).send("Admin authentication failed: " + e.message);
  }
};

module.exports = {
  auth,
  adminAuth,
};
