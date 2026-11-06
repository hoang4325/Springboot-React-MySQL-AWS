import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, totalElements, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-sm text-slate-500">
        Hiển thị trang <span className="font-semibold text-slate-700">{currentPage + 1}</span> /{' '}
        <span className="font-semibold text-slate-700">{totalPages}</span> (Tổng{' '}
        <span className="font-semibold text-slate-700">{totalElements}</span> công việc)
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }).map((_, index) => {
          // Show first, last, and window around currentPage
          if (
            index === 0 ||
            index === totalPages - 1 ||
            (index >= currentPage - 1 && index <= currentPage + 1)
          ) {
            const isActive = index === currentPage;
            return (
              <button
                key={index}
                onClick={() => onPageChange(index)}
                className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {index + 1}
              </button>
            );
          } else if (index === currentPage - 2 || index === currentPage + 2) {
            return (
              <span key={index} className="px-1 text-slate-400">
                ...
              </span>
            );
          }
          return null;
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
