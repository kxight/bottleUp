const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedInUserDetails,
  changePassword
} = require("../controllers/userController");
const { isLoggedIn } = require("../middlewares/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/changepassword").post(isLoggedIn, changePassword);


module.exports = router;
