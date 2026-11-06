import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    // Return the response data body directly (ApiResponse)
    return response.data;
  },
  (error) => {
    const errorResponse = error.response?.data;
    const message =
      errorResponse?.message ||
      (errorResponse?.validationErrors
        ? Object.values(errorResponse.validationErrors).join(', ')
        : null) ||
      error.message ||
      'Đã xảy ra lỗi không xác định';

    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
