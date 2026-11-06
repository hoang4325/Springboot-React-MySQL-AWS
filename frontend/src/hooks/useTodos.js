import { useState, useEffect, useCallback } from 'react';
import todoService from '../services/todoService';

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, highPriority: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 9,
    totalElements: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    priority: 'ALL',
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch stats separately to keep header metrics accurate regardless of current filter
  const fetchStats = useCallback(async () => {
    try {
      const data = await todoService.fetchStats();
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Fetch todos with active pagination & filters
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await todoService.fetchTodos({
        search: filters.search,
        status: filters.status,
        priority: filters.priority,
        page: pagination.page,
        size: pagination.size,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
      });

      if (data) {
        setTodos(data.content || []);
        setPagination((prev) => ({
          ...prev,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
        }));
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.size]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Actions
  const handleCreate = async (payload) => {
    setActionLoading(true);
    try {
      await todoService.createTodo(payload);
      showToast('success', 'Thêm công việc thành công!');
      fetchTodos();
      fetchStats();
      return true;
    } catch (err) {
      showToast('error', err.message || 'Thêm công việc thất bại');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id, payload) => {
    setActionLoading(true);
    try {
      await todoService.updateTodo(id, payload);
      showToast('success', 'Cập nhật công việc thành công!');
      fetchTodos();
      fetchStats();
      return true;
    } catch (err) {
      showToast('error', err.message || 'Cập nhật công việc thất bại');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await todoService.toggleTodoStatus(id, currentStatus);
      showToast(
        'success',
        !currentStatus ? 'Đã đánh dấu hoàn thành!' : 'Đã chuyển sang chưa hoàn thành'
      );
      fetchTodos();
      fetchStats();
    } catch (err) {
      showToast('error', err.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await todoService.deleteTodo(id);
      showToast('success', 'Đã xóa công việc thành công!');
      fetchTodos();
      fetchStats();
      return true;
    } catch (err) {
      showToast('error', err.message || 'Xóa công việc thất bại');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Filter setters (reset page to 0 when filter changes)
  const setSearch = (search) => {
    setFilters((prev) => ({ ...prev, search }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const setStatus = (status) => {
    setFilters((prev) => ({ ...prev, status }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const setPriority = (priority) => {
    setFilters((prev) => ({ ...prev, priority }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const setSortBy = (sortBy) => {
    setFilters((prev) => ({ ...prev, sortBy }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const toggleSortDir = () => {
    setFilters((prev) => ({
      ...prev,
      sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc',
    }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const changePage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return {
    todos,
    stats,
    loading,
    actionLoading,
    error,
    pagination,
    filters,
    toast,
    showToast,
    closeToast,
    fetchTodos,
    fetchStats,
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
  };
};

export default useTodos;
