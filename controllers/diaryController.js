const Diary = require("../models/diary");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const WhereClause = require("../utils/whereClause");

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

exports.getAllDiary = BigPromise(async (req, res, next) => {
  const resultPerPage = 2;
  const totalDiaryNumber = await Diary.countDocuments();

  const diariesObj = new WhereClause(Diary.find(), req.query).search().filter();

  let diaries = await diariesObj.base;
  const filterdDiaryNumber = diaries.length;

  diariesObj.pager(resultPerPage);
  diaries = await diariesObj.base.clone();

  res.status(200).json({
    success: true,
    diaries,
    filterdDiaryNumber,
    totalDiaryNumber,
  });
});

// exports.getDiary = BigPromise(async (req, res, next) => {
//     const params = req.params
//     console.log(params)
//     res.status(200).json({
//         success: true,
//         product
//     })
// })
