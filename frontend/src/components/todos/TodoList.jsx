import React from 'react';
import { ClipboardList, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import TodoCard from './TodoCard';
import { TodoListSkeleton } from '../common/LoadingSkeleton';

export const TodoList = ({
  todos,
  loading,
  error,
  onRetry,
  onToggleStatus,
  onEdit,
  onDelete,
  onOpenCreateModal,
}) => {
  if (loading) {
    return <TodoListSkeleton count={6} />;
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3">
        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-rose-800">Không thể tải danh sách công việc</h4>
        <p className="text-sm text-rose-600 max-w-md mx-auto">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Thử lại</span>
        </button>
      </div>
    );
  }

  if (!todos || todos.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
          <ClipboardList className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-slate-700">Chưa có công việc nào</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Không tìm thấy công việc phù hợp với bộ lọc hoặc danh sách của bạn đang trống.
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo công việc đầu tiên</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {todos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TodoList;
