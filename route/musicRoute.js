const express = require('express')
const router = express.Router()
const {getMusicByID,findMusicByNamePublic,findMusicByNameWithUser,uploadMusic
    ,updateMusicPrivacyStatus
    ,updateMusicAuthorization,getMusicUnauthentication
    ,getMusicCurrentUser} = require('../controller/musicController')
router.route('/search').get(findMusicByNamePublic);
router.route('/:id').get(getMusicByID);
router.route('/user/:user_id').get(findMusicByNameWithUser);
router.route('/').post(uploadMusic).get(getMusicCurrentUser);
router.route('/update_music_privacy').put(updateMusicPrivacyStatus)
router.route('/update_music_authentication').put(updateMusicAuthorization)
router.route('/admin/get_music_unauthentication').get(getMusicUnauthentication)
module.exports = router;
