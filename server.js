import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { Comment } from "./src/comments.model.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

// Database connection for serverless
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URL);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome", data: null });
});

app.get("/comments", async (req, res) => {
  try {
    await connectToDatabase();
    const comments = await Comment.find().sort({ createdAt: 1 });
    return res
      .status(200)
      .json({ message: "Comment fetched successfully!", data: comments });
  } catch (error) {
    return res.status(500).json({ message: error.message, data: null });
  }
});

app.post("/comments", async (req, res) => {
  try {
    await connectToDatabase();
    const { content, author, parentId } = req.body;
    let level = 0;

    if (parentId) {
      const parent = await Comment.findById(parentId);
      console.log("parent", parent);

      if (!parent) {
        return res.status(404).json({ error: "Parent comment not found!" });
      }
      level = parent.level + 1;
      console.log("level", level);

      if (level > 3) {
        return res.status(400).json({ error: "Max 3 level allowed!" });
      }
    }

    await Comment.findByIdAndUpdate(parentId, {
      $inc: {
        level: 1
      }
    });

    const comment = new Comment({ content, author, parentId, level });
    await comment.save();
    return res
      .status(201)
      .json({ message: "Comment created successfully!", data: comment });
  } catch (error) {
    return res.status(500).json({ message: error.message, data: null });
  }
});

app.patch("/comments/:id/vote", async (req, res) => {
  try {
    await connectToDatabase();
    const { delta } = req.body;
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { $inc: { votes: delta } },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Voted successfully!", data: comment });
  } catch (error) {
    return res.status(500).json({ message: error.message, data: null });
  }
});

app.delete("/comments/:id", async (req, res) => {
  try {
    await connectToDatabase();
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, content: "" },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Deleted successfully!", data: comment });
  } catch (error) {
    return res.status(500).json({ message: error.message, data: null });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 8000, () => {
    console.log("Server run on 8080");
  });
}

// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => {
//     console.log("DB connected successfully");

//   })
//   .catch((e) => {
//     console.log("Error while connecting db", e);
//   });

export default app;
