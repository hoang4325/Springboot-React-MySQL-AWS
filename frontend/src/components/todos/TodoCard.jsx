import React from 'react';
import { Calendar, Clock, Edit3, Trash2, Check, AlertCircle } from 'lucide-react';
import { PriorityBadge } from '../common/Badge';
import { formatDateTime, isOverdue } from '../../utils/formatters';

export const TodoCard = ({ todo, onToggleStatus, onEdit, onDelete }) => {
  const overdue = isOverdue(todo.dueDate, todo.completed);

  return (
    <div
      className={`group relative bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
        todo.completed
          ? 'bg-slate-50/70 border-slate-200/60 opacity-85'
          : overdue
          ? 'border-rose-200 hover:border-rose-300 shadow-sm hover:shadow-md'
          : 'border-slate-200/80 hover:border-sky-300 shadow-sm hover:shadow-md'
      }`}
    >
      <div>
        {/* Header: Status checkbox + Title + Priority badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              onClick={() => onToggleStatus(todo.id, todo.completed)}
              className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                todo.completed
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-slate-300 hover:border-sky-500 bg-white'
              }`}
              title={todo.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
            >
              {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            <h4
              className={`text-base font-semibold text-slate-800 leading-snug break-words ${
                todo.completed ? 'line-through text-slate-400 font-normal' : ''
              }`}
            >
              {todo.title}
            </h4>
          </div>

          <PriorityBadge priority={todo.priority} />
        </div>

        {/* Description */}
        {todo.description && (
          <p
            className={`mt-2.5 text-sm leading-relaxed pl-8 break-words ${
              todo.completed ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {todo.description}
          </p>
        )}
      </div>

      {/* Footer: Due date + Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 pl-8 flex-wrap">
          {todo.dueDate ? (
            <span
              className={`inline-flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-md ${
                overdue
                  ? 'bg-rose-50 text-rose-600 font-semibold'
                  : todo.completed
                  ? 'text-slate-400'
                  : 'text-slate-500 bg-slate-100'
              }`}
              title="Hạn chót"
            >
              {overdue ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
              )}
              {formatDateTime(todo.dueDate)}
              {overdue && <span className="text-[10px] uppercase font-bold">(Quá hạn)</span>}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              Không có hạn
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(todo)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            title="Chỉnh sửa"
            aria-label="Chỉnh sửa công việc"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(todo)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Xóa công việc"
            aria-label="Xóa công việc"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;
