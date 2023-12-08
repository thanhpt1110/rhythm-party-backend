const express = require('express')
const passport = require('passport')
const UserTable = require('../entity/UserTable.js')
const router = express.Router();
require('dotenv').config();
require('../authentication/auth.js')
const CLIENT_URL = process.env.CLIENT_URL;
const {isLoggedIn,isAuthenticatedCallBack, isSuccessLogin, isFailureLogin, Logout} = require('../controller/authController.js')
router.route('/google').get(
  passport.authenticate('google', { scope:
  [ 'email', 'profile' ] }
  ));
router.route('/google/callback').get(
  passport.authenticate( 'google', {
    successRedirect: CLIENT_URL,
    failureRedirect: '/auth/failure'
}));
router.post('/user/login', (req, res, next) => {
  passport.authenticate(UserTable.ROLE_USER, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Xử lý trường hợp thất bại
      return res.status(401).json({message: "Login failed"})
    }
    // Xử lý trường hợp thành công
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      console.log(user)
      return res.status(200).json({ success: true, message: 'Login successful', user: user });
    });
  })(req, res, next);
});

router.post("/admin/login",
passport.authenticate(UserTable.ROLE_ADMIN,{
  successRedirect: CLIENT_URL,
  failureRedirect: "/auth/failure"
}))
router.route('/success').get(isLoggedIn,isSuccessLogin)
router.route('/failure').get(isFailureLogin)
router.route('/logout').get(Logout);
module.exports = router;