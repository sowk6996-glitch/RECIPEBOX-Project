import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { FiCalendar, FiTrash2, FiClock, FiPlus, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MealPlanner = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [recipes, setRecipes] = useState([]);
  const [plannedMeals, setPlannedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Calculate Monday through Sunday dates for the current week
  const getWeekDays = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const startDate = weekDays[0].toISOString();
  const endDate = weekDays[6].toISOString();

  const fetchPlannerData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user's own recipes to display in the sidebar
      const { data: profileData } = await api.get(`/api/users/${user._id || user.id}/profile`);
      setRecipes(profileData.recipes || []);

      // 2. Fetch planned meals in this week's date range
      const { data: plannerData } = await api.get('/api/planner', {
        params: { startDate, endDate }
      });
      setPlannedMeals(plannerData || []);
    } catch (err) {
      console.error(err);
      showToast('Error loading planner information', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPlannerData();
    }
    // eslint-disable-next-line
  }, [user]);

  // Drag and drop event handlers
  const handleDragStart = (e, recipeId) => {
    e.dataTransfer.setData('text/plain', recipeId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-brand-500/10', 'border-brand-500', 'scale-[1.02]');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-brand-500/10', 'border-brand-500', 'scale-[1.02]');
  };

  const handleDrop = async (e, date) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-brand-500/10', 'border-brand-500', 'scale-[1.02]');
    
    const recipeId = e.dataTransfer.getData('text/plain');
    if (!recipeId) return;

    try {
      const { data } = await api.post('/api/planner', {
        date: date.toISOString(),
        recipeId
      });
      showToast('Meal planned successfully!', 'success');
      
      // Update local planned list
      setPlannedMeals((prev) => [...prev, data]);
    } catch (err) {
      console.error(err);
      showToast('Failed to plan meal', 'error');
    }
  };

  const handleDeletePlanned = async (plannedId) => {
    try {
      await api.delete(`/api/planner/${plannedId}`);
      showToast('Meal removed from plan', 'success');
      
      // Update local list
      setPlannedMeals((prev) => prev.filter((m) => m._id !== plannedId));
    } catch (err) {
      console.error(err);
      showToast('Failed to remove planned meal', 'error');
    }
  };

  // Helper to filter planned meals for a specific day
  const getMealsForDay = (dayDate) => {
    return plannedMeals.filter((meal) => {
      const mealDate = new Date(meal.date);
      return (
        mealDate.getDate() === dayDate.getDate() &&
        mealDate.getMonth() === dayDate.getMonth() &&
        mealDate.getFullYear() === dayDate.getFullYear()
      );
    });
  };

  // Calculate week summary stats
  const totalCookTime = plannedMeals.reduce((sum, meal) => sum + (meal.recipe?.cookTime || 0), 0);
  const totalCalories = plannedMeals.reduce((sum, meal) => sum + (meal.recipe?.nutritionalInfo?.calories || 0), 0);

  const getDayName = (date) => {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  };

  const getDayNumber = (date) => {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-20">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight dark:text-white flex items-center justify-center md:justify-start gap-2.5">
            <FiCalendar className="text-brand-500 w-8 h-8" />
            Premium Meal Planner
          </h1>
          <p className="text-slate-500 dark:text-slate-455 text-sm">
            Drag recipes from your recipes list onto the days of the week to build your planner
          </p>
        </div>

        {/* Week Summary Badge */}
        <div className="flex gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-xs font-semibold">
          <div className="text-center border-r border-slate-100 dark:border-slate-800 pr-4">
            <span className="text-slate-400 block uppercase mb-0.5">Total Cooking</span>
            <span className="text-base font-extrabold text-brand-500 flex items-center justify-center gap-1">
              <FiClock /> {totalCookTime}m
            </span>
          </div>
          <div className="text-center pl-1">
            <span className="text-slate-400 block uppercase mb-0.5">Weekly Calories</span>
            <span className="text-base font-extrabold text-slate-850 dark:text-white flex items-center justify-center gap-1">
              <FiTrendingUp /> {totalCalories} kcal
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side: Draggable recipes sidebar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-50 dark:border-slate-850 pb-2">
            My Draggable Recipes
          </h3>

          {loading ? (
            <p className="text-xs text-slate-400 animate-pulse">Loading list...</p>
          ) : recipes.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <FiAlertCircle className="w-8 h-8 mx-auto text-slate-350" />
              <p className="text-xs text-slate-500">No personal recipes created yet.</p>
              <Link to="/recipes/create" className="text-xs font-bold text-brand-500 hover:underline">
                Create one now
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              <p className="text-[10px] text-slate-400 font-semibold bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
                💡 Drag any recipe card from here and drop it into a day slot!
              </p>
              
              {recipes.map((recipe) => (
                <div
                  key={recipe._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, recipe._id)}
                  className="flex gap-2.5 p-2 bg-slate-50 hover:bg-brand-50 dark:bg-slate-950/40 dark:hover:bg-brand-950/10 border border-slate-150 dark:border-slate-850 rounded-2xl cursor-grab active:cursor-grabbing hover:border-brand-500/30 transition-all select-none group"
                >
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-11 h-11 object-cover rounded-xl border border-slate-100 dark:border-slate-850 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-grow space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-brand-500 transition-colors">
                      {recipe.title}
                    </h4>
                    <span className="text-[10px] text-slate-450 flex items-center gap-1 font-semibold">
                      <FiClock /> {recipe.cookTime}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Weekly Grid Calendar */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            
            {weekDays.map((dayDate) => {
              const dayMeals = getMealsForDay(dayDate);
              const isToday = new Date().toDateString() === dayDate.toDateString();

              return (
                <div
                  key={dayDate.toISOString()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, dayDate)}
                  className={`border rounded-3xl p-4 flex flex-col min-h-[300px] transition-all duration-200 ${
                    isToday
                      ? 'bg-brand-50/20 dark:bg-brand-950/10 border-brand-500/40 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  {/* Day Header */}
                  <div className="border-b border-slate-100 dark:border-slate-850 pb-2 mb-3 text-center sm:text-left">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${isToday ? 'text-brand-500' : 'text-slate-400'}`}>
                      {getDayName(dayDate).slice(0, 3)}
                    </span>
                    <span className={`text-base font-black ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-slate-850 dark:text-white'}`}>
                      {getDayNumber(dayDate).split(' ')[1]}
                    </span>
                  </div>

                  {/* Drop Area / Planned Recipes list */}
                  <div className="flex-grow flex flex-col gap-2.5 overflow-y-auto pr-1">
                    {dayMeals.length > 0 ? (
                      dayMeals.map((meal) => (
                        <div
                          key={meal._id}
                          className="group relative flex flex-col gap-1.5 p-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl"
                        >
                          <img
                            src={meal.recipe?.image}
                            alt={meal.recipe?.title}
                            className="w-full aspect-[16/10] object-cover rounded-xl"
                          />
                          <div className="min-w-0 pr-6 space-y-0.5">
                            <Link
                              to={`/recipes/${meal.recipe?._id}`}
                              className="text-[10px] font-bold text-slate-850 dark:text-white hover:text-brand-500 hover:underline block truncate"
                            >
                              {meal.recipe?.title}
                            </Link>
                            <span className="text-[9px] text-slate-450 flex items-center gap-0.5">
                              <FiClock /> {meal.recipe?.cookTime}m
                            </span>
                          </div>

                          {/* Delete Plan Button */}
                          <button
                            onClick={() => handleDeletePlanned(meal._id)}
                            className="absolute bottom-2.5 right-2 text-slate-400 hover:text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors"
                            title="Remove meal plan"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex-grow flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-8 text-center text-slate-400 dark:text-slate-600 bg-slate-50/20 dark:bg-slate-950/5 pointer-events-none select-none">
                        <FiPlus className="w-5 h-5 mb-1" />
                        <span className="text-[9px] font-bold uppercase tracking-wide">Drop Here</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}

          </div>
        </div>

      </div>

    </div>
  );
};
export default MealPlanner;
