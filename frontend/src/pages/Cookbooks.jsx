import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { FiBookOpen, FiPlus, FiTrash2, FiFolder, FiFolderMinus, FiFolderPlus, FiCheck } from 'react-icons/fi';
import api from '../services/api';

export const Cookbooks = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [cookbooks, setCookbooks] = useState([]);
  const [activeCookbook, setActiveCookbook] = useState(null);
  const [newCookbookName, setNewCookbookName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchCookbooks = async () => {
    try {
      const { data } = await api.get('/api/cookbooks');
      setCookbooks(data || []);
      if (data && data.length > 0) {
        // Keep active cookbook selected or default to first
        if (activeCookbook) {
          const updatedActive = data.find(c => c._id === activeCookbook._id);
          setActiveCookbook(updatedActive || data[0]);
        } else {
          setActiveCookbook(data[0]);
        }
      } else {
        setActiveCookbook(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading cookbooks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCookbooks();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [user]);

  const handleCreateCookbook = async (e) => {
    e.preventDefault();
    if (!newCookbookName.trim()) return;

    setCreating(true);
    try {
      const { data } = await api.post('/api/cookbooks', { name: newCookbookName.trim() });
      setNewCookbookName('');
      showToast(`Cookbook "${data.name}" created!`, 'success');
      
      // Re-fetch and select the newly created cookbook
      const { data: updatedList } = await api.get('/api/cookbooks');
      setCookbooks(updatedList);
      const newlyCreated = updatedList.find(c => c._id === data._id);
      setActiveCookbook(newlyCreated || data);
    } catch (err) {
      console.error(err);
      showToast('Failed to create cookbook', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCookbook = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the cookbook "${name}"? All recipes inside will be unfiled.`)) return;

    try {
      await api.delete(`/api/cookbooks/${id}`);
      showToast(`Cookbook "${name}" deleted`, 'success');
      
      // Clean active selection
      if (activeCookbook && activeCookbook._id === id) {
        setActiveCookbook(null);
      }
      fetchCookbooks();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete cookbook', 'error');
    }
  };

  const handleRemoveRecipe = async (recipeId, recipeTitle) => {
    if (!activeCookbook) return;

    try {
      const { data } = await api.post(`/api/cookbooks/${activeCookbook._id}/remove-recipe`, { recipeId });
      showToast(`Removed "${recipeTitle}" from "${activeCookbook.name}"`, 'success');
      
      // Update local view
      setActiveCookbook(data);
      setCookbooks(prev => prev.map(c => c._id === data._id ? data : c));
    } catch (err) {
      console.error(err);
      showToast('Failed to remove recipe', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-20">
      
      {/* Title */}
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight dark:text-white flex items-center justify-center sm:justify-start gap-2.5">
          <FiBookOpen className="text-brand-500 w-8 h-8" />
          My Digital Cookbooks
        </h1>
        <p className="text-slate-500 dark:text-slate-455 text-sm">
          Organize your recipes into custom collections for Sunday Brunch, Healthy Meals, and more
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side: Create & List Cookbooks */}
        <div className="space-y-6">
          
          {/* Create Cookbook Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Create Cookbook
            </h3>
            <form onSubmit={handleCreateCookbook} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Quick Dinner"
                value={newCookbookName}
                onChange={(e) => setNewCookbookName(e.target.value)}
                required
                className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 dark:text-white"
              />
              <button
                type="submit"
                disabled={creating || !newCookbookName.trim()}
                className="p-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl transition-all shadow-sm"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Cookbooks List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-50 dark:border-slate-850 pb-2">
              Collections ({cookbooks.length})
            </h3>
            
            {loading ? (
              <p className="text-xs text-slate-400 animate-pulse">Loading cookbooks...</p>
            ) : cookbooks.length === 0 ? (
              <p className="text-xs text-slate-450 text-center py-4">No collections created yet</p>
            ) : (
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {cookbooks.map((cb) => (
                  <div
                    key={cb._id}
                    onClick={() => setActiveCookbook(cb)}
                    className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                      activeCookbook && activeCookbook._id === cb._id
                        ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400 font-bold'
                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xs truncate flex items-center gap-2">
                      <FiFolder className={activeCookbook && activeCookbook._id === cb._id ? 'text-brand-500 fill-brand-500/10' : 'text-slate-400'} />
                      {cb.name} ({cb.recipes?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCookbook(cb._id, cb.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Cookbook Contents */}
        <div className="lg:col-span-3">
          {activeCookbook ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 lg:p-8 shadow-sm space-y-6">
              
              <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-4">
                <div>
                  <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
                    <FiFolder className="text-brand-500" />
                    {activeCookbook.name}
                  </h2>
                  <p className="text-xs text-slate-450 mt-1">
                    Contains {activeCookbook.recipes?.length || 0} saved recipes
                  </p>
                </div>
                
                <button
                  onClick={() => handleDeleteCookbook(activeCookbook._id, activeCookbook.name)}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-3.5 py-2 rounded-xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900"
                >
                  <FiTrash2 /> Delete Cookbook
                </button>
              </div>

              {activeCookbook.recipes && activeCookbook.recipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {activeCookbook.recipes.map((recipe) => (
                    <div key={recipe._id} className="relative group border border-slate-100 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm">
                      {/* Image */}
                      <div className="aspect-[16/10] overflow-hidden">
                        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                      </div>
                      {/* Info overlay */}
                      <div className="p-4 bg-white dark:bg-slate-900 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <Link to={`/recipes/${recipe._id}`} className="font-bold text-slate-850 dark:text-white hover:text-brand-500 hover:underline truncate">
                            {recipe.title}
                          </Link>
                          
                          {/* Remove button */}
                          <button
                            onClick={() => handleRemoveRecipe(recipe._id, recipe.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                            title="Remove from Cookbook"
                          >
                            <FiFolderMinus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-2 border-t border-slate-50 dark:border-slate-850">
                          <span>{recipe.difficulty}</span>
                          <span>{recipe.cookTime} mins</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-450 dark:text-slate-500 space-y-4">
                  <FiFolderPlus className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-sm">This cookbook is currently empty.</p>
                  <Link
                    to="/explore"
                    className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition-colors shadow-md shadow-brand-500/10 inline-block text-xs"
                  >
                    Browse Recipes to Add
                  </Link>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] py-20 text-center shadow-sm max-w-lg mx-auto">
              <FiBookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold dark:text-white mb-1">Select a Cookbook</h3>
              <p className="text-xs text-slate-500 mb-6">
                Choose a collection from the sidebar to view its contents, or create a new cookbook folder.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
export default Cookbooks;
