import React from "react";

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6 mb-4"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-slate-200 rounded-full w-16"></div>
        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
      </div>
    </div>
  );
}
