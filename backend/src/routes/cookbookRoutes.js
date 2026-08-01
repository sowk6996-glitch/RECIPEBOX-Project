import express from 'express';
import {
  createCookbook,
  getCookbooks,
  addRecipeToCookbook,
  removeRecipeFromCookbook,
  deleteCookbook
} from '../controllers/cookbookController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all cookbook operations
router.use(protect);

router.route('/')
  .post(createCookbook)
  .get(getCookbooks);

router.route('/:id')
  .delete(deleteCookbook);

router.post('/:id/add-recipe', addRecipeToCookbook);
router.post('/:id/remove-recipe', removeRecipeFromCookbook);

export default router;
