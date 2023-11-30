const {getUser, getUserByID,updateUserById, createNewAccount} = require('../controller/userController')
const express = require('express')
const router = express.Router()
const User = require('../model/UserModel')
const jwt = require('jsonwebtoken')
const {authenticateToken} = require('../authentication/jwtAuth')
router.route("/").get(authenticateToken,getUser).post(createNewAccount);
router.route("/:id").get(getUserByID).put(updateUserById);
module.exports = router;
