const {getYourProfileUser,createAdminAccount, getUserByID,updateUserById
    , createNewAccount
    ,searchUserByNameAdmin,getListUser} = require('../../controller/controllerClient/userClientController')
const express = require('express')
const router = express.Router()
const {authenticateToken} = require('../../authentication/jwtAuth')
router.route('/profile').get(authenticateToken,getYourProfileUser);
router.route('/admin-search').get(authenticateToken,searchUserByNameAdmin)
router.route('/admin').get(authenticateToken,getListUser).post(authenticateToken,createAdminAccount);
router.route("/").post(createNewAccount);
router.route("/:id").get(getUserByID).put(updateUserById);

module.exports = router;
