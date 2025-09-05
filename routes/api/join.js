import express from 'express';
import * as CompetitionController from '../../controllers/api/Competition.js';
import checkPlayerToken from '../../config/checkPlayerToken.js';

const router = express.Router();

// Public endpoint for players to join without login
// Public endpoints
router.get('/code/:joinCode', CompetitionController.getByCode); // no auth
router.post('/:id/buzz', checkPlayerToken, CompetitionController.recordBuzz);
export default router;
