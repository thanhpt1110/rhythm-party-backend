const express = require('express')
require('dotenv').config();
const router = express.Router()
const {getMusicByID,findMusicByNamePublic,findMusicByNameWithUser,uploadMusic
    ,updateMusicPrivacyStatus
    ,updateMusicAuthorization,getMusicUnauthentication
    ,getMusicCurrentUser} = require('../controller/musicController')
const {authenticateToken} = require('../authentication/jwtAuth')

router.route('/search').get(findMusicByNamePublic);
router.route('/:id').get(getMusicByID);
router.route('/user/:user_id').get(findMusicByNameWithUser);
router.route('/').post(authenticateToken,uploadMusic).get(authenticateToken,getMusicCurrentUser);
router.route('/update_music_privacy').put(authenticateToken,updateMusicPrivacyStatus)
router.route('/update_music_authentication').put(authenticateToken,updateMusicAuthorization)
router.route('/admin/get_music_unauthentication').get(authenticateToken,getMusicUnauthentication)

module.exports = router;
