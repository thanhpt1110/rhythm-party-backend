const express = require('express')
const router = express.Router();
const { getAllUser,
    searchUser,
    getUserByID,
    updateUserAccount,
    createUserAccount,
    deleteUserById,
    deleteUserListByIdList,
} = require('../../controller/controllerAdmin/userAdminController')
const { authenticateToken } = require('../../authentication/jwtAuth');

// GET: Lấy thông tin tất cả người dùng nếu để mặc định thì lấy 50 người 
router.route('/').get(authenticateToken, getAllUser)
    .post(authenticateToken, createUserAccount)
    .put(authenticateToken, deleteUserListByIdList)

// GET: Search thông tin người dùng nếu để mặc định thì lấy 50 người.
router.route('/search').get(authenticateToken, searchUser);


// GET: lấy thông tin người dùng thông qua mã người dùng
// PUT: cập nhật thông tin của người dùng đó 
router.route('/:id').get(authenticateToken, getUserByID)
    .put(authenticateToken, updateUserAccount)
    .delete(authenticateToken, deleteUserById);
module.exports = router 