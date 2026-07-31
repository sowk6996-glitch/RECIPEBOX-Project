import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiUsers, FiPlus, FiChevronRight, FiGrid, FiCompass } from 'react-icons/fi';
import api from '../services/api';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeGridSkeleton } from '../components/LoadingSkeleton';

export const Feed = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Recommendations state for cold start
  const [recommendedUsers, setRecommendedUsers] = useState([]);

  const fetchFeed = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const { data } = await api.get(`/api/feed?page=${pageNum}&limit=6`);
      if (append) {
        setRecipes((prev) => [...prev, ...(data.recipes || [])]);
      } else {
        setRecipes(data.recipes || []);
      }
      setPage(data.page);
      setTotalPages(data.pages);
    } catch (err) {
      console.error('Error fetching feed:', err);
      showToast('Error loading social feed', 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      // Fetch popular seeded users to recommend
      // In a real app we would query recommendations endpoint. Here we can fetch another user's profile or query.
      // We will hardcode or query Chef and Spicy Alice profile details
      const recs = [];
      const chefId = '50bd5646-8ccf-4b6d-890b-c5929ba2fa12'; // will fetch by seed name, or we can just fetch all users
      // Let's call seed users. We know seed script creates: 'chef_chef', 'spicy_alice', 'baker_bob'
      // We can fetch a list of users or just recommend top accounts.
      // Let's do a quick request or mock beautiful items.
      setRecommendedUsers([
        { id: 'chef', username: 'chef_chef', bio: 'Professional culinary artist. Sharing top secret gourmet recipes.', profileImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100' },
        { id: 'alice', username: 'spicy_alice', bio: 'Spice enthusiast. Specializing in Indian, Thai, and Mexican cuisine.', profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
        { id: 'bob', username: 'baker_bob', bio: 'Baking is my therapy. Pastries, bread, cookies, and cakes!', profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFeed(1, false);
    fetchRecommendations();
    // eslint-disable-next-line
  }, []);

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchFeed(page + 1, true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-20">
      
      {/* Title */}
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight dark:text-white flex items-center justify-center sm:justify-start gap-2.5">
          <FiGrid className="text-brand-500 w-8 h-8" />
          My Social Feed
        </h1>
        <p className="text-slate-500 dark:text-slate-455 text-sm">
          Discover latest recipes and cooking tips shared by accounts you follow
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Main Feed Recipes */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <RecipeGridSkeleton count={3} />
          ) : recipes.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
              </div>

              {/* Load more button */}
              {page < totalPages && (
                <div className="text-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all shadow-sm disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading recipes...' : 'Load More Recipes'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Cold Start Empty State */
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-12 text-center shadow-sm max-w-lg mx-auto">
              <span className="w-16 h-16 bg-slate-50 dark:bg-slate-950 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8" />
              </span>
              <h3 className="text-xl font-bold dark:text-white mb-2">Your Feed is Empty</h3>
              <p className="text-sm text-slate-500 dark:text-slate-450 mb-6">
                You aren't following anyone yet, or the cooks you follow haven't posted any recipes. Explore the community and follow chefs to customize your feed!
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  to="/explore"
                  className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition-colors shadow-md shadow-brand-500/10 flex items-center gap-1.5"
                >
                  <FiCompass /> Discover Recipes
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Recommendations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-50 dark:border-slate-850 pb-3 flex items-center gap-1.5">
            <FiUsers className="text-brand-500" /> Suggested Foodies
          </h3>
          
          <div className="space-y-4">
            {recommendedUsers.map((rec) => (
              <div key={rec.id} className="flex gap-3 items-start border-b border-slate-50/50 dark:border-slate-850/50 pb-3 last:border-b-0 last:pb-0">
                <img
                  src={rec.profileImage}
                  alt={rec.username}
                  className="w-9 h-9 rounded-full object-cover border border-slate-150 dark:border-slate-850"
                />
                <div className="flex-grow space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-850 dark:text-white">@{rec.username}</h4>
                  <p className="text-[10px] text-slate-450 line-clamp-1">{rec.bio}</p>
                  <Link
                    to={`/explore?title=&difficulty=&tags=&ingredient=&exclude=&time=120&rating=0`} // Link to exploration
                    className="text-[10px] text-brand-500 font-bold hover:underline flex items-center gap-0.5 pt-0.5"
                  >
                    View Recipes <FiChevronRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
export default Feed;
