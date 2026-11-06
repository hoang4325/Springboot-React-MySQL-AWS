import React from 'react';
import { Plus, ArrowUpDown, Filter } from 'lucide-react';
import { STATUS_FILTERS, PRIORITIES, SORT_OPTIONS } from '../../utils/constants';
import TodoSearch from './TodoSearch';

export const TodoFilterBar = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  sortBy,
  onSortByChange,
  sortDir,
  onToggleSortDir,
  onOpenCreateModal,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4 mb-6">
      {/* Top row: Search + Add Task Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <TodoSearch value={search} onChange={onSearchChange} />

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-sky-500/25 transition-all hover:shadow-lg active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm công việc mới</span>
        </button>
      </div>

      {/* Bottom row: Status Pills + Priority Filter + Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {STATUS_FILTERS.map((s) => {
            const isActive = status === s.value;
            return (
              <button
                key={s.value}
                onClick={() => onStatusChange(s.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Priority and Sorting dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Priority Select */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Ưu tiên:</span>
            <select
              value={priority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả</option>
              <option value="LOW">{PRIORITIES.LOW.label}</option>
              <option value="MEDIUM">{PRIORITIES.MEDIUM.label}</option>
              <option value="HIGH">{PRIORITIES.HIGH.label}</option>
            </select>
          </div>

          {/* Sort By Select */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="font-medium">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Direction Toggle */}
          <button
            onClick={onToggleSortDir}
            title={sortDir === 'asc' ? 'Tăng dần' : 'Giảm dần'}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortDir === 'asc' ? 'Tăng dần' : 'Giảm dần'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoFilterBar;
