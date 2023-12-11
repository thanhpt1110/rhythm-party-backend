const express = require('express')
require('dotenv').config();
const router = express.Router()
const {getMusicByID,findMusicByNamePublic,getTopMusic,uploadMusic
    ,updateMusicPrivacyStatus
    ,updateMusicAuthorization,getMusicUnauthentication
    ,getMusicCurrentUser,updateMusicInformation,listenMusic} = require('../controller/musicController')
const {authenticateToken} = require('../authentication/jwtAuth')
router.route('/').post(authenticateToken,uploadMusic).get(authenticateToken,getMusicCurrentUser);
router.route('/search').get(findMusicByNamePublic);
router.route('/top-music').get(getTopMusic)
router.route('/update-music-privacy').put(authenticateToken,updateMusicPrivacyStatus)
router.route('/update-music-authentication').put(authenticateToken,updateMusicAuthorization)
router.route('/admin/get-music-unauthentication').get(authenticateToken,getMusicUnauthentication)
router.route('/user/:user_id');
router.route('/listen/:id').get(listenMusic)
router.route('/:id').get(getMusicByID).put(authenticateToken,updateMusicInformation);
module.exports = router;
