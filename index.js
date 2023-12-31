require('dotenv').config();
const mongoose = require('mongoose')
const URL = process.env.CONNECTION_STRING
const PORT = process.env.PORT
const ADMIN_PORT = process.env.ADMIN_PORT
const http = require('http');
const {Server} = require('socket.io')
const express = require('express')
const {socketInit} = require('./middleware/socketIO.js')
const cors = require('cors')
const session = require('express-session')
const errorHandler = require('./middleware/errorHandler.js')
const secretSessionKey = process.envSECRET_SESSION_KEY || "Hello world"
const {authClientWeb, authAdminWeb} = require('./authentication/auth.js')
const connect = async ()=>{
    try{
        await mongoose.connect(URL)
        console.log('Connect to mongoDB')
    }
    catch(error){
        console.log(error)
    }   
}
connect();
const clientApp = express()
clientApp.use(cors({
    origin: 'http://localhost:3000',
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}))
clientApp.use(express.json());
clientApp.use(errorHandler);
clientApp.use(session({
    secret: secretSessionKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60*60*1000 }
  }))
clientApp.use(authClientWeb.initialize())
clientApp.use(authClientWeb.session())
clientApp.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});
clientApp.use('/auth',require('./route/routeClient/authClientRoute.js'))
clientApp.use('/api/user',require('./route/routeClient/userRoute.js'))
clientApp.use('/api/music',require('./route/routeClient/musicRoute.js'))
clientApp.use('/api/genre',require('./route/routeClient/genreRoute.js'))
clientApp.use('/api/playlist',require('./route/routeClient/playlistRoute.js'))
clientApp.use('/api/room',require('./route/routeClient/roomRoute.js'))
const server = http.createServer(clientApp);
const io = new Server(server,{
    cors:{
        origin: 'http://localhost:3000',
        methods: ['GET','POST']
    }
})
socketInit(io)
server.listen(PORT,()=>{console.log(`server run on port ${PORT}`)})
// -----------------------------------------
// Admin app
const adminApp= express()
adminApp.use(cors({
    origin: 'http://localhost:3001',
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}))
adminApp.use(express.json());
adminApp.use(errorHandler);
adminApp.use(session({
    secret: secretSessionKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60*60*1000 }
  }))
adminApp.use(authAdminWeb.initialize())
adminApp.use(authAdminWeb.session())
adminApp.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
  });
adminApp.use('/auth',require('./route/routeAdmin/authAdminRoute.js'))
adminApp.use('/api/user',require('./route/routeAdmin/userAdminRoute.js'))
adminApp.use('/api/music',require('./route/routeAdmin/musicAdminRoute.js'))
adminApp.use('/api/playlist',require('./route/routeAdmin/playlistAdminRoute.js'))
const adminServer = http.createServer(adminApp);
adminServer.listen(ADMIN_PORT, () => {
    console.log(`Admin app server run on port ${ADMIN_PORT}`);
});