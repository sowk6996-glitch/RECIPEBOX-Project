import MealPlanner from '../models/MealPlanner.js';

// @desc    Add a recipe to meal planner
// @route   POST /api/planner
export const addPlannedMeal = async (req, res) => {
  try {
    const { date, recipeId } = req.body;

    if (!date || !recipeId) {
      return res.status(400).json({ message: 'Date and recipe ID are required' });
    }

    const meal = new MealPlanner({
      user: req.user._id,
      date: new Date(date),
      recipe: recipeId
    });

    await meal.save();

    const populatedMeal = await MealPlanner.findById(meal._id).populate('recipe');
    return res.status(201).json(populatedMeal);
  } catch (error) {
    console.error('Add planned meal error:', error);
    return res.status(500).json({ message: 'Server error adding planned meal', error: error.message });
  }
};

// @desc    Get planned meals (optionally within a date range)
// @route   GET /api/planner
export const getPlannedMeals = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { user: req.user._id };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const meals = await MealPlanner.find(filter)
      .populate('recipe')
      .sort({ date: 1 });

    return res.json(meals);
  } catch (error) {
    console.error('Fetch planned meals error:', error);
    return res.status(500).json({ message: 'Server error fetching planned meals', error: error.message });
  }
};

// @desc    Delete planned meal
// @route   DELETE /api/planner/:id
export const deletePlannedMeal = async (req, res) => {
  try {
    const meal = await MealPlanner.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ message: 'Planned meal not found' });
    }

    // Verify ownership
    if (meal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this meal schedule' });
    }

    await MealPlanner.deleteOne({ _id: req.params.id });
    return res.json({ message: 'Planned meal removed successfully' });
  } catch (error) {
    console.error('Delete planned meal error:', error);
    return res.status(500).json({ message: 'Server error deleting planned meal', error: error.message });
  }
};
