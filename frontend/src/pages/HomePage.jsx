import React, { useState } from 'react';
import useTodos from '../hooks/useTodos';
import TodoStats from '../components/todos/TodoStats';
import TodoFilterBar from '../components/todos/TodoFilterBar';
import TodoList from '../components/todos/TodoList';
import TodoFormModal from '../components/todos/TodoFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import Toast from '../components/common/Toast';

export const HomePage = () => {
  const {
    todos,
    stats,
    loading,
    actionLoading,
    error,
    pagination,
    filters,
    toast,
    closeToast,
    fetchTodos,
    handleCreate,
    handleUpdate,
    handleToggleStatus,
    handleDelete,
    setSearch,
    setStatus,
    setPriority,
    setSortBy,
    toggleSortDir,
    changePage,
  } = useTodos();

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTodo, setDeletingTodo] = useState(null);

  // Form modal triggers
  const handleOpenCreateModal = () => {
    setEditingTodo(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (todo) => {
    setEditingTodo(todo);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingTodo(null);
  };

  const handleFormSubmit = async (formData) => {
    let success = false;
    if (editingTodo) {
      success = await handleUpdate(editingTodo.id, formData);
    } else {
      success = await handleCreate(formData);
    }
    if (success) {
      handleCloseFormModal();
    }
  };

  // Delete modal triggers
  const handleOpenDeleteDialog = (todo) => {
    setDeletingTodo(todo);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeletingTodo(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTodo) return;
    const success = await handleDelete(deletingTodo.id);
    if (success) {
      handleCloseDeleteDialog();
    }
  };

  return (
    <div>
      {/* Toast notifications */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Hero / Header greeting */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Quản lý công việc & Mục tiêu
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi tiến độ, phân loại mức độ ưu tiên và hoàn thành các mục tiêu đúng hạn.
        </p>
      </div>

      {/* Metrics Dashboard */}
      <TodoStats stats={stats} />

      {/* Search, Filter, Sort and Add Task action */}
      <TodoFilterBar
        search={filters.search}
        onSearchChange={setSearch}
        status={filters.status}
        onStatusChange={setStatus}
        priority={filters.priority}
        onPriorityChange={setPriority}
        sortBy={filters.sortBy}
        onSortByChange={setSortBy}
        sortDir={filters.sortDir}
        onToggleSortDir={toggleSortDir}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* Todo List / Cards Grid */}
      <TodoList
        todos={todos}
        loading={loading}
        error={error}
        onRetry={fetchTodos}
        onToggleStatus={handleToggleStatus}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteDialog}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          onPageChange={changePage}
        />
      </div>

      {/* Create / Edit Modal Form */}
      <TodoFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        initialData={editingTodo}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa công việc"
        message={
          deletingTodo
            ? `Bạn có chắc chắn muốn xóa "${deletingTodo.title}"? Dữ liệu sẽ bị xóa vĩnh viễn khỏi MySQL.`
            : 'Bạn có chắc chắn muốn xóa công việc này?'
        }
        confirmText="Xác nhận xóa"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default HomePage;
