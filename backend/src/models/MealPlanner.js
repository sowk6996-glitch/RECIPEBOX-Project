import mongoose from 'mongoose';

const mealPlannerSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  recipe: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Recipe', 
    required: true 
  }
});

const MealPlanner = mongoose.model('MealPlanner', mealPlannerSchema);
export default MealPlanner;
