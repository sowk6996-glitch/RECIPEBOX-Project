import Cookbook from '../models/Cookbook.js';

// @desc    Create a cookbook
// @route   POST /api/cookbooks
export const createCookbook = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Cookbook name is required' });
    }

    const cookbook = new Cookbook({
      name,
      user: req.user._id,
      recipes: []
    });

    await cookbook.save();
    return res.status(201).json(cookbook);
  } catch (error) {
    console.error('Create cookbook error:', error);
    return res.status(500).json({ message: 'Server error creating cookbook', error: error.message });
  }
};

// @desc    Get user's cookbooks
// @route   GET /api/cookbooks
export const getCookbooks = async (req, res) => {
  try {
    const cookbooks = await Cookbook.find({ user: req.user._id })
      .populate('recipes'); // populate recipes inside the cookbook
    return res.json(cookbooks);
  } catch (error) {
    console.error('Fetch cookbooks error:', error);
    return res.status(500).json({ message: 'Server error fetching cookbooks', error: error.message });
  }
};

// @desc    Add recipe to cookbook
// @route   POST /api/cookbooks/:id/add-recipe
export const addRecipeToCookbook = async (req, res) => {
  try {
    const { recipeId } = req.body;
    if (!recipeId) {
      return res.status(400).json({ message: 'Recipe ID is required' });
    }

    const cookbook = await Cookbook.findById(req.params.id);
    if (!cookbook) {
      return res.status(404).json({ message: 'Cookbook not found' });
    }

    // Verify ownership
    if (cookbook.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this cookbook' });
    }

    // Check if already in collection
    if (cookbook.recipes.includes(recipeId)) {
      return res.status(400).json({ message: 'Recipe is already in this cookbook' });
    }

    cookbook.recipes.push(recipeId);
    await cookbook.save();

    const updated = await Cookbook.findById(req.params.id).populate('recipes');
    return res.json(updated);
  } catch (error) {
    console.error('Add recipe to cookbook error:', error);
    return res.status(500).json({ message: 'Server error adding recipe to cookbook', error: error.message });
  }
};

// @desc    Remove recipe from cookbook
// @route   POST /api/cookbooks/:id/remove-recipe
export const removeRecipeFromCookbook = async (req, res) => {
  try {
    const { recipeId } = req.body;
    if (!recipeId) {
      return res.status(400).json({ message: 'Recipe ID is required' });
    }

    const cookbook = await Cookbook.findById(req.params.id);
    if (!cookbook) {
      return res.status(404).json({ message: 'Cookbook not found' });
    }

    // Verify ownership
    if (cookbook.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this cookbook' });
    }

    // Check if not in collection
    if (!cookbook.recipes.includes(recipeId)) {
      return res.status(400).json({ message: 'Recipe is not in this cookbook' });
    }

    cookbook.recipes.pull(recipeId);
    await cookbook.save();

    const updated = await Cookbook.findById(req.params.id).populate('recipes');
    return res.json(updated);
  } catch (error) {
    console.error('Remove recipe from cookbook error:', error);
    return res.status(500).json({ message: 'Server error removing recipe from cookbook', error: error.message });
  }
};

// @desc    Delete cookbook
// @route   DELETE /api/cookbooks/:id
export const deleteCookbook = async (req, res) => {
  try {
    const cookbook = await Cookbook.findById(req.params.id);
    if (!cookbook) {
      return res.status(404).json({ message: 'Cookbook not found' });
    }

    // Verify ownership
    if (cookbook.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this cookbook' });
    }

    await Cookbook.deleteOne({ _id: req.params.id });
    return res.json({ message: 'Cookbook deleted successfully' });
  } catch (error) {
    console.error('Delete cookbook error:', error);
    return res.status(500).json({ message: 'Server error deleting cookbook', error: error.message });
  }
};
