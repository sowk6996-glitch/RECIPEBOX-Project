import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiSmile, FiCompass, FiPlusCircle } from 'react-icons/fi';
import api from '../services/api';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeGridSkeleton } from '../components/LoadingSkeleton';

export const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const { data } = await api.get('/api/recipes?limit=3');
        setRecipes(data.recipes || []);
      } catch (err) {
        console.error('Error fetching home recipes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const categories = [
    { name: 'Italian', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200' },
    { name: 'Indian', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200' },
    { name: 'Mexican', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200' },
    { name: 'Vegan', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200' },
    { name: 'Dessert', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200' },
    { name: 'Keto', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200' }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-tr from-brand-900 to-slate-900 text-white rounded-b-[4rem] px-4 py-20 lg:py-32 flex items-center justify-center text-center">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-600/30 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        <div className="max-w-4xl space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-100 text-sm font-bold animate-pulse-slow">
            <FiSmile /> Instagram for Foodies
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
            Discover, Create & Share <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-amber-400">
              Gourmet Recipes
            </span>
          </h1>
          <p className="text-lg text-slate-350 max-w-2xl mx-auto font-medium">
            Join RecipeBox, the community-driven platform where passionate home chefs and professional culinary artists share secret recipes, build digital cookbooks, and plan weekly meals.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/explore"
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-3xl shadow-lg shadow-brand-500/25 transition-all duration-150 transform hover:scale-[1.02]"
            >
              <FiCompass className="w-5 h-5" /> Explore Recipes <FiArrowRight />
            </Link>
            <Link
              to="/recipes/create"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-8 py-4 rounded-3xl backdrop-blur-sm transition-all duration-150"
            >
              <FiPlusCircle className="w-5 h-5" /> Share Recipe
            </Link>
          </div>
        </div>
      </section>

      {/* Culinary Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight dark:text-white">Browse by Category</h2>
          <p className="text-slate-500 dark:text-slate-450 text-sm">Choose from curated food genres to satisfy your cravings</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/explore?tags=${cat.name.toLowerCase()}`}
              className="group relative h-40 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end justify-center p-4">
                <span className="text-white font-bold tracking-wide group-hover:text-brand-500 transition-colors">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Recipe Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-3xl font-extrabold tracking-tight dark:text-white">Trending on RecipeBox</h2>
            <p className="text-slate-500 dark:text-slate-450 text-sm">Top-rated dishes cooked and reviewed by the community</p>
          </div>
          <Link
            to="/explore"
            className="flex items-center gap-1.5 text-brand-500 font-bold hover:text-brand-600 group text-sm"
          >
            View all recipes <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <RecipeGridSkeleton count={3} />
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-450 dark:text-slate-500">
            <p className="text-sm">No recipes found. Seed the database to view recipes!</p>
          </div>
        )}
      </section>

    </div>
  );
};
export default Home;
