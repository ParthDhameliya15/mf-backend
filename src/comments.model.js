import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },
    level: {
      type: Number,
      default: 0
    },
    votes: {
      type: Number,
      default: 0
    },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

export const Comment = mongoose.model("Comment", commentSchema);
