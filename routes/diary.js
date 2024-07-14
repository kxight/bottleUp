const express = require("express");
const router = express.Router();

const {
  testDiary,
  addDiary,
  getAllDiary,
  getDiary,
  updateDiary,
  deleteDiary,
} = require("../controllers/diaryController");
const { isLoggedIn } = require("../middlewares/user");

// guest route
router.route("/testDiary").get(testDiary);
router.route("/diary/all").get(getAllDiary);

// logged in user route
router.route("/diary").post(isLoggedIn, addDiary);

router
  .route("/diary/:id")
  .get(isLoggedIn, getDiary)
  .put(isLoggedIn, updateDiary)
  .delete(isLoggedIn, deleteDiary);
// router.route("/diary/all/:userId").get(isLoggedIn, )

module.exports = router;
