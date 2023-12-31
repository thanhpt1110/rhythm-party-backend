const express = require('express')
require('dotenv').config();
const router = express.Router()
const {getMusicByID,findMusicByNamePublic,getTopMusic,uploadMusic
    ,updateMusicPrivacyStatus
    ,getMusicCurrentUser,updateMusicInformation,listenMusic
    ,musicMessageUpload,deleteMusicById} = require('../../controller/controllerClient/musicClientController')
const {authenticateToken} = require('../../authentication/jwtAuth')
router.route('/').post(authenticateToken,uploadMusic).get(authenticateToken,getMusicCurrentUser);
router.route('/search').get(findMusicByNamePublic);
router.route('/top-music').get(getTopMusic)
router.route('/update-music-privacy').put(authenticateToken,updateMusicPrivacyStatus)
router.route('/user/:user_id');
router.route('/listen/:id').get(listenMusic)
router.route('/:id').get(getMusicByID).put(authenticateToken,updateMusicInformation).delete(authenticateToken,deleteMusicById);
router.route('/music-message/:id').post(authenticateToken,musicMessageUpload);
module.exports = router;
