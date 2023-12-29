const express = require('express')
const router = express.Router();
const {isLoggedIn, isSuccessLogin, isFailureLogin, Logout} = require('../../authentication/authController.js')
const {LoginAdmin} = require('../../controller/controllerAdmin/authAdminController.js')
// POST: Hàm đăng nhập dưới dạng admin
router.route('/login').post(LoginAdmin); 
// GET: Hàm kiểm tra đăng nhập thành công hay không
router.route('/success').get(isLoggedIn,isSuccessLogin) 
// GET: Khi đăng nhập thất bại
router.route('/failure').get(isFailureLogin) 
// GET: Hàm đăng xuất tài khoản
router.route('/logout').get(Logout); 
module.exports = router;