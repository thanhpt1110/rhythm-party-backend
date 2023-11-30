const express = require('express')
const router = express.Router()
const {authenticateToken} = require('../authentication/jwtAuth')
const {createPlaylist,getPlaylistByID
    ,getPlaylistFromCurrentUser
    ,updatePlaylistMusicInfomation
    ,searchPublicMusicPlaylistByName
    ,getMostFamous20Playlist} = require('../controller/playlistController')
router.route('/').post(authenticateToken,createPlaylist)
.get(authenticateToken,getPlaylistFromCurrentUser)
router.route('/search').get(searchPublicMusicPlaylistByName)
router.route('/:id').put(authenticateToken,updatePlaylistMusicInfomation);
router.route('/getTop20').get(getMostFamous20Playlist)
module.exports = router