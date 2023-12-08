const jwt = require('jsonwebtoken')
const User = require('../model/UserModel')
require('dotenv').config();

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' })
  }
const authenticateToken =  (req,res,next) =>{
  if(req.isAuthenticated())
  {
    const authHeader1 = req.headers['authorization']
    console.log(authHeader1)
      const authHeader = req.headers['authorization']
      console.log(authHeader)
      const token = authHeader && authHeader.split(' ')[1]
      if(token == null)
         return res.sendStatus(401)
      jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,  async (err, user)=>{
          if(err)
          {
              const refreshToken = req.user.refreshToken
              if (refreshToken == null) 
                  return res.sendStatus(401)
              const existingUser = await User.findOne({
              refreshToken: req.user.refreshToken,
              _id: req.user.user._id})
              if(existingUser === null)
              {
                return res.sendStatus(403)
              }           
              jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) 
                  return res.sendStatus(403)
                const accessToken = generateAccessToken(req.user.user)
                req.user.accessToken = accessToken
                console.log(accessToken)
                next()
              })
          }
          else
              next()
      })
  }
  else{
    return res.sendStatus(401);
  }
  }
module.exports = {generateAccessToken,authenticateToken}