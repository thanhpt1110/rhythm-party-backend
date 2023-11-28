const express = require('express')
const router = express.Router()
const {findGerne, get20MostFamousGerne} = require('../controller/genreController.js')
router.route('/search').get(findGerne)
router.route('/top20').get(get20MostFamousGerne)
module.exports=router