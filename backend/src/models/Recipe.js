import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  unit: { 
    type: String, 
    required: true, 
    trim: true 
  }
});

const ratingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  value: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  }
});

const commentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const recipeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  ingredients: [ingredientSchema],
  instructions: [{ 
    type: String, 
    required: true 
  }],
  tags: [{ 
    type: String, 
    trim: true 
  }],
  cookTime: { 
    type: Number, 
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ["Easy", "Medium", "Hard"], 
    required: true 
  },
  nutritionalInfo: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 }
  },
  image: { 
    type: String, 
    default: "" 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  ratings: [ratingSchema],
  comments: [commentSchema],
  averageRating: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Helper to recalculate the average rating
recipeSchema.methods.updateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, curr) => acc + curr.value, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  }
};

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;
