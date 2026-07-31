import React from 'react';

export const RecipeCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm animate-pulse">
      {/* Image Placeholder */}
      <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800 w-full" />

      {/* Info Content Placeholder */}
      <div className="p-5 space-y-4">
        {/* Difficulty & Time tags */}
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>

        {/* Title */}
        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>

          {/* Rating */}
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const RecipeGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, idx) => (
        <RecipeCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export const RecipeDetailSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-8">
      {/* Breadcrumb / Title area */}
      <div className="space-y-3">
        <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Main Grid: Image & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="space-y-6">
          <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="grid grid-cols-4 gap-4 pt-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
