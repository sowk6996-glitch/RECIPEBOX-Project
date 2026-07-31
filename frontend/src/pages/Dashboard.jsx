import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiPlusSquare, FiUser, FiHeart, FiBookOpen, FiGrid } from 'react-icons/fi';
import api from '../services/api';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeGridSkeleton } from '../components/LoadingSkeleton';

export const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [recipes, setRecipes] = useState([]);
  const [cookbooksCount, setCookbooksCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user's own profile recipes
        const { data: profileData } = await api.get(`/api/users/${user._id || user.id}/profile`);
        setRecipes(profileData.recipes || []);

        // Fetch cookbooks to count them
        const { data: cookbooksData } = await api.get('/api/cookbooks');
        setCookbooksCount(cookbooksData?.length || 0);
      } catch (err) {
        console.error('Error fetching dashboard details:', err);
        showToast('Failed to fetch dashboard content', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, showToast]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-20">
      
      {/* Profile Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 lg:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <img
            src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
            alt={user?.username}
            className="w-20 h-20 rounded-full object-cover border-4 border-brand-500/25"
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-black dark:text-white">Hello, {user?.username}!</h1>
            <p className="text-sm text-slate-500 dark:text-slate-450 line-clamp-2 max-w-md">
              {user?.bio || "No bio added yet. Tell the community about yourself by editing your profile!"}
            </p>
            <div className="flex gap-4 pt-1 text-xs font-semibold text-slate-650 dark:text-slate-350 justify-center sm:justify-start">
              <span>{user?.followers?.length || 0} Followers</span>
              <span>{user?.following?.length || 0} Following</span>
            </div>
          </div>
        </div>

        <Link
          to={`/profile/${user?._id || user?.id}`}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-colors"
        >
          <FiUser /> View Public Profile
        </Link>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
          <span className="w-12 h-12 bg-brand-50 dark:bg-brand-950/20 text-brand-500 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
            <FiGrid />
          </span>
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">My Recipes</span>
            <span className="text-2xl font-black dark:text-white">{recipes.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
          <span className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
            <FiBookOpen />
          </span>
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">My Cookbooks</span>
            <span className="text-2xl font-black dark:text-white">{cookbooksCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
          <span className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
            <FiHeart />
          </span>
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Social Followers</span>
            <span className="text-2xl font-black dark:text-white">{user?.followers?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Authored Recipes Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-2xl font-black dark:text-white">My Recipes</h2>
            <p className="text-sm text-slate-500 dark:text-slate-450">Recipes that you have created and shared with RecipeBox</p>
          </div>
          <Link
            to="/recipes/create"
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-2xl shadow-md shadow-brand-500/20 transition-all transform hover:scale-[1.01]"
          >
            <FiPlusSquare className="w-4 h-4" /> Create Recipe
          </Link>
        </div>

        {loading ? (
          <RecipeGridSkeleton count={3} />
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-12 text-center shadow-sm max-w-md mx-auto">
            <span className="w-16 h-16 bg-slate-50 dark:bg-slate-950 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPlusSquare className="w-8 h-8" />
            </span>
            <h3 className="text-lg font-bold dark:text-white mb-1">Create Your First Recipe!</h3>
            <p className="text-xs text-slate-500 mb-6">
              You haven't shared any recipes yet. Click below to share your culinary masterpiece with our foodie community!
            </p>
            <Link
              to="/recipes/create"
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition-colors inline-block"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};
export default Dashboard;
