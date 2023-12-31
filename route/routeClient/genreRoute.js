const express = require('express')
const router = express.Router()
const {findGerne, getMostFamousGerne} = require('../../controller/controllerClient/genreClientController.js')
router.route('/search').get(findGerne)
router.route('/').get(getMostFamousGerne)
module.exports=router