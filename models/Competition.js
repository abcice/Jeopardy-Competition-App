const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true }, // "Red", "Team 1", etc.
  color: { type: String },                // only if using colors
  number: { type: Number },               // only if using numbers
  score: { type: Number, default: 0 },
  members: [{ 
    identifier: String,  // "Red", "Blue", "1", "2"
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

module.exports = mongoose.model("Competition", competitionSchema);
