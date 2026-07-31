import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiSliders, FiTrash2, FiPlus, FiX, FiInfo } from 'react-icons/fi';
import api from '../services/api';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeGridSkeleton } from '../components/LoadingSkeleton';

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter form states
  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(() => {
    const t = searchParams.get('tags');
    return t ? t.split(',').filter(Boolean) : [];
  });

  const [incInput, setIncInput] = useState('');
  const [includeIngs, setIncludeIngs] = useState(() => {
    const inc = searchParams.get('ingredient');
    return inc ? inc.split(',').filter(Boolean) : [];
  });

  const [excInput, setExcInput] = useState('');
  const [excludeIngs, setExcludeIngs] = useState(() => {
    const exc = searchParams.get('exclude');
    return exc ? exc.split(',').filter(Boolean) : [];
  });

  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '');
  const [maxTime, setMaxTime] = useState(searchParams.get('time') || 120);
  const [minRating, setMinRating] = useState(searchParams.get('rating') || 0);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (title) params.title = title;
      if (tags.length > 0) params.tags = tags.join(',');
      if (includeIngs.length > 0) params.ingredient = includeIngs.join(',');
      if (excludeIngs.length > 0) params.exclude = excludeIngs.join(',');
      if (difficulty) params.difficulty = difficulty;
      if (maxTime && maxTime < 120) params.time = maxTime;
      if (minRating > 0) params.rating = minRating;

      const { data } = await api.get('/api/recipes/search', { params });
      setRecipes(data || []);
      
      // Sync URL parameters
      setSearchParams(params);
    } catch (err) {
      console.error('Error searching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
    // eslint-disable-next-line
  }, [tags, includeIngs, excludeIngs, difficulty, minRating]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  // Add tag/ingredient chips
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const addInclude = () => {
    if (incInput.trim() && !includeIngs.includes(incInput.trim())) {
      setIncludeIngs([...includeIngs, incInput.trim()]);
      setIncInput('');
    }
  };

  const addExclude = () => {
    if (excInput.trim() && !excludeIngs.includes(excInput.trim())) {
      setExcludeIngs([...excludeIngs, excInput.trim()]);
      setExcInput('');
    }
  };

  const handleResetFilters = () => {
    setTitle('');
    setTags([]);
    setIncludeIngs([]);
    setExcludeIngs([]);
    setDifficulty('');
    setMaxTime(120);
    setMinRating(0);
    setRecipes([]);
    setSearchParams({});
    setTimeout(() => {
      fetchRecipes();
    }, 50);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Search Bar & Title */}
      <div className="space-y-4 mb-8 text-center sm:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight dark:text-white">Explore Culinary Creations</h1>
        <p className="text-slate-500 dark:text-slate-450 text-sm">Discover perfect recipes using our intelligent search filters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Filters Sidebar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 space-y-6 shadow-sm">
          
          <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
              <FiSliders className="text-brand-500 w-4 h-4" /> Filters
            </h2>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-450 hover:text-brand-500 hover:underline flex items-center gap-1"
            >
              Reset All
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-5">
            {/* Title search */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Title Keyword
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Spaghetti, tacos..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-brand-500 transition-all"
                />
                <FiSearch className="absolute left-3.5 top-3.5 text-slate-450 w-4 h-4" />
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-all text-slate-700 dark:text-slate-350"
              >
                <option value="">Any Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Tags Inclusion list */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Filter by Category Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Keto, Italian"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="p-2.5 bg-slate-100 hover:bg-brand-500 dark:bg-slate-800 dark:hover:bg-brand-500 text-slate-650 dark:text-slate-350 hover:text-white rounded-2xl transition-all"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-brand-100/30"
                  >
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                      <FiX className="w-3 h-3 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Ingredients Inclusion list */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Contains Ingredients
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Chicken, Rice"
                  value={incInput}
                  onChange={(e) => setIncInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())}
                  className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={addInclude}
                  className="p-2.5 bg-slate-100 hover:bg-brand-500 dark:bg-slate-800 dark:hover:bg-brand-500 text-slate-650 dark:text-slate-350 hover:text-white rounded-2xl transition-all"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {includeIngs.map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-100/30"
                  >
                    {ing}
                    <button type="button" onClick={() => setIncludeIngs(includeIngs.filter((i) => i !== ing))}>
                      <FiX className="w-3 h-3 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Ingredients Exclusion list */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Exclude Ingredients
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Onion, Nuts"
                  value={excInput}
                  onChange={(e) => setExcInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExclude())}
                  className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={addExclude}
                  className="p-2.5 bg-slate-100 hover:bg-brand-500 dark:bg-slate-800 dark:hover:bg-brand-500 text-slate-650 dark:text-slate-350 hover:text-white rounded-2xl transition-all"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {excludeIngs.map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-rose-100/30"
                  >
                    {ing}
                    <button type="button" onClick={() => setExcludeIngs(excludeIngs.filter((i) => i !== ing))}>
                      <FiX className="w-3 h-3 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Max Cook Time */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Max Cook Time
                </label>
                <span className="text-xs font-semibold text-brand-500">{maxTime === 120 ? 'Any' : `${maxTime} mins`}</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={maxTime}
                onChange={(e) => setMaxTime(Number(e.target.value))}
                className="w-full accent-brand-500 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer appearance-none h-1.5"
              />
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Min Average Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-all text-slate-700 dark:text-slate-350"
              >
                <option value={0}>Any Rating</option>
                <option value={4.5}>4.5 ★ & Up</option>
                <option value={4.0}>4.0 ★ & Up</option>
                <option value={3.5}>3.5 ★ & Up</option>
                <option value={3.0}>3.0 ★ & Up</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition-all shadow-md shadow-brand-500/20"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Recipes Results Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <RecipeGridSkeleton count={6} />
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] py-16 px-4 text-center shadow-sm max-w-lg mx-auto mt-10">
              <span className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 text-slate-400 mx-auto mb-4">
                <FiInfo className="w-8 h-8" />
              </span>
              <h3 className="text-xl font-bold dark:text-white mb-2">No Matching Recipes</h3>
              <p className="text-sm text-slate-500 dark:text-slate-450 mb-6">
                We couldn't find any recipes that match your search filters. Try widening your cook time or deleting some ingredient exclusions.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-2xl transition-colors shadow-md shadow-brand-500/10"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default Explore;
