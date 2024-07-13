const Diary = require("../models/diary");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");

exports.testDiary = async (req, res) => {
  console.log(req.query);
  res.status(200).json({
    success: true,
    greeting: "this is test for diary",
  });
};

exports.addDiary = BigPromise(async (req, res, next) => {
  req.body.user = req.user.id;

  const diary = await Diary.create(req.body);

  res.status(200).json({
    success: true,
    diary,
  });
});


