const express = require("express");
const router = express.Router();

const { testDiary, addDiary } = require("../controllers/diaryController");
const { isLoggedIn } = require("../middlewares/user");

router.route("/testDiary").get(testDiary);
router.route("/diary").post(isLoggedIn, addDiary);

module.exports = router;
