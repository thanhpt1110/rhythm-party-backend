const express = require('express')
const router = express.Router()
const {authenticateToken} = require('../authentication/jwtAuth')
const {createPlaylist,getPlaylistByID
    ,getPlaylistFromCurrentUser
    ,updatePlaylistMusicInfomation
    ,searchPublicMusicPlaylistByName
    ,getMostFamousPlaylist} = require('../controller/playlistController')
router.route('/').post(authenticateToken,createPlaylist)
.get(authenticateToken,getPlaylistFromCurrentUser)
router.route('/search').get(searchPublicMusicPlaylistByName)
router.route('/:id').get(getPlaylistByID).put(authenticateToken,updatePlaylistMusicInfomation);
router.route('/topMusic').get(getMostFamousPlaylist)
module.exports = router