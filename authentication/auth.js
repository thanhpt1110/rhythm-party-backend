const passport = require('passport')
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const User = require('../model/UserModel')
const asyncHandler = require('express-async-handler')
const UserTable = require('../entity/UserTable')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt')
require('dotenv').config();
passport.use(new GoogleStrategy({
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
            console.log("first Create")
            done(null,user)
        }
        else{
            done(null,existingUser);
        }
    }
    catch(Exception)
    {
        console.log(Exception)
        done(null,profile)
    }
  })
));
passport.use(UserTable.ROLE_USER,new LocalStrategy(
    asyncHandler( async function(username, password, done) {
        const existingUser = await User.findOne({username: username, accountType: UserTable.TYPE_LOCAL_ACCOUNT});
        console.log(existingUser)   
        if(existingUser&& (await bcrypt.compare(password, existingUser.password)))
            return done(null, existingUser)
        else
            return done(null,false)
    }
  )));
  passport.use(UserTable.ROLE_ADMIN,new LocalStrategy(
    asyncHandler( async function(username, password, done) {
        const existingUser = await User.findOne({username: username, accountType: UserTable.TYPE_LOCAL_ACCOUNT,role: UserTable.ROLE_ADMIN});
        console.log(existingUser)   
        if(existingUser&& (await bcrypt.compare(password, existingUser.password)))
            return done(null, existingUser)
        else
            return done(null,false)
    }
  )));
passport.serializeUser((user,done)=>{
    done(null,user)
})
passport.deserializeUser((user,done)=>{
    done(null,user)
})