import mongoose from 'mongoose';

const cookbookSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Recipe' 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Cookbook = mongoose.model('Cookbook', cookbookSchema);
export default Cookbook;
