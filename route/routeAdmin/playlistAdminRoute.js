const express = require('express')
const router = express.Router();
const {getAllPlaylist, searchPlaylist, getPlaylistByID,removeSongFromPlaylist, updatePlaylistByID, deletePlaylistById} = require('../../controller/controllerAdmin/playlistAdminController')
const {authenticateToken} = require('../../authentication/jwtAuth');
// GET: Lấy toàn bộ playlist ra 
router.route('/').get(authenticateToken, getAllPlaylist);
// GET: Search thông tin playlist
router.route('/search').get(authenticateToken, searchPlaylist);
router.route('/remove-music/:id').put(authenticateToken,removeSongFromPlaylist);
router.route('/:id').get(authenticateToken,getPlaylistByID).put(authenticateToken,updatePlaylistByID)
.delete(authenticateToken,deletePlaylistById);
module.exports = router;