const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const JWT = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  //   const token =
  //     req.cookies.token || req.headers.Authorization.replace("Bearer ", "");

  const token = null;
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.Authorization) {
    token = req.headers.Authorization.replace("Bearer ", "");
  }

  if (!token) {
    return next(new CustomError("Please login to access this route", 401));
  }

  const decoded = JWT.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id);

  next();
});
