import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import { PRIORITIES } from '../../utils/constants';
import { toInputDateTime } from '../../utils/formatters';

export const TodoFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    completed: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'MEDIUM',
        dueDate: initialData.dueDate ? toInputDateTime(initialData.dueDate) : '',
        completed: Boolean(initialData.completed),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        completed: false,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    } else if (formData.title.trim().length > 255) {
      newErrors.title = 'Tiêu đề không được vượt quá 255 ký tự';
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Mô tả không được vượt quá 2000 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      priority: formData.priority,
      dueDate: formData.dueDate ? formData.dueDate : null,
    };

    if (isEdit) {
      payload.completed = formData.completed;
    }

    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Tiêu đề <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ví dụ: Thiết kế cơ sở dữ liệu MySQL"
            className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
              errors.title
                ? 'border-rose-400 focus:ring-rose-500/20'
                : 'border-slate-200 focus:ring-sky-500/20 focus:border-sky-500'
            }`}
          />
          {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Mô tả chi tiết
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ghi chú thêm các yêu cầu cần hoàn thành..."
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none"
          />
          {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description}</p>}
        </div>

        {/* Priority Radio Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Mức độ ưu tiên
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(PRIORITIES).map((p) => {
              const isSelected = formData.priority === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p.value })}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? `${p.color} border-current shadow-sm`
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${p.dotColor}`} />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Due Date Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Hạn chót hoàn thành
          </label>
          <input
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        {/* Completed checkbox (if editing) */}
        {isEdit && (
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="completed"
              checked={formData.completed}
              onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
              className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="completed" className="text-sm font-medium text-slate-700 cursor-pointer">
              Đánh dấu đã hoàn thành
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isLoading && <Spinner size="sm" className="text-white" />}
            {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TodoFormModal;
