import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiClock, FiStar, FiChevronLeft, FiUserPlus, FiUserMinus, FiHeart, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import { RecipeDetailSkeleton } from '../components/LoadingSkeleton';
import { CommentSection } from '../components/CommentSection';

export const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFollowing, toggleFollowInContext } = useAuth();
  const { showToast } = useToast();
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [userRating, setUserRating] = useState(0);

  const fetchRecipeDetails = async () => {
    try {
      const { data } = await api.get(`/api/recipes/${id}`);
      setRecipe(data);
      
      // Determine if logged-in user has already rated this recipe
      if (user) {
        const found = data.ratings?.find(r => (r.user?._id || r.user) === user._id);
        if (found) {
          setUserRating(found.value);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading recipe details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipeDetails();
    // eslint-disable-next-line
  }, [id, user]);

  const handleIngredientCheck = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleFollowToggle = async () => {
    if (!user) {
      showToast('Please sign in to follow users', 'info');
      return;
    }
    const authorId = recipe.author?._id || recipe.author;
    const currentlyFollowing = isFollowing(authorId);

    try {
      if (currentlyFollowing) {
        await api.post(`/api/users/unfollow/${authorId}`);
        toggleFollowInContext(authorId, false);
        showToast(`Unfollowed @${recipe.author.username}`, 'success');
      } else {
        await api.post(`/api/users/follow/${authorId}`);
        toggleFollowInContext(authorId, true);
        showToast(`Following @${recipe.author.username}!`, 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Social action failed', 'error');
    }
  };

  const handleRateRecipe = async (score) => {
    if (!user) {
      showToast('Please sign in to rate recipes', 'info');
      return;
    }
    try {
      const { data } = await api.post(`/api/recipes/${id}/rating`, { value: score });
      setRecipe(data);
      setUserRating(score);
      showToast(`You rated this ${score} stars!`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit rating', 'error');
    }
  };

  const handleDeleteRecipe = async () => {
    if (!window.confirm('Are you sure you want to delete your recipe? This action cannot be undone.')) return;
    try {
      await api.delete(`/api/recipes/${id}`);
      showToast('Recipe deleted successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete recipe', 'error');
    }
  };

  if (loading) {
    return <RecipeDetailSkeleton />;
  }

  if (!recipe) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold dark:text-white">Recipe not found</h2>
        <Link to="/explore" className="text-brand-500 font-bold hover:underline mt-4 inline-block">
          Back to Explore
        </Link>
      </div>
    );
  }

  const authorId = recipe.author?._id || recipe.author;
  const isOwner = user && (user._id || user.id) === authorId;
  const isCurrentlyFollowing = isFollowing(authorId);

  // Difficulty colors
  let difficultyClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400';
  if (recipe.difficulty === 'Medium') {
    difficultyClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400';
  } else if (recipe.difficulty === 'Hard') {
    difficultyClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400';
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pb-20">
      
      {/* Header breadcrumb & actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to="/explore"
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <FiChevronLeft className="w-4 h-4" /> Back to explore
        </Link>

        {isOwner && (
          <div className="flex gap-3">
            <Link
              to={`/recipes/${id}/edit`}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 px-4 py-2 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <FiEdit2 className="w-4 h-4" /> Edit Recipe
            </Link>
            <button
              onClick={handleDeleteRecipe}
              className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-2xl text-sm font-bold transition-colors"
            >
              <FiTrash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Main Title Banner */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight dark:text-white">
          {recipe.title}
        </h1>
        
        {/* Author row & Follow Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-850 pb-6">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${authorId}`}>
              <img
                src={recipe.author?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={recipe.author?.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-brand-500/25"
              />
            </Link>
            <div>
              <Link to={`/profile/${authorId}`} className="text-sm font-extrabold hover:underline block dark:text-white">
                @{recipe.author?.username || 'user'}
              </Link>
              <span className="text-xs text-slate-450">
                Posted {new Date(recipe.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Follow Toggle */}
            {!isOwner && (
              <button
                onClick={handleFollowToggle}
                className={`ml-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  isCurrentlyFollowing
                    ? 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border-slate-200 text-slate-650 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-300'
                    : 'bg-brand-500 hover:bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/10'
                }`}
              >
                {isCurrentlyFollowing ? (
                  <>
                    <FiUserMinus /> Unfollow
                  </>
                ) : (
                  <>
                    <FiUserPlus /> Follow
                  </>
                )}
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span className="flex items-center gap-1.5 text-slate-550 dark:text-slate-400">
              <FiClock className="w-4 h-4" /> {recipe.cookTime} mins
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${difficultyClass}`}>
              {recipe.difficulty}
            </span>
            <span className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded-full font-bold">
              <FiStar className="w-4 h-4 fill-amber-500" />
              {recipe.averageRating} ({recipe.ratings?.length || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Image, description, and ratings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Image */}
          <div className="aspect-[16/10] overflow-hidden rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-900">
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold dark:text-white">About this Recipe</h3>
            <p className="text-slate-600 dark:text-slate-350 leading-relaxed text-sm">
              {recipe.description}
            </p>
          </div>

          {/* Interactive Rating stars */}
          <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-3xl space-y-3">
            <h4 className="text-sm font-extrabold tracking-wide uppercase text-amber-600 dark:text-amber-400">
              Enjoyed this dish? Rate it!
            </h4>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, idx) => {
                const starVal = idx + 1;
                return (
                  <button
                    key={starVal}
                    onClick={() => handleRateRecipe(starVal)}
                    className="p-1 text-slate-300 dark:text-slate-800 hover:scale-110 transition-transform"
                  >
                    <FiStar
                      className={`w-8 h-8 ${
                        starVal <= userRating
                          ? 'text-amber-500 fill-amber-500'
                          : 'hover:text-amber-400 text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs text-slate-500 font-semibold ml-2">
                {userRating > 0 ? `You rated this ${userRating} stars` : 'Click to submit stars'}
              </span>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold dark:text-white">Instructions</h3>
            <ol className="space-y-4 list-decimal list-inside pl-2">
              {recipe.instructions?.map((step, idx) => (
                <li
                  key={idx}
                  className="text-sm leading-relaxed text-slate-650 dark:text-slate-350 pl-2 align-top"
                >
                  <span className="font-semibold text-slate-800 dark:text-white">{step}</span>
                </li>
              ))}
            </ol>
          </div>

        </div>

        {/* Right column: Ingredients checklist & Nutrition */}
        <div className="space-y-8">
          
          {/* Ingredients Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold border-b border-slate-50 dark:border-slate-850 pb-3 flex items-center gap-2 dark:text-white">
              <FiHeart className="text-brand-500 w-4 h-4" /> Ingredients
            </h3>
            
            <p className="text-xs text-slate-400 font-semibold">
              Check off ingredients as you prepare them:
            </p>

            <ul className="space-y-3">
              {recipe.ingredients?.map((ing, idx) => (
                <li
                  key={idx}
                  onClick={() => handleIngredientCheck(idx)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer transition-all duration-150 ${
                    checkedIngredients[idx] ? 'opacity-50 line-through' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!checkedIngredients[idx]}
                    onChange={() => {}} // handled by click on parent li
                    className="rounded border-slate-300 dark:border-slate-800 text-brand-500 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                    {ing.quantity} {ing.unit} of <span className="font-extrabold text-slate-850 dark:text-white">{ing.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Nutritional Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold border-b border-slate-50 dark:border-slate-850 pb-3 dark:text-white">
              Nutritional Facts
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-center">
                <span className="text-xs font-semibold text-slate-400 block">Calories</span>
                <span className="text-lg font-extrabold dark:text-white">
                  {recipe.nutritionalInfo?.calories || 0} kcal
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-center">
                <span className="text-xs font-semibold text-slate-400 block">Protein</span>
                <span className="text-lg font-extrabold dark:text-white">
                  {recipe.nutritionalInfo?.protein || 0}g
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-center">
                <span className="text-xs font-semibold text-slate-400 block">Carbs</span>
                <span className="text-lg font-extrabold dark:text-white">
                  {recipe.nutritionalInfo?.carbs || 0}g
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-center">
                <span className="text-xs font-semibold text-slate-400 block">Fats</span>
                <span className="text-lg font-extrabold dark:text-white">
                  {recipe.nutritionalInfo?.fats || 0}g
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Comments section */}
      <CommentSection
        comments={recipe.comments}
        recipeId={recipe._id}
        recipeAuthorId={authorId}
        onCommentUpdated={(updatedComments) => {
          setRecipe((prev) => ({ ...prev, comments: updatedComments }));
        }}
      />

    </div>
  );
};
export default RecipeDetails;
