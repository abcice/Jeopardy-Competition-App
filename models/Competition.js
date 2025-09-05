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
  // Reference to the Jeopardy document
  jeopardy: { type: mongoose.Schema.Types.ObjectId, ref: "Jeopardy", required: true },
  teams: [teamSchema],
  status: { type: String, enum: ["pending", "running", "finished"], default: "pending" },
  // Current question ObjectId inside the Jeopardy document
  currentQuestion: { type: mongoose.Schema.Types.ObjectId, default: null },
    answeredQuestions: [{ type: mongoose.Schema.Types.ObjectId }], // ✅ new
    round: { type: Number, default: 1 },
    joinCode: { type: String, unique: true, required: true }, // ✅ add this

}, { timestamps: true });

export default mongoose.model("Competition", competitionSchema);
