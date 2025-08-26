import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  points: { type: Number, required: true },
  dailyDouble: { type: Boolean, default: false },
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  questions: [questionSchema],
});

const jeopardySchema = new mongoose.Schema({
  title: { type: String, required: true },
  categories: [categorySchema],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Jeopardy", jeopardySchema);
