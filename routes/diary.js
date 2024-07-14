const express = require("express");
const router = express.Router();

const {
  testDiary,
  addDiary,
  getAllDiary,
//   getDiary,
} = require("../controllers/diaryController");
const { isLoggedIn } = require("../middlewares/user");

// guest route
router.route("/testDiary").get(testDiary);
router.route("/diary/all").get(getAllDiary);

// logged in user route
router.route("/diary").post(isLoggedIn, addDiary);
// router.route("/diary/:diaryId").get(isLoggedIn, getDiary);
// router.route("/diary/all/:userId").get(isLoggedIn, )

module.exports = router;
