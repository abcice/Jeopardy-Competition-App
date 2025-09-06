// routes/api/playerCompetitions.js
import express from 'express';
import * as CompetitionController from '../../controllers/api/Competition.js';
import checkPlayerToken from '../../config/checkPlayerToken.js';

const router = express.Router();

// Public
router.get('/code/:joinCode', CompetitionController.getByCode);

// Protected
router.use(checkPlayerToken);
router.post('/:id/buzz', CompetitionController.recordBuzz);
router.get('/:id', CompetitionController.show);
router.post('/:id/join-team', CompetitionController.joinTeam);

export default router;
