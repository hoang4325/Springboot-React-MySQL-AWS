import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export const TodoSearch = ({ value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState(value || '');

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== value) {
        onChange(searchTerm);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, onChange, value]);

  const handleClear = () => {
    setSearchTerm('');
    onChange('');
  };

  return (
    <div className="relative flex-1 min-w-[240px]">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Tìm kiếm công việc theo tiêu đề hoặc mô tả..."
        className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm placeholder:text-slate-400"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          aria-label="Xóa từ khóa tìm kiếm"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default TodoSearch;
