import Recipe from '../models/Recipe.js';
import mongoose from 'mongoose';

// Helper to safely parse JSON inputs from multiform data
const parseJsonField = (field, fallback) => {
  if (!field) return fallback;
  try {
    return typeof field === 'string' ? JSON.parse(field) : field;
  } catch (e) {
    return fallback;
  }
};

// @desc    Get all recipes (with optional pagination)
// @route   GET /api/recipes
export const getRecipes = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const total = await Recipe.countDocuments();
    const recipes = await Recipe.find()
      .populate('author', 'username profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      recipes,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Fetch recipes error:', error);
    return res.status(500).json({ message: 'Server error fetching recipes', error: error.message });
  }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'username profileImage bio')
      .populate('comments.user', 'username profileImage')
      .populate('ratings.user', 'username profileImage');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    return res.json(recipe);
  } catch (error) {
    console.error('Fetch recipe details error:', error);
    return res.status(500).json({ message: 'Server error fetching recipe details', error: error.message });
  }
};

// @desc    Create recipe
// @route   POST /api/recipes
export const createRecipe = async (req, res) => {
  try {
    const { title, description, cookTime, difficulty } = req.body;

    if (!title || !description || !cookTime || !difficulty) {
      return res.status(400).json({ message: 'Title, description, cook time, and difficulty are required' });
    }

    // Parse JSON arrays/objects from multipart form data safely
    const ingredients = parseJsonField(req.body.ingredients, []);
    const instructions = parseJsonField(req.body.instructions, []);
    const tags = parseJsonField(req.body.tags, []);
    const nutritionalInfo = parseJsonField(req.body.nutritionalInfo, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    });

    if (ingredients.length === 0 || instructions.length === 0) {
      return res.status(400).json({ message: 'At least one ingredient and instruction is required' });
    }

    const recipe = new Recipe({
      title,
      description,
      ingredients,
      instructions,
      tags,
      cookTime: Number(cookTime),
      difficulty,
      nutritionalInfo,
      image: req.fileUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800',
      author: req.user._id
    });

    await recipe.save();
    return res.status(201).json(recipe);
  } catch (error) {
    console.error('Create recipe error:', error);
    return res.status(500).json({ message: 'Server error creating recipe', error: error.message });
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
export const updateRecipe = async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check ownership
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this recipe' });
    }

    // Assign text fields
    recipe.title = req.body.title || recipe.title;
    recipe.description = req.body.description || recipe.description;
    recipe.difficulty = req.body.difficulty || recipe.difficulty;
    if (req.body.cookTime) {
      recipe.cookTime = Number(req.body.cookTime);
    }

    // Parse structures
    if (req.body.ingredients) {
      recipe.ingredients = parseJsonField(req.body.ingredients, recipe.ingredients);
    }
    if (req.body.instructions) {
      recipe.instructions = parseJsonField(req.body.instructions, recipe.instructions);
    }
    if (req.body.tags) {
      recipe.tags = parseJsonField(req.body.tags, recipe.tags);
    }
    if (req.body.nutritionalInfo) {
      recipe.nutritionalInfo = parseJsonField(req.body.nutritionalInfo, recipe.nutritionalInfo);
    }

    // New image
    if (req.fileUrl) {
      recipe.image = req.fileUrl;
    }

    await recipe.save();
    return res.json(recipe);
  } catch (error) {
    console.error('Update recipe error:', error);
    return res.status(500).json({ message: 'Server error updating recipe', error: error.message });
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check ownership
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }

    await Recipe.deleteOne({ _id: req.params.id });
    return res.json({ message: 'Recipe removed successfully' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    return res.status(500).json({ message: 'Server error deleting recipe', error: error.message });
  }
};

// @desc    Add comment to recipe
// @route   POST /api/recipes/:id/comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const comment = {
      user: req.user._id,
      text,
      createdAt: new Date()
    };

    recipe.comments.push(comment);
    await recipe.save();

    // Populate comments
    const updatedRecipe = await Recipe.findById(req.params.id)
      .populate('comments.user', 'username profileImage');

    return res.json(updatedRecipe.comments);
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({ message: 'Server error adding comment', error: error.message });
  }
};

