import express from "express";
import * as CompetitionController from "../../controllers/api/Competition.js";

const router = express.Router();

// ✅ Public route for joining by code
router.get("/code/:joinCode", CompetitionController.getByCode);

export default router;
