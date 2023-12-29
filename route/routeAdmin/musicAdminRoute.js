const express = require('express')
const router = express.Router()
const {getMusicUnauthentication, updateMusicInformationAdmin
    ,getAllMusic, searchUnauthenticatedMusic, searchAllMusic} = require('../../controller/controllerAdmin/musicAdminController')
const {authenticateToken} = require('../../authentication/jwtAuth');
// GET: Lấy thông tin tất cả bài hát
router.get('/').get(authenticateToken,getAllMusic);
// GET: lấy thông tin tất cả bài hát chưa được kiểm duyệt 
router.route('/music-unauthentication').get(authenticateToken,getMusicUnauthentication)
// GET: Tìm các bài hát chưa được kiểm duyêt 
router.route('/music-unauthentication/search').get(authenticateToken,searchUnauthenticatedMusic) 
// GET: Tìm tất cả bài hát 
router.route('/search').get(authenticateToken,searchAllMusic)
// PUT: Update nhạc với 1 tham số thay đổi bất kỳ của bài hát đó
router.route('/:id').put(authenticateToken,updateMusicInformationAdmin) 
module.exports = router