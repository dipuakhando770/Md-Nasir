import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between h-[380px] animate-pulse">
      <div>
        <div className="w-full h-48 bg-slate-800 rounded-xl mb-4" />
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-2" />
        <div className="h-5 bg-slate-800 rounded w-4/5 mb-3" />
        <div className="h-4 bg-slate-800 rounded w-1/2" />
      </div>
      <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
        <div className="h-6 bg-slate-800 rounded w-1/3" />
        <div className="h-9 bg-slate-800 rounded-lg w-24" />
      </div>
    </div>
  );
};

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3.5 animate-pulse min-w-[180px]">
      <div className="w-12 h-12 rounded-lg bg-slate-800 shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-slate-800 rounded w-3/4 mb-1.5" />
        <div className="h-3 bg-slate-800 rounded w-1/2" />
      </div>
    </div>
  );
};
