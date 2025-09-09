import express from "express";
import * as CompetitionController from "../../controllers/api/competition.js";
import checkPlayerToken from "../../config/checkPlayerToken.js";

const router = express.Router();

// ✅ All routes below require token
router.use(checkPlayerToken);

router.post("/:id/buzz", CompetitionController.recordBuzz);
router.get("/:id", CompetitionController.show);
router.post("/:id/join-team", CompetitionController.joinTeam);

export default router;
