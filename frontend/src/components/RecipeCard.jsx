import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiStar, FiChevronRight, FiFolderPlus, FiCheck, FiPlusSquare, FiTag, FiBookOpen } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';


export const RecipeCard = ({ recipe, draggable, onDragStart }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showCookbookDropdown, setShowCookbookDropdown] = useState(false);
  const [cookbooks, setCookbooks] = useState([]);
  const [loadingCookbooks, setLoadingCookbooks] = useState(false);

  const fetchCookbooks = async () => {
    if (!user) return;
    setLoadingCookbooks(true);
    try {
      const { data } = await api.get('/api/cookbooks');
      setCookbooks(data);
    } catch (err) {
      console.error('Error fetching cookbooks in card:', err);
    } finally {
      setLoadingCookbooks(false);
    }
  };

  const saveToCookbook = async (cookbookId, name) => {
    try {
      await api.post(`/api/cookbooks/${cookbookId}/add-recipe`, { recipeId: recipe._id });
      showToast(`Added to "${name}"!`, 'success');
      setShowCookbookDropdown(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save to cookbook';
      showToast(errorMsg, 'warning');
      setShowCookbookDropdown(false);
    }
  };

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Please sign in to save to cookbooks', 'info');
      return;
    }
    if (!showCookbookDropdown) {
      fetchCookbooks();
    }
    setShowCookbookDropdown(!showCookbookDropdown);
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!showCookbookDropdown) return;
    const close = () => setShowCookbookDropdown(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showCookbookDropdown]);

  // Determine difficulty badge colors
  let difficultyColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900';
  if (recipe.difficulty === 'Medium') {
    difficultyColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-amber-900';
  } else if (recipe.difficulty === 'Hard') {
    difficultyColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900';
  }

  const recipeId = recipe._id || recipe.id;

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className={`group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      {/* Recipe Image & Tags Overlay */}
      <Link to={`/recipes/${recipeId}`} className="block overflow-hidden aspect-[4/3] relative">
        <img
          src={recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800'}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Difficulty Badge */}
        <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm shadow-sm ${difficultyColor}`}>
          {recipe.difficulty}
        </span>
      </Link>

      {/* Card Body */}
      <div className="p-6 flex flex-col flex-grow">
        
        {/* Category tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {recipe.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500"
              >
                <FiTag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link to={`/recipes/${recipeId}`} className="hover:text-brand-500 transition-colors duration-150">
          <h3 className="text-xl font-bold leading-snug tracking-tight text-slate-850 dark:text-white line-clamp-1 mb-2">
            {recipe.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6">
          {recipe.description}
        </p>

        {/* Details Footer Grid */}
        <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
          
          {/* Author info */}
          <Link
            to={`/profile/${recipe.author?._id || recipe.author}`}
            className="flex items-center gap-2 hover:opacity-85 transition-opacity duration-150"
          >
            <img
              src={recipe.author?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={recipe.author?.username || 'Author'}
              className="w-7 h-7 rounded-full object-cover border border-brand-500/20"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              @{recipe.author?.username || 'user'}
            </span>
          </Link>

          {/* Time & Rating info */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <FiClock className="w-3.5 h-3.5 text-slate-400" />
              {recipe.cookTime}m
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-full">
              <FiStar className="w-3.5 h-3.5 fill-amber-500" />
              {recipe.averageRating || '0.0'}
            </span>

            {/* Quick Add To Cookbook Button */}
            <div className="relative">
              <button
                onClick={handleDropdownToggle}
                className="p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 transition-all duration-150"
                title="Save to Cookbook"
              >
                <FiFolderPlus className="w-4.5 h-4.5" />
              </button>

              {/* Cookbook Dropdown overlay */}
              {showCookbookDropdown && (
                <div
                  className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-20 pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1 border-b border-slate-50 dark:border-slate-800 mb-1">
                    <FiBookOpen className="w-3 h-3" /> Select Cookbook
                  </p>
                  
                  {loadingCookbooks ? (
                    <p className="text-xs text-slate-400 px-2 py-1 animate-pulse">Loading...</p>
                  ) : cookbooks.length === 0 ? (
                    <div className="p-2 text-center">
                      <p className="text-xs text-slate-500 mb-1">No collections</p>
                      <Link to="/cookbooks" className="text-xs font-bold text-brand-500 hover:underline">
                        Create one
                      </Link>
                    </div>
                  ) : (
                    <div className="max-h-36 overflow-y-auto">
                      {cookbooks.map((cb) => {
                        const alreadyAdded = cb.recipes?.some(r => (r._id || r) === recipe._id);
                        return (
                          <button
                            key={cb._id}
                            disabled={alreadyAdded}
                            onClick={() => saveToCookbook(cb._id, cb.name)}
                            className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-between text-slate-700 dark:text-slate-350 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="truncate">{cb.name}</span>
                            {alreadyAdded ? (
                              <FiCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            ) : (
                              <FiPlusSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default RecipeCard;
