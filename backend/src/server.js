import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cookbookRoutes from './routes/cookbookRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';

// Controller imports for special endpoints
import { getFeed } from './controllers/userController.js';
import { protect } from './middleware/auth.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // For development, allow any origin. In production, restrict this.
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve local uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cookbooks', cookbookRoutes);
app.use('/api/planner', plannerRoutes);

// Direct mapping for feed endpoint as requested
app.get('/api/feed', protect, getFeed);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('RecipeBox API is running smoothly...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error handler:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
