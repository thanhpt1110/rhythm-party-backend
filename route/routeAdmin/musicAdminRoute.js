const express = require('express')
const router = express.Router()
const { 
    getMusicUnauthentication, 
    searchUnauthenticatedMusic, 
    getAllMusic, 
    searchAllMusic, 
    updateMusicInformationAdmin, 
    deleteMusicByID,
    getMusicByID,
    approveSong,
    approveList,
    deleteList,
} = require('../../controller/controllerAdmin/musicAdminController')

const { authenticateToken } = require('../../authentication/jwtAuth');

// GET: lấy thông tin tất cả bài hát chưa được kiểm duyệt 
router.route('/music-unauthentication').get(authenticateToken, getMusicUnauthentication).put(authenticateToken, approveList)

// GET: Tìm các bài hát chưa được kiểm duyêt 
router.route('/music-unauthentication/search').get(authenticateToken, searchUnauthenticatedMusic)
router.route('/music-unauthentication/:id').put(authenticateToken,approveSong)
// GET: Lấy thông tin tất cả bài hát
router.route('/').get(authenticateToken, getAllMusic);

// GET: Tìm tất cả bài hát 
router.route('/search').get(authenticateToken, searchAllMusic)

// PUT: Update nhạc với 1 tham số thay đổi bất kỳ của bài hát đó
// GET: Lấy thông tin bản nhạc by ID
router.route('/:id').put(authenticateToken, updateMusicInformationAdmin)
    .get(authenticateToken, getMusicByID)
    .delete(authenticateToken, deleteMusicByID);

module.exports = router