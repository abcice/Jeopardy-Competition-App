import express from 'express';
import * as JeopardyController from '../../controllers/api/jeopardy';

const router = express.Router();

// Jeopardy games
router.get('/', JeopardyController.index);              // List all games
router.get('/:id', JeopardyController.showCategories);  // Show Jeopardy details (or categories)
router.post('/', JeopardyController.create);           // Create new game
router.put('/:id', JeopardyController.update);         // Update game
router.delete('/:id', JeopardyController.deleteJeopardy); // Delete game

// Categories
router.get('/:id/categories', JeopardyController.showCategories);   // List all categories
router.post('/:id/categories', JeopardyController.addCategory);     // Add a category
router.put('/:id/categories/:categoryId', JeopardyController.updateCategory); // Update category
router.delete('/:id/categories/:categoryId', JeopardyController.deleteCategory); // Delete category

// Questions
router.get('/:id/categories/:categoryId/questions', JeopardyController.showQuestions); // List questions
router.post('/:id/categories/:categoryId/questions', JeopardyController.addQuestion);  // Add question
router.put('/:id/categories/:categoryId/questions/:questionId', JeopardyController.updateQuestion); // Update question
router.delete('/:id/categories/:categoryId/questions/:questionId', JeopardyController.deleteQuestion); // Delete question

export default router;
