const mongoose = require("mongoose");
const diarySchema = new mongoose.Schema({
  content: { type: String, required: true },
  mood: {
    type: String,
    enum: [
      "happy",
      "sad",
      "bored",
      "calm",
      "stressed",
      "worried",
      "tired",
      "excited",
    ],
    // required: [true, "Please select your mood"],
    required: true,
    default: "happy",
  },
  isPublic: { type: Boolean, required: true, default: false },
  comments: [
    {
      user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
      body: { type: String, required: true },
      date: Date,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
  //   photos: [
  //     {
  //       id: { type: String, required: true },
  //       secure_url: { type: String, required: true },
  //     },
  //   ],
});

module.exports = mongoose.model("Diary", diarySchema);
