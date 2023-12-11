const jwt = require('jsonwebtoken')
const User = require('../model/UserModel')
require('dotenv').config();

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' })
  }
  const authenticateToken = async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
  
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.sendStatus(401);
    }
  
    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      next();
    } catch (err) {
      if (!req.user || !req.user.refreshToken || !req.user.user || !req.user.user._id) {
        return res.sendStatus(403);
      }
  
      const existingUser = await User.findOne({
        refreshToken: req.user.refreshToken,
        _id: req.user.user._id
      });
  
      if (!existingUser) {
        return res.sendStatus(403);
      }
  
      try {
        jwt.verify(req.user.refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const accessToken = generateAccessToken(req.user.user);
        req.user.accessToken = accessToken;
        next();
      } catch (err) {
        return res.sendStatus(403);
      }
    }
  };
  
module.exports = {generateAccessToken,authenticateToken}