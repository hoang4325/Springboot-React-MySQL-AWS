import todoApi from '../api/todoApi';

export const todoService = {
  fetchTodos: async ({ search, status, priority, page = 0, size = 9, sortBy = 'createdAt', sortDir = 'desc' }) => {
    const params = {
      page,
      size,
      sortBy,
      sortDir,
    };

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    if (status === 'COMPLETED') {
      params.completed = true;
    } else if (status === 'PENDING') {
      params.completed = false;
    }

    if (priority && priority !== 'ALL') {
      params.priority = priority;
    }

    const res = await todoApi.getAll(params);
    return res.data;
  },

  fetchStats: async () => {
    const res = await todoApi.getStats();
    return res.data;
  },

  getTodo: async (id) => {
    const res = await todoApi.getById(id);
    return res.data;
  },

  createTodo: async (payload) => {
    const res = await todoApi.create(payload);
    return res.data;
  },

  updateTodo: async (id, payload) => {
    const res = await todoApi.update(id, payload);
    return res.data;
  },

  toggleTodoStatus: async (id, currentStatus) => {
    const res = await todoApi.updateStatus(id, !currentStatus);
    return res.data;
  },

  deleteTodo: async (id) => {
    const res = await todoApi.delete(id);
    return res.data;
  },
};

export default todoService;
