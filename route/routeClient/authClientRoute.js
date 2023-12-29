const express = require('express')
const router = express.Router();
require('dotenv').config();
const { authClientWeb} = require('../../authentication/auth.js')
const {isLoggedIn, isSuccessLogin, isFailureLogin, Logout} = require('../../authentication/authController.js')
const {loginUser} = require('../../controller/controllerClient/authClientController.js')
const CLIENT_URL = process.env.CLIENT_URL;
router.route('/google').get(  
    authClientWeb.authenticate('google', { scope:
    [ 'email', 'profile' ] }
    ));
router.route('/google/callback').get(authClientWeb.authenticate( 'google', {
    successRedirect: CLIENT_URL,
    failureRedirect: '/auth/failure'
}));
router.post('/login', loginUser);
router.route('/success').get(isLoggedIn,isSuccessLogin)
router.route('/failure').get(isFailureLogin)
router.route('/logout').get(Logout);
module.exports = router;