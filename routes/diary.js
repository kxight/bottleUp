const express = require('express');
const router = express.Router();

const {testDiary} = require('../controllers/diaryController')

router.route('/testDiary').get(testDiary)

module.exports = router