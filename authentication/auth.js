const passport = require('passport')
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const User = require('../model/UserModel')
const asyncHandler = require('express-async-handler')
const UserTable = require('../entity/UserTable')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {generateAccessToken} = require('../authentication/jwtAuth.js')
require('dotenv').config();
const authClientWeb = new passport.Passport();
const authAdminWeb = new passport.Passport();

authClientWeb.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `http://localhost:${process.env.PORT}/auth/google/callback`,
    passReqToCallback   : true
  },
  asyncHandler (async function(request, accessToken, refreshToken, profile, done) {
    try{
        const existingUser = await User.findOne({ googleID: profile.id , accountType: UserTable.TYPE_GOOGLE});
        if(existingUser===null)
        {
            const user = await User.create({
                googleID: profile.id,
                displayName: profile.displayName,
                email: profile.email,
                avatar: profile.picture,
                accountType: UserTable.TYPE_GOOGLE,
                gender: null,
                role: UserTable.ROLE_USER
            })
            const userData = {
                displayName: user.displayName,
                gender: user.gender,
                birthday: user.birthday,
                avatar: user.avatar,
                role: user.role,
                _id: user._id,
                email: user.email
            }
            const refreshToken = jwt.sign(userData, process.env.REFRESH_TOKEN_SECRET)
            const userRespone = {
                user: userData,
                refreshToken: refreshToken,
                accessToken: generateAccessToken(userData)
            }
            done(null,userRespone)
        }
        else{
            const userData = {
                displayName: existingUser.displayName,
                gender: existingUser.gender,
                birthday: existingUser.birthday,
                avatar: existingUser.avatar,
                role: existingUser.role,
                _id: existingUser._id,
                email: existingUser.email
            }
            const accessToken = generateAccessToken(userData)
            const refreshToken = jwt.sign(userData, process.env.REFRESH_TOKEN_SECRET)
            await User.updateOne({ _id: existingUser._id }, { $set: { refreshToken: refreshToken } });
            const userRespone = {
                user: userData,
                refreshToken: refreshToken,
                accessToken: accessToken
            }
            done(null,userRespone)
        }
    }
    catch(Exception)
    {
        done(null,false)
    }
  })
));
authClientWeb.use(UserTable.ROLE_USER,new LocalStrategy(
    asyncHandler( async function(username, password, done) {
        try{
            const existingUser = await User.findOne({username: username, accountType: UserTable.TYPE_LOCAL_ACCOUNT}); 
            if(existingUser&& (await bcrypt.compare(password, existingUser.password)))
            {
                const userData = {
                    displayName: existingUser.displayName,
                    gender: existingUser.gender,
                    birthday: existingUser.birthday,
                    avatar: existingUser.avatar,
                    role: existingUser.role,
                    _id: existingUser._id,
                    email: existingUser.email
                }
                const refreshToken = jwt.sign(userData, process.env.REFRESH_TOKEN_SECRET)
                await User.updateOne({ _id: existingUser._id }, { $set: { refreshToken: refreshToken } });
                const userRespone = {
                    user: userData,
                    refreshToken: refreshToken,
                    accessToken: generateAccessToken(userData)
                }
                return done(null,userRespone);
            }
            else
                return done(null,false)
        }
        catch(e)
        {
            return done(null,false)
        }
    }   
  )));
  authAdminWeb.use(UserTable.ROLE_ADMIN,new LocalStrategy(
    asyncHandler( async function(username, password, done) {
        try{
            const existingUser = await User.findOne({username: username, accountType: UserTable.TYPE_LOCAL_ACCOUNT,role: UserTable.ROLE_ADMIN});  
            if(existingUser&& (await bcrypt.compare(password, existingUser.password)))
             {
                const userData = {
                    displayName: existingUser.displayName,
                    gender: existingUser.gender,
                    birthday: existingUser.birthday,
                    avatar: existingUser.avatar,
                    role: existingUser.role,
                    _id: existingUser._id,
                    email: existingUser.email
                }
                const refreshToken = jwt.sign(userData, process.env.REFRESH_TOKEN_SECRET)
                await User.updateOne({ _id: existingUser._id }, { $set: { refreshToken: refreshToken } });
                const userRespone = {
                    user: userData,
                    refreshToken: refreshToken,
                    accessToken: generateAccessToken(userData)
                }
                return done(null,userRespone);
             }
            else
                return done(null,false)
        }
        catch(e)
        {
            return done(null,false);
        }
    }
  )));
authClientWeb.serializeUser((user,done)=>{
    done(null,user)
})
authClientWeb.deserializeUser((user,done)=>{
    done(null,user)
})
authAdminWeb.serializeUser((user,done)=>{
    done(null,user)
})
authAdminWeb.deserializeUser((user,done)=>{
    done(null,user)
})
module.exports = {authAdminWeb, authClientWeb}