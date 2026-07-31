import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiChevronLeft, FiPlus, FiTrash2, FiUploadCloud, FiSave, FiEdit } from 'react-icons/fi';
import api from '../services/api';

export const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Basic Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  
  // Ingredients list
  const [ingredients, setIngredients] = useState([]);

  // Instructions steps
  const [instructions, setInstructions] = useState([]);

  // Nutritional Info
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  // Tags
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  // Image Upload File
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data } = await api.get(`/api/recipes/${id}`);
        
        // Check ownership
        const authorId = data.author?._id || data.author;
        if (authorId.toString() !== (user._id || user.id).toString()) {
          showToast('Not authorized to edit this recipe!', 'error');
          navigate(`/recipes/${id}`);
          return;
        }

        setTitle(data.title);
        setDescription(data.description);
        setCookTime(data.cookTime);
        setDifficulty(data.difficulty);
        setIngredients(data.ingredients || []);
        setInstructions(data.instructions || []);
        setTags(data.tags || []);
        setExistingImage(data.image);
        
        if (data.nutritionalInfo) {
          setCalories(data.nutritionalInfo.calories || '');
          setProtein(data.nutritionalInfo.protein || '');
          setCarbs(data.nutritionalInfo.carbs || '');
          setFats(data.nutritionalInfo.fats || '');
        }
      } catch (err) {
        console.error(err);
        showToast('Error loading recipe details', 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRecipe();
    }
  }, [id, user, navigate, showToast]);

  // File Drop Setup
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview('');
  };

  // Ingredients handlers
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: 'g' }]);
  };

  const handleRemoveIngredient = (index) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, idx) => idx !== index));
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  // Instructions handlers
  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleRemoveInstruction = (index) => {
    if (instructions.length === 1) return;
    setInstructions(instructions.filter((_, idx) => idx !== index));
  };

  const handleInstructionChange = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  // Tags handlers
  const handleAddTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!title.trim() || !description.trim() || !cookTime || !difficulty) {
      showToast('Please fill in all basic fields', 'warning');
      return;
    }

    const validIngredients = ingredients.filter(i => i.name.trim() && i.quantity);
    const validInstructions = instructions.filter(step => step.trim());

    if (validIngredients.length === 0) {
      showToast('Please add at least one valid ingredient (with quantity and name)', 'warning');
      return;
    }
    if (validInstructions.length === 0) {
      showToast('Please add at least one instruction step', 'warning');
      return;
    }

    setUpdating(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('cookTime', cookTime);
      formData.append('difficulty', difficulty);
      formData.append('ingredients', JSON.stringify(validIngredients));
      formData.append('instructions', JSON.stringify(validInstructions));
      formData.append('tags', JSON.stringify(tags));

      const nutritionalInfo = {
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fats: Number(fats) || 0
      };
      formData.append('nutritionalInfo', JSON.stringify(nutritionalInfo));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      setUploadProgress(50);

      const { data } = await api.put(`/api/recipes/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(50 + Math.round(percentCompleted * 0.45));
        }
      });

      setUploadProgress(100);
      showToast('Recipe updated successfully!', 'success');
      navigate(`/recipes/${data._id}`);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update recipe', 'error');
    } finally {
      setUpdating(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pb-20">
      
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/recipes/${id}`}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <FiChevronLeft className="w-4 h-4" /> Cancel and Back
        </Link>
        <h1 className="text-xl font-bold dark:text-white flex items-center gap-1.5">
          <FiEdit /> Edit Recipe
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core details card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 lg:p-8 shadow-sm space-y-6">
          
          <h2 className="text-lg font-bold border-b border-slate-50 dark:border-slate-850 pb-3 dark:text-white">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left side inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Classic Margherita Pizza"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Description *
                </label>
                <textarea
                  placeholder="Tell the community what makes this dish special..."
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Cook Time (mins) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 30"
                    min="1"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Difficulty *
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right side upload & tags */}
            <div className="space-y-4">
              
              {/* React Dropzone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Recipe Image
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-200 aspect-[16/11] flex flex-col items-center justify-center ${
                    isDragActive
                      ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50/50 dark:bg-slate-950/30'
                  }`}
                >
                  <input {...getInputProps()} />

                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-md"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : existingImage ? (
                    <div className="relative w-full h-full">
                      <img src={existingImage} alt="Existing" className="w-full h-full object-cover rounded-2xl" />
                      <div className="absolute inset-0 bg-slate-950/40 hover:bg-slate-950/25 flex flex-col items-center justify-center rounded-2xl text-white font-semibold transition-all">
                        <FiUploadCloud className="w-8 h-8 mb-1" />
                        <span className="text-xs">Drag/click to change photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-slate-450 flex flex-col items-center">
                      <FiUploadCloud className="w-10 h-10 text-brand-500" />
                      <p className="text-xs font-bold">Drag & drop image, or click to browse</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Category Tags (Press Enter)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Italian, Keto, Dessert"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
                />
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-855 text-slate-750 dark:text-slate-250 text-xs px-2.5 py-1 rounded-full font-semibold"
                    >
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}>
                        <FiTrash2 className="w-3 h-3 hover:text-rose-500" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Ingredients list editor */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 lg:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-855 pb-3">
            <h2 className="text-lg font-bold dark:text-white">Ingredients List</h2>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="flex items-center gap-1 text-xs font-bold text-brand-500 hover:text-brand-600"
            >
              <FiPlus /> Add Ingredient Row
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Ingredient Name"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                  required
                  className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  min="0"
                  step="any"
                  value={ing.quantity}
                  onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                  required
                  className="w-20 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                  required
                  className="w-24 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
                />
                <button
                  type="button"
                  disabled={ingredients.length === 1}
                  onClick={() => handleRemoveIngredient(idx)}
                  className="p-3 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors"
                >
                  <FiTrash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions step editor */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 lg:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-855 pb-3">
            <h2 className="text-lg font-bold dark:text-white">Instructions (Steps)</h2>
            <button
              type="button"
              onClick={handleAddInstruction}
              className="flex items-center gap-1 text-xs font-bold text-brand-500 hover:text-brand-600"
            >
              <FiPlus /> Add Step Row
            </button>
          </div>

          <div className="space-y-4">
            {instructions.map((step, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center mt-1">
                  {idx + 1}
                </span>
                <textarea
                  placeholder="Step description..."
                  rows="2"
                  value={step}
                  onChange={(e) => handleInstructionChange(idx, e.target.value)}
                  required
                  className="flex-grow bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 dark:text-white resize-none"
                />
                <button
                  type="button"
                  disabled={instructions.length === 1}
                  onClick={() => handleRemoveInstruction(idx)}
                  className="p-3 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors mt-1"
                >
                  <FiTrash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Nutritional values */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 lg:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold border-b border-slate-50 dark:border-slate-855 pb-3 dark:text-white">
            Nutritional Details (Optional)
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 dark:text-slate-500">Calories (kcal)</label>
              <input
                type="number"
                placeholder="e.g. 350"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 dark:text-slate-500">Protein (g)</label>
              <input
                type="number"
                placeholder="e.g. 24"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-455 dark:text-slate-500">Carbohydrates (g)</label>
              <input
                type="number"
                placeholder="e.g. 45"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-455 dark:text-slate-500">Fats (g)</label>
              <input
                type="number"
                placeholder="e.g. 12"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-4 items-center justify-end">
          {updating && (
            <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}

          <Link
            to={`/recipes/${id}`}
            className="px-6 py-3 rounded-2xl text-sm font-semibold border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-955 text-slate-750 dark:text-slate-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updating}
            className="px-8 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 transition-all flex items-center gap-1.5"
          >
            <FiSave /> {updating ? `Saving (${uploadProgress}%)...` : 'Save Changes'}
          </button>
        </div>

      </form>
    </div>
  );
};
export default EditRecipe;
