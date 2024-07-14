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

exports.getDiary = BigPromise(async (req, res, next) => {
  const diaryId = req.params.id;
  let diary;

  if (diaryId.match(/^[0-9a-fA-F]{24}$/)) {
    diary = await Diary.findById(diaryId);
  }

  if (!diary) {
    return next(new CustomError("No product found with this id.", 401));
  }

  res.status(200).json({
    success: true,
    diary,
  });
});

exports.updateDiary = BigPromise(async (req, res, next) => {
  const diaryId = req.params.id;
  let diary;

  if (diaryId.match(/^[0-9a-fA-F]{24}$/)) {
    diary = await Diary.findById(diaryId);
  }

  if (!diary) {
    return next(new CustomError("No diary found with this id.", 401));
  }

  req.body.updatedAt = new Date();

  diary = await Diary.findByIdAndUpdate(diaryId, req.body, {
    new: true,
    runValidators: true,
    useFindAndModiry: false,
  });

  res.status(200).json({
    success: true,
    diary,
  });
});

exports.deleteDiary = BigPromise(async (req, res, next) => {
  const diaryId = req.params.id;
  let diary;

  if (diaryId.match(/^[0-9a-fA-F]{24}$/)) {
    diary = await Diary.findById(diaryId);
  }

  if (!diary) {
    return next(new CustomError("No diary found with this id.", 401));
  }

  diary = await Diary.findByIdAndDelete(diaryId);

  res.status(200).json({
    success: true,
    message: "diary was deleted.",
    diary,
  });
});
