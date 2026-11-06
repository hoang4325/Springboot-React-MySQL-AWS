import React from 'react';

export const TodoCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm animate-pulse space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-5 h-5 rounded bg-slate-200"></div>
          <div className="h-5 bg-slate-200 rounded w-2/3"></div>
        </div>
        <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
      </div>
      <div className="space-y-2 pl-8">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-4/5"></div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 pl-8">
        <div className="w-24 h-4 bg-slate-200 rounded"></div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-200 rounded-lg"></div>
          <div className="w-7 h-7 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export const TodoListSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <TodoCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export default TodoListSkeleton;
