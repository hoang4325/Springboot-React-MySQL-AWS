import axiosClient from './axiosClient';

export const todoApi = {
  getAll: (params) => {
    return axiosClient.get('/todos', { params });
  },

  getById: (id) => {
    return axiosClient.get(`/todos/${id}`);
  },

  create: (data) => {
    return axiosClient.post('/todos', data);
  },

  update: (id, data) => {
    return axiosClient.put(`/todos/${id}`, data);
  },

  updateStatus: (id, completed) => {
    return axiosClient.patch(`/todos/${id}/status`, { completed });
  },

  delete: (id) => {
    return axiosClient.delete(`/todos/${id}`);
  },

  getStats: () => {
    return axiosClient.get('/todos/stats');
  },
};

export default todoApi;
