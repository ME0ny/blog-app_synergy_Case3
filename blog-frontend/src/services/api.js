import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Добавляем токен в заголовки запросов
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и это не запрос на обновление токена
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Помечаем запрос как повторный

      try {
        const newAccessToken = await refreshToken(); // Обновляем токен
        localStorage.setItem('authToken', newAccessToken); // Сохраняем новый токен
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`; // Обновляем заголовок
        return api(originalRequest); // Повторяем запрос с новым токеном
      } catch (refreshError) {
        console.error("Ошибка при обновлении токена:", refreshError);
        // Если refresh token также истек, выходим из системы
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        window.location.href = "/login"; // Перенаправляем на страницу авторизации
      }
    }

    return Promise.reject(error);
  }
);

// Функция для регистрации пользователя
export const register = async (userData) => {
  try {
    const response = await api.post("/register", userData);
    return response.data;
  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    throw error;
  }
};

// Функция для авторизации пользователя
export const login = async (username, password) => {
  try {
    const response = await api.post(
      "/token",
      new URLSearchParams({ username, password }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка при авторизации:", error);
    throw error;
  }
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error("Refresh token не найден в localStorage");
  }

  try {
    const response = await api.post("/refresh-token", { refresh_token: refreshToken });
    const newAccessToken = response.data.access_token;
    localStorage.setItem('authToken', newAccessToken); // Сохраняем новый access token
    return newAccessToken;
  } catch (error) {
    console.error("Ошибка при обновлении токена:", error.response?.data);
    throw error;
  }
};

export const createPost = async (postData) => {
  try {
    const response = await api.post("/posts/", postData);
    return response.data;
  } catch (error) {
    console.error("Ошибка при создании поста:", error);
    throw error;
  }
};

// Функция для получения публичной ленты (для неавторизованных пользователей)
export const getPublicFeed = async () => {
  try {
    const response = await api.get("/posts/public/feed");
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении публичной ленты:", error);
    throw error;
  }
};

// Функция для получения ленты для авторизованных пользователей
export const getFeed = async () => {
  try {
    const response = await api.get("/posts/feed");
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении ленты:", error);
    throw error;
  }
};

// services/api.js
export const followUser = async (username) => {
  try {
    const response = await api.post(`/users/follow/${username}`);
    return response.data;
  } catch (error) {
    console.error("Ошибка при подписке на пользователя:", error);
    throw error;
  }
};

export const getCommentsForPost = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/comments/`);
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении комментариев:", error);
    throw error;
  }
};

export const createComment = async (postId, content) => {
  try {
    const response = await api.post(
      `/posts/${postId}/comments/`,
      null, // Тело запроса пустое, так как content передается в query-параметре
      {
        params: { content }, // Передаем content как query-параметр
      }
    );
    return response.data; // Возвращаем созданный комментарий
  } catch (error) {
    console.error("Ошибка при создании комментария:", error.response?.data); // Логируем ответ сервера
    throw error;
  }
};

export const updatePost = async (postId, postData) => {
  try {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data; // Возвращаем обновленный пост
  } catch (error) {
    console.error("Ошибка при обновлении поста:", error.response?.data);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}`);
    return response.data; // Возвращаем ответ сервера
  } catch (error) {
    console.error("Ошибка при удалении поста:", error.response?.data);
    throw error;
  }
};

export const requestAccessToPost = async (postId) => {
  try {
    const response = await api.post(`/posts/access/request/${postId}`);
    return response.data; // Возвращаем данные о запросе доступа
  } catch (error) {
    console.error("Ошибка при запросе доступа к посту:", error.response?.data);
    throw error;
  }
};

export const getAccessRequestsForMyPosts = async () => {
  try {
    const response = await api.get("/posts/access/my_posts_requests");
    return response.data; // Возвращаем данные о запросах
  } catch (error) {
    console.error("Ошибка при получении запросов на доступ:", error.response?.data);
    throw error;
  }
};

export const rejectAccessRequest = async (requestId) => {
  try {
    const response = await api.post(`/posts/access/reject/${requestId}`);
    return response.data; // Возвращаем данные о запросе
  } catch (error) {
    console.error("Ошибка при отклонении запроса на доступ:", error.response?.data);
    throw error;
  }
};

export const grantAccessRequest = async (requestId) => {
  try {
    const response = await api.post(`/posts/access/grant/${requestId}`);
    return response.data; // Возвращаем данные о запросе
  } catch (error) {
    console.error("Ошибка при одобрении запроса на доступ:", error.response?.data);
    throw error;
  }
};
export default api;

