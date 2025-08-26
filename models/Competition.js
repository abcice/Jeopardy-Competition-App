import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String },
  number: { type: Number },
  score: { type: Number, default: 0 },
  members: [{
    identifier: String,
    joinedAt: { type: Date, default: Date.now }
  }]
});

const competitionSchema = new mongoose.Schema({
  jeopardy: { type: mongoose.Schema.Types.ObjectId, ref: "Jeopardy" },
  teams: [teamSchema],
  status: { type: String, enum: ["pending", "running", "finished"], default: "pending" },
  currentQuestion: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  round: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.model("Competition", competitionSchema);
