require('dotenv').config();
const CLIENT_URL = process.env.CLIENT_URL;
const isLoggedIn = (req,res,next)=>{
    req.user ? next(): res.sendStatus(401);
}
const isAuthenticatedCallBack = ()=>{}
const isSuccessLogin = (req,res)=>{
    if(req.isAuthenticated()){
      //console.log(req)
        res.status(200).json({
          success: true,
          message: "Sucesss",
          user: req.user
        })
    }
}
const isFailureLogin = (req,res)=>{
    res.status(401).json({
      success: false,
      message: 'failure'
    })
    //res.redirect(CLIENT_URL)
};
const Logout = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.session.destroy((err) => {
        if (err) {
          console.error(err);
        }
        res.status(200).json({
          success: true,
          message: "Success"
        });
      });
    });

  } else {
    res.status(401).json({
      success: false,
      message: "User not authenticated"
    });
  }
};

  module.exports = {isLoggedIn, isAuthenticatedCallBack, isSuccessLogin, isFailureLogin, Logout};