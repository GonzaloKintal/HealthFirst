
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Función para obtener el token sincrónicamente
const getToken = () => {
  const authData = localStorage.getItem('auth_data');
  return authData ? JSON.parse(authData).token : null;
};

// Interceptor de solicitud sincrónico
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;