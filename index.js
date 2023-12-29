require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const adminApp= express()
const url = process.env.CONNECTION_STRING
const port = process.env.PORT
const passport = require('passport')
const session = require('express-session')
const http = require('http');
const {Server} = require('socket.io')
const cors = require('cors')
const errorHandler = require('./middleware/errorHandler.js')
const {socketInit} = require('./middleware/socketIO.js')
require('./authentication/auth.js')
app.use(cors({
    origin: 'http://localhost:3000',
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}))
app.use(express.json());
app.use(errorHandler);
app.use(session({
    secret: '2',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60*60*1000 }
  }))
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
  });
app.use('/auth',require('./route/authRoute.js'))
app.use('/api/user',require('./route/userRoute.js'))
app.use('/api/music',require('./route/musicRoute.js'))
app.use('/api/genre',require('./route/genreRoute.js'))
app.use('/api/playlist',require('./route/playlistRoute.js'))
const connect = async ()=>{
    try{
        await mongoose.connect(url)
        console.log('Connect to mongoDB')
    }
    catch(error){
        console.log(error)
    }   
}
connect();
const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin: 'http://localhost:3000',
        methods: ['GET','POST']
    }
})
socketInit(io)
server.listen(port,()=>{console.log(`server run on port ${port}`)})
