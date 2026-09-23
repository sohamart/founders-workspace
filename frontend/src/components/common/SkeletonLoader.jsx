import React from 'react';

export const SkeletonLoader = ({ type = 'cards', count = 3 }) => {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="p-5 rounded-3xl bg-slate-100/80 border border-slate-200/60 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="w-20 h-4 bg-slate-200/80 rounded-md" />
              <div className="w-12 h-4 bg-slate-200/80 rounded-md" />
            </div>
            <div className="w-3/4 h-5 bg-slate-200/80 rounded-md" />
            <div className="w-full h-12 bg-slate-200/60 rounded-xl" />
            <div className="flex items-center justify-between pt-2">
              <div className="w-16 h-3 bg-slate-200/80 rounded-md" />
              <div className="w-24 h-6 bg-slate-200/80 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'kanban') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, colIdx) => (
          <div key={colIdx} className="space-y-3">
            <div className="h-9 bg-slate-200/70 rounded-2xl" />
            <div className="p-2.5 rounded-3xl bg-slate-100/60 border border-slate-200/60 space-y-3 min-h-[350px]">
              <div className="p-4 rounded-3xl bg-white border border-slate-200/60 space-y-2.5">
                <div className="w-24 h-3 bg-slate-200 rounded-md" />
                <div className="w-full h-4 bg-slate-200 rounded-md" />
                <div className="w-full h-1.5 bg-slate-200 rounded-full" />
                <div className="w-16 h-3 bg-slate-200 rounded-md" />
              </div>
              <div className="p-4 rounded-3xl bg-white border border-slate-200/60 space-y-2.5">
                <div className="w-20 h-3 bg-slate-200 rounded-md" />
                <div className="w-3/4 h-4 bg-slate-200 rounded-md" />
                <div className="w-full h-1.5 bg-slate-200 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-20 bg-slate-100 rounded-3xl border border-slate-200" />
      <div className="h-64 bg-slate-100 rounded-3xl border border-slate-200" />
    </div>
  );
};
