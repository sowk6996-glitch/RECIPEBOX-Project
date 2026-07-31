import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSun, FiMoon, FiMenu, FiX, FiUser, FiLogOut, FiHeart, FiBookOpen, FiCalendar, FiPlusSquare, FiCompass, FiGrid } from 'react-icons/fi';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const activeClassName = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
        : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
    }`;

  const mobileActiveClassName = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-150 ${
      isActive
        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
        : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-850 dark:text-white">
            <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/30">
              <FiPlusSquare className="w-5 h-5 rotate-45" />
            </span>
            <span>Recipe<span className="text-brand-500">Box</span></span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-2">
            <NavLink to="/" end className={activeClassName}>
              <FiCompass className="w-4 h-4" /> Explore
            </NavLink>
            {user && (
              <>
                <NavLink to="/feed" className={activeClassName}>
                  <FiGrid className="w-4 h-4" /> My Feed
                </NavLink>
                <NavLink to="/dashboard" className={activeClassName}>
                  <FiHeart className="w-4 h-4" /> My Recipes
                </NavLink>
                <NavLink to="/cookbooks" className={activeClassName}>
                  <FiBookOpen className="w-4 h-4" /> Cookbooks
                </NavLink>
                <NavLink to="/planner" className={activeClassName}>
                  <FiCalendar className="w-4 h-4" /> Meal Planner
                </NavLink>
              </>
            )}
          </div>

          {/* Right Action Items */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors duration-150"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-slate-800">
                {/* Create Recipe Button */}
                <Link
                  to="/recipes/create"
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm transition-all duration-150"
                >
                  <FiPlusSquare className="w-4 h-4" /> Create Recipe
                </Link>
                {/* Profile Link */}
                <Link
                  to={`/profile/${user._id || user.id}`}
                  className="flex items-center gap-2 hover:opacity-85 transition-opacity duration-150"
                >
                  <img
                    src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={user.username}
                    className="w-9 h-9 rounded-full object-cover border-2 border-brand-500/25"
                  />
                </Link>
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-colors duration-150"
                  title="Logout"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white px-4 py-2 text-sm font-semibold transition-all duration-150"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-md shadow-brand-500/25 transition-all duration-150"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Theme Controls */}
          <div className="flex items-center lg:hidden gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-350"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <FiSun className="w-5.5 h-5.5" /> : <FiMoon className="w-5.5 h-5.5" />}
            </button>
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="p-2 rounded-xl text-slate-850 dark:text-white"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Panel */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 px-4 pt-2 pb-6 space-y-2 shadow-xl">
          <NavLink to="/" end onClick={() => setIsOpen(false)} className={mobileActiveClassName}>
            <FiCompass className="w-5 h-5" /> Explore
          </NavLink>

          {user ? (
            <>
              <NavLink to="/feed" onClick={() => setIsOpen(false)} className={mobileActiveClassName}>
                <FiGrid className="w-5 h-5" /> My Feed
              </NavLink>
              <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={mobileActiveClassName}>
                <FiHeart className="w-5 h-5" /> My Recipes
              </NavLink>
              <NavLink to="/cookbooks" onClick={() => setIsOpen(false)} className={mobileActiveClassName}>
                <FiBookOpen className="w-5 h-5" /> Cookbooks
              </NavLink>
              <NavLink to="/planner" onClick={() => setIsOpen(false)} className={mobileActiveClassName}>
                <FiCalendar className="w-5 h-5" /> Meal Planner
              </NavLink>
              <NavLink to="/recipes/create" onClick={() => setIsOpen(false)} className={mobileActiveClassName}>
                <FiPlusSquare className="w-5 h-5" /> Create Recipe
              </NavLink>
              <NavLink to={`/profile/${user._id || user.id}`} onClick={() => setIsOpen(false)} className={mobileActiveClassName}>
                <FiUser className="w-5 h-5" /> Profile
              </NavLink>

              <hr className="border-slate-100 dark:border-slate-900 my-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              >
                <FiLogOut className="w-5 h-5" /> Logout
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex justify-center items-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex justify-center items-center py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
