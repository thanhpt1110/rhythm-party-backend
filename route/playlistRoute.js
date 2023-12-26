const express = require('express')
const router = express.Router()
const {authenticateToken} = require('../authentication/jwtAuth')
const {createPlaylist,getPlaylistByID
    ,getPlaylistFromCurrentUser
    ,updatePlaylistMusicInfomation
    ,searchPublicMusicPlaylistByName
    ,getMostFamousPlaylist,addNewSongToPlaylist, removeSongFromPlaylist} = require('../controller/playlistController')
router.route('/').post(authenticateToken,createPlaylist)
.get(authenticateToken,getPlaylistFromCurrentUser)
router.route('/search').get(searchPublicMusicPlaylistByName)
router.route('/top-playlist').get(getMostFamousPlaylist)
router.route('/add-music/:id').put(authenticateToken,addNewSongToPlaylist);
router.route('/remove-music/:id').put(authenticateToken,removeSongFromPlaylist);
router.route('/:id').get(getPlaylistByID).put(authenticateToken,updatePlaylistMusicInfomation);
module.exports = router