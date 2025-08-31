import express from 'express';
import * as CompetitionController from '../../controllers/api/Competition';

const router = express.Router();

// Competitions
router.get('/', CompetitionController.index);           // List all competitions
router.get('/:id', CompetitionController.show);         // Show one competition
router.post('/', CompetitionController.create);         // Create a new competition
router.delete('/:id', CompetitionController.deleteCompetition); // Delete a competition

// Teams
router.post('/:id/teams', CompetitionController.addTeam);       // Add a team
router.put('/:id/teams/score', CompetitionController.updateTeamScore); // Update team score

// Current question
router.put('/:id/current-question', CompetitionController.setCurrentQuestion); // Set current question
router.put('/:id/mark-correct', CompetitionController.markCorrect);             // Mark correct
router.put('/:id/mark-wrong', CompetitionController.markWrong);                 // Mark wrong
router.put('/:id/skip-question', CompetitionController.skipQuestion);           // Skip question

// Buzz (optional logging)
router.post('/:id/buzz', CompetitionController.recordBuzz); 

// Status
router.put('/:id/status', CompetitionController.updateStatus); 

export default router;
