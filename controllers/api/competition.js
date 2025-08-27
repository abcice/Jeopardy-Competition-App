import Competition from '../../models/Competition.js';
import Jeopardy from '../../models/Jeopardy.js';
import Buzz from '../../models/Buzz.js';
// List all competitions


export async function index(req, res) {
    try {
        const competitions = await Competition.find({}).populate('jeopardy').exec();
    // Include currentQuestion details for each competition
    const competitionsWithCurrent = competitions.map((comp) => {
      let currentQuestionDetails = null;
      if (comp.currentQuestion) {
        for (const category of comp.jeopardy.categories) {
          const q = category.questions.id(comp.currentQuestion);
          if (q) {
            currentQuestionDetails = q;
            break;
          }
        }
      }
      return {
        ...comp.toObject(),
        currentQuestionDetails,
      };
    });

    res.status(200).json(competitionsWithCurrent);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}
// Show one competition
export async function show(req, res) {
  try {
    const competition = await Competition.findById(req.params.id).populate('jeopardy').exec();
    if (!competition) return res.status(404).json({ msg: "Competition not found" });

    // Extract current question details from Jeopardy
    let currentQuestionDetails = null;
    if (competition.currentQuestion) {
      for (const category of competition.jeopardy.categories) {
        const q = category.questions.id(competition.currentQuestion);
        if (q) {
          currentQuestionDetails = q;
          break;
        }
      }
    }

    res.status(200).json({ competition, currentQuestionDetails });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}
// Create a new competition

export async function create(req, res) {
    try {
        const competition = await Competition.create({
                  jeopardy: req.body.jeopardyId,
                  status: "pending",
                  teams: []
        });

        res.status(201).json(competition);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
}

// Add a team

export async function addTeam(req, res) {
    try{
        const competition  = await Competition.findById(req.params.id);
        competition.teams.push({
                  name: req.body.name,
                  color: req.body.color,
                  number: req.body.number
        });
            await competition.save();
            res.status(200).json(competition);

    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
}
// Update team score

export async function updateTeamScore(req, res) {
    try {
            const competition = await Competition.findById(req.params.id);
            const team = competition.teams.id(req.body.teamId);
            team.score += req.body.points;
            await competition.save();
            res.status(200).json(competition);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }

    
}
// Set current question

export async function setCurrentQuestion(req, res) {
    try{
        const competition = await Competition.findById(req.params.id);
        competition.currentQuestion = req.body.questionId;
        await competition.save();
        res.status(200).json(competition);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
}
// Record a buzz (optional, if you want REST buzz logging)
export async function recordBuzz(req, res) {
  try {
    const buzz = await Buzz.create({
      competition: req.params.id,
      teamId: req.body.teamId,
      questionId: req.body.questionId
    });
    res.status(201).json(buzz);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}
// updateStatus

export async function updateStatus(req, res) {
    try{
        const competition = await Competition.findById(req.params.id);
        if (!competition) {
            return res.status(404).json({ msg: "Competition not found" });
        }
        if (!req.body.status) {
            return res.status(400).json({ msg: "Status is required" });
        }
        competition.status = req.body.status;

        await competition.save();

        res.status(200).json(competition);

    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
}

// markCorrect
export async function markCorrect(req, res) {
  try {
    const competition = await Competition.findById(req.params.id).populate('jeopardy');
    if (!competition) {
      return res.status(404).json({ msg: "Competition not found" });
    }

    // Must have a current question
    if (!competition.currentQuestion) {
      return res.status(400).json({ msg: "No current question is set" });
    }

    const { teamId, bid } = req.body; // bid = only used if Daily Double
    if (!teamId) {
      return res.status(400).json({ msg: "Team ID is required" });
    }

    const team = competition.teams.id(teamId);
    if (!team) {
      return res.status(404).json({ msg: "Team not found" });
    }

    // Find the question inside Jeopardy
    let question = null;
    for (const category of competition.jeopardy.categories) {
      const q = category.questions.id(competition.currentQuestion);
      if (q) {
        question = q;
        break;
      }
    }
    if (!question) {
      return res.status(404).json({ msg: "Question not found in Jeopardy" });
    }

    // ✅ Handle Daily Double
    if (question.dailyDouble) {
      if (typeof bid !== "number" || bid <= 0) {
        return res.status(400).json({ msg: "Bid is required for Daily Double" });
      }
      if (bid > team.score) {
        return res.status(400).json({ msg: "Bid cannot exceed team score" });
      }
      team.score += bid * 2; // correct → double the bid
    } else {
      team.score += question.points;
    }

    // Mark question as answered (clear currentQuestion)
    competition.currentQuestion = null;

    await competition.save();

    res.status(200).json({ msg: "Answer marked correct", competition });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}


// markWrong (subtract bid if Daily Double)
export async function markWrong(req, res) {
  try {
    const competition = await Competition.findById(req.params.id).populate('jeopardy');
    if (!competition) {
      return res.status(404).json({ msg: "Competition not found" });
    }

    if (!competition.currentQuestion) {
      return res.status(400).json({ msg: "No current question is set" });
    }

    const { teamId, bid } = req.body;
    if (!teamId) {
      return res.status(400).json({ msg: "Team ID is required" });
    }

    const team = competition.teams.id(teamId);
    if (!team) {
      return res.status(404).json({ msg: "Team not found" });
    }

    // Find the question inside Jeopardy
    let question = null;
    for (const category of competition.jeopardy.categories) {
      const q = category.questions.id(competition.currentQuestion);
      if (q) {
        question = q;
        break;
      }
    }
    if (!question) {
      return res.status(404).json({ msg: "Question not found in Jeopardy" });
    }

    // Subtract bid points if it's a Daily Double
    if (question.dailyDouble) {
      if (typeof bid !== "number" || bid <= 0) {
        return res.status(400).json({ msg: "Bid is required for Daily Double" });
      }
      if (bid > team.score) {
        return res.status(400).json({ msg: "Bid cannot exceed team score" });
      }
      team.score -= bid; // subtract the bid
    }

    // Do NOT clear currentQuestion so teams can buzz again
    await competition.save();

    res.status(200).json({ msg: "Answer marked wrong, teams may buzz again", competition });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}


// skipQuestion
export async function skipQuestion(req, res) {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ msg: "Competition not found" });
    }

    if (!competition.currentQuestion) {
      return res.status(400).json({ msg: "No current question is set" });
    }

    // Clear current question (mark as used/skipped)
    competition.currentQuestion = null;

    await competition.save();

    res.status(200).json({ msg: "Question skipped", competition });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
}

// Delete competition
export async function deleteCompetition(req, res) {
  try {
    const competition = await Competition.findByIdAndDelete(req.params.id);
    if (!competition) {
      return res.status(404).json({ msg: "Competition not found" });
    }
    res.status(200).json({ msg: "Competition deleted successfully" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
}
