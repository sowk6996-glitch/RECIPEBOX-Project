import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiUserPlus, FiUserMinus, FiHeart, FiGrid, FiAward } from 'react-icons/fi';
import api from '../services/api';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeGridSkeleton } from '../components/LoadingSkeleton';

export const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, isFollowing, toggleFollowInContext } = useAuth();
  const { showToast } = useToast();

  const [profileUser, setProfileUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/users/${id}/profile`);
      setProfileUser(data.user);
      setRecipes(data.recipes || []);
      setFollowersCount(data.user?.followers?.length || 0);
    } catch (err) {
      console.error(err);
      showToast('Error loading user profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [id]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      showToast('Please sign in to follow users', 'info');
      return;
    }
    const currentlyFollowing = isFollowing(id);

    try {
      if (currentlyFollowing) {
        await api.post(`/api/users/unfollow/${id}`);
        toggleFollowInContext(id, false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        showToast(`Unfollowed @${profileUser.username}`, 'success');
      } else {
        await api.post(`/api/users/follow/${id}`);
        toggleFollowInContext(id, true);
        setFollowersCount(prev => prev + 1);
        showToast(`Following @${profileUser.username}!`, 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Social action failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold dark:text-white">Profile not found</h2>
        <Link to="/" className="text-brand-500 font-bold hover:underline mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  const isSelf = currentUser && (currentUser._id || currentUser.id).toString() === id.toString();
  const currentlyFollowing = isFollowing(id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-20">
      
      {/* Profile Bio Details Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 lg:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={profileUser.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={profileUser.username}
            className="w-24 h-24 rounded-full object-cover border-4 border-brand-500/20 shadow-sm"
          />
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black dark:text-white flex items-center justify-center sm:justify-start gap-2">
              @{profileUser.username}
              <FiAward className="text-brand-500 w-5 h-5" title="Verified Chef" />
            </h1>
            <p className="text-sm text-slate-550 dark:text-slate-400 line-clamp-3 max-w-lg leading-relaxed">
              {profileUser.bio || "This chef hasn't added a bio yet."}
            </p>
            <div className="flex gap-5 pt-1.5 text-xs font-bold text-slate-700 dark:text-slate-350 justify-center sm:justify-start">
              <span>{followersCount} Followers</span>
              <span>{profileUser.following?.length || 0} Following</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isSelf && (
          <button
            onClick={handleFollowToggle}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold border transition-all ${
              currentlyFollowing
                ? 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border-slate-200 text-slate-700 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-300'
                : 'bg-brand-500 hover:bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/10'
            }`}
          >
            {currentlyFollowing ? (
              <>
                <FiUserMinus /> Unfollow
              </>
            ) : (
              <>
                <FiUserPlus /> Follow Chef
              </>
            )}
          </button>
        )}
      </div>

      {/* Recipes Catalog Grid */}
      <div className="space-y-6">
        <div className="border-b border-slate-50 dark:border-slate-855 pb-3">
          <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
            <FiGrid className="text-brand-500" /> Shared Recipes ({recipes.length})
          </h2>
        </div>

        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-12 text-center shadow-sm max-w-md mx-auto">
            <p className="text-sm text-slate-500 dark:text-slate-450">This user hasn't posted any recipes yet.</p>
          </div>
        )}
      </div>

    </div>
  );
};
export default Profile;