// @desc    Delete comment from recipe
// @route   DELETE /api/recipes/:id/comment/:commentId
export const deleteComment = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const comment = recipe.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Authorized if owner of the comment OR owner of the recipe
    if (comment.user.toString() !== req.user._id.toString() && recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    recipe.comments.pull(req.params.commentId);
    await recipe.save();

    const updatedRecipe = await Recipe.findById(req.params.id)
      .populate('comments.user', 'username profileImage');

    return res.json(updatedRecipe.comments);
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ message: 'Server error deleting comment', error: error.message });
  }
};

// @desc    Rate recipe
// @route   POST /api/recipes/:id/rating
export const rateRecipe = async (req, res) => {
  try {
    const { value } = req.body;
    const ratingValue = Number(value);

    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user already rated
    const existingRating = recipe.ratings.find(r => r.user.toString() === req.user._id.toString());

    if (existingRating) {
      existingRating.value = ratingValue;
    } else {
      recipe.ratings.push({
        user: req.user._id,
        value: ratingValue
      });
    }

    recipe.updateAverageRating();
    await recipe.save();

    const updatedRecipe = await Recipe.findById(req.params.id)
      .populate('author', 'username profileImage')
      .populate('ratings.user', 'username profileImage');

    return res.json(updatedRecipe);
  } catch (error) {
    console.error('Rating error:', error);
    return res.status(500).json({ message: 'Server error rating recipe', error: error.message });
  }
};

// @desc    Advanced search recipes
// @route   GET /api/recipes/search
export const searchRecipes = async (req, res) => {
  const { title, ingredient, exclude, tags, difficulty, time, rating } = req.query;

  try {
    const pipeline = [];
    const match = {};

    if (title) {
      match.title = { $regex: title, $options: 'i' };
    }

    const normalizeQueryParam = (param) => {
      if (!param) return [];
      if (Array.isArray(param)) return param;
      return param.split(',').map(item => item.trim()).filter(Boolean);
    };

    const includeIngredients = normalizeQueryParam(ingredient);
    const excludeIngredients = normalizeQueryParam(exclude);
    const tagList = normalizeQueryParam(tags);

    if (includeIngredients.length > 0) {
      // Ingredients must match all including (case-insensitive)
      match['ingredients.name'] = {
        $all: includeIngredients.map(ing => new RegExp(`^${ing.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'))
      };
    }

    if (excludeIngredients.length > 0) {
      // Ingredients must not contain any of excluded
      const excludeRegex = excludeIngredients.map(ing => new RegExp(`^${ing.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'));
      if (match['ingredients.name']) {
        match['ingredients.name'].$nin = excludeRegex;
      } else {
        match['ingredients.name'] = { $nin: excludeRegex };
      }
    }

    if (tagList.length > 0) {
      match.tags = { 
        $all: tagList.map(tag => new RegExp(`^${tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')) 
      };
    }

    if (difficulty) {
      match.difficulty = difficulty;
    }

    if (time) {
      match.cookTime = { $lte: Number(time) };
    }

    if (rating) {
      match.averageRating = { $gte: Number(rating) };
    }

    // Add match block to aggregation
    pipeline.push({ $match: match });

    // Join Author Profile
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    });
    pipeline.push({ $unwind: '$author' });

    // Remove sensitive data
    pipeline.push({
      $project: {
        'author.password': 0,
        'author.email': 0
      }
    });

    // Sort by latest
    pipeline.push({ $sort: { createdAt: -1 } });

    const results = await Recipe.aggregate(pipeline);
    return res.json(results);
  } catch (error) {
    console.error('Search recipes pipeline error:', error);
    return res.status(500).json({ message: 'Server error performing search query', error: error.message });
  }
};
