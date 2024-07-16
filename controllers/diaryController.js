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

exports.getDiaryFeed = BigPromise(async (req, res, next) => {
  const currentUser = req.user;
  const page = parseInt(req.query.page) || 1; 
  const resultPerPage = 2;
  const totalDiaryNumber = await Diary.countDocuments();

  const matchStage = { $match: { isPublic: true } };

  if (currentUser) {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    matchStage.$match.$or = [
      { user: { $ne: currentUser._id } },
      { user: currentUser._id, createdAt: { $lte: threeDaysAgo } }
    ];
  }

  const sortStage = {
    $sort: {
      isMine: -1, // Prioritize user's diaries by setting isMine to 1
      createdAt: -1 // Sort by createdAt descending for all diaries
    }
  };

  const projectStage = {
    $project: {
      isMine: { $eq: ['$user', currentUser._id] },
      // Include all other fields
      _id: 1,
      content: 1,
      mood: 1,
      isPublic: 1,
      user: 1,
      numberOfComments: 1,
      comments: 1,
      createdAt: 1,
      updatedAt: 1
    }
  };

  const diaries = await Diary.aggregate([
    matchStage,
    projectStage,
    sortStage,
    {
      $facet: {
        totalData: [
          { $skip: (page - 1) * resultPerPage },
          { $limit: resultPerPage }
        ],
        totalCount: [{ $count: 'total' }]
      }
    }
  ]);

  res.status(200).json({
    success: true,
    diaries: diaries[0].totalData,
    filterdDiaryNumber: diaries[0].totalCount[0].total,
    totalDiaryNumber,
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

exports.addComment = BigPromise(async (req, res, next) => {
  const { content } = req.body;
  const diaryId = req.params.id;

  const comment = {
    user: req.user._id,
    comment: content,
  };

  let diary;

  if (diaryId.match(/^[0-9a-fA-F]{24}$/)) {
    diary = await Diary.findById(diaryId);
  }

  if (!diary) {
    return next(new CustomError("No diary found with this id.", 401));
  }

  diary.comments.push(comment);
  diary.numberOfComments = diary.comments.length;

  await diary.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    diary,
  });
});

exports.deleteComment = BigPromise(async (req, res, next) => {
  const { id, commentId } = req.params;

  let diary;

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    diary = await Diary.findById(id);
  }

  if (!diary) {
    return next(new CustomError("No diary found with this id.", 401));
  }

  const comments = diary.comments.filter(
    (cmt) => cmt._id.toString() !== commentId.toString()
  );

  const numberOfComments = comments.length;

  // update the diary
  await Diary.findByIdAndUpdate(
    id,
    {
      comments,
      numberOfComments,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModiry: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "comment deleted.",
  });
});

//   exports.getOnlyCommentForOneDiary = BigPromise(async(req, res, next) => {
//     const diary = await Diary.findById(req.query.id)

//     res.status(200).json({
//         success: true,
//         comments: diary.comments,
//     })
//   })

// // // Add and delete a comment in case user can only comment once.
// exports.addComment = BigPromise(async (req, res, next) => {
//   const { content } = req.body;

//   const comment = {
//     user: req.user._id,
//     comment: content,
//   };

//   const diary = await Diary.findById(req.params.id);

//   const alreadyComment = diary.comments.find(
//     (rev) => rev.user.toString() === req.user._id.toString()
//   );

//   if (alreadyComment) {
//     diary.comments.forEach((comment) => {
//       if (comment.user.toString() === req.user._id.toString()) {
//         comment.comment = content;
//       }
//     });
//   } else {
//     diary.comments.push(comment);
//     diary.numberOfComments = diary.comments.length;
//   }

//   await diary.save({ validateBeforeSave: false });

//   res.status(200).json({
//     success: true,
//     diary,
//   });
// });

// exports.deleteComment = BigPromise(async (req, res, next) => {
//   const { diaryId } = req.query;

//   const diary = await Diary.findById(diaryId);

//   const comments = diary.comments.filter(
//     (rev) => rev.user.toString() !== req.user._id.toString()
//   );

//   const numberOfComments = comments.length;

//   // update the diary
//   await Diary.findByIdAndUpdate(
//     diaryId,
//     {
//       comments,
//       numberOfComments,
//     },
//     {
//       new: true,
//       runValidators: true,
//       useFindAndModiry: false,
//     }
//   );

//   res.status(200).json({
//     success: true,
//   });
// });
