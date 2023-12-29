const express = require('express')
const router = express.Router();
const {getAllPlaylist, searchPlaylist} = require('../../controller/controllerAdmin/playlistAdminController')
const {authenticateToken} = require('../../authentication/jwtAuth');
// GET: Lấy toàn bộ playlist ra 
router.route('/').get(authenticateToken, getAllPlaylist);
// GET: Search thông tin playlist
router.route('/search').get(authenticateToken, searchPlaylist);
module.exports = router;