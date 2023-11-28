const {getUser, getUserByID,updateUserById, createNewAccount} = require('../controller/userController')
const express = require('express')
const router = express.Router()

router.route("/").get(getUser).post(createNewAccount);
router.route("/:id").get(getUserByID).put(updateUserById);
module.exports = router;