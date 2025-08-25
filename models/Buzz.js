import mongoose from "mongoose";

const buzzSchema = new mongoose.Schema({
  competition: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true },
  teamId:      { type: mongoose.Schema.Types.ObjectId, required: true },  // references team inside competition
  questionId:  { type: mongoose.Schema.Types.ObjectId, required: true },  // references question inside jeopardy
  timestamp:   { type: Date, default: Date.now }
});


export default mongoose.model("Buzz", buzzSchema);
