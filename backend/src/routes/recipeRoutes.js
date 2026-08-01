import express from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  addComment,
  deleteComment,
  rateRecipe,
  searchRecipes
} from '../controllers/recipeController.js';
import { protect } from '../middleware/auth.js';
import upload, { uploadImage } from '../middleware/upload.js';

const router = express.Router();

// Define /search before /:id to prevent routing collisions
router.get('/search', searchRecipes);

router.route('/')
  .get(getRecipes)
  .post(protect, upload.single('image'), uploadImage, createRecipe);

router.route('/:id')
  .get(getRecipeById)
  .put(protect, upload.single('image'), uploadImage, updateRecipe)
  .delete(protect, deleteRecipe);

router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);
router.post('/:id/rating', protect, rateRecipe);

export default router;
