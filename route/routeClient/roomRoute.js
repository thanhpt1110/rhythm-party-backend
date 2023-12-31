const express = require('express')
require('dotenv').config();
const router = express.Router()
const {getRoomByID, postNewRoom, postNewMusicToRoomPlaylist, getCurrentRoomMusic
    , musicMessageUpload, removeMusicToRoomPlaylist} = require('../../controller/controllerClient/roomClientController')
const {authenticateToken} = require('../../authentication/jwtAuth')

router.route('/').get(authenticateToken, getCurrentRoomMusic).post(authenticateToken,postNewRoom);
router.route('/post-music/:id').put(authenticateToken,postNewMusicToRoomPlaylist);
router.route('/remove-music/:id').put(authenticateToken,removeMusicToRoomPlaylist);
router.route('/message/:id').put(authenticateToken, musicMessageUpload);
router.route('/:id').get(authenticateToken, getRoomByID);

module.exports = router;