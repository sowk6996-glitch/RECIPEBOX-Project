import express from 'express';
import { addPlannedMeal, getPlannedMeals, deletePlannedMeal } from '../controllers/plannerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all planner operations
router.use(protect);

router.route('/')
  .post(addPlannedMeal)
  .get(getPlannedMeals);

router.route('/:id')
  .delete(deletePlannedMeal);

export default router;
