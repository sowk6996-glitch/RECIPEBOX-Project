import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiMail, FiLock, FiUser, FiInfo, FiUploadCloud, FiTrash2, FiUserPlus } from 'react-icons/fi';

export const Register = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', username.trim());
      formData.append('email', email.trim());
      formData.append('password', password);
      formData.append('bio', bio);
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }

      await register(formData);
      showToast('Account created successfully! Welcome!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed. Try a different username/email.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 max-w-lg w-full shadow-lg space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight dark:text-white">Create Account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-455">
            Share recipes, save cookbooks, and plan your weekly meals!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Profile Image Drag & Drop */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Profile Avatar
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50/50 dark:bg-slate-950/30'
              }`}
            >
              <input {...getInputProps()} />
              
              {imagePreview ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Avatar preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-1 -right-1 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-md"
                      title="Remove image"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">{imageFile.name}</p>
                </div>
              ) : (
                <div className="space-y-2 text-slate-450 dark:text-slate-550 flex flex-col items-center">
                  <FiUploadCloud className="w-8 h-8 text-brand-500" />
                  <p className="text-xs font-semibold">
                    {isDragActive ? 'Drop your photo here!' : 'Drag & drop avatar here, or click to browse'}
                  </p>
                  <p className="text-[10px] text-slate-400">Supports PNG, JPG, JPEG (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="chef_jack"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-brand-500 transition-all dark:text-white"
                />
                <FiUser className="absolute left-3.5 top-3.5 text-slate-450 w-4 h-4" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="jack@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-brand-500 transition-all dark:text-white"
                />
                <FiMail className="absolute left-3.5 top-3.5 text-slate-450 w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Password *
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Must be at least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-brand-500 transition-all dark:text-white"
              />
              <FiLock className="absolute left-3.5 top-3.5 text-slate-450 w-4 h-4" />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Short Bio
            </label>
            <div className="relative">
              <textarea
                placeholder="Tell the community about your culinary style, favorite foods, or expertise..."
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-brand-500 transition-all dark:text-white resize-none"
              />
              <FiInfo className="absolute left-3.5 top-4.5 text-slate-450 w-4 h-4" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            <FiUserPlus /> {loading ? 'Registering Account...' : 'Sign Up'}
          </button>

        </form>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
export default Register;
