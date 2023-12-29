const UserTable = require('../../entity/UserTable.js')
const {authAdminWeb} = require('../../authentication/auth.js')
const LoginAdmin = (req, res, next) => {
    authAdminWeb.authenticate(UserTable.ROLE_ADMIN, (err, user, info) => {
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
}
module.exports = {LoginAdmin}