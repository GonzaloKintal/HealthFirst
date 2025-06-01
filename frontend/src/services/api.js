// services/api.js
import axios from 'axios';

// Configuración base de Axios
const api = axios.create({
  baseURL: 'http://localhost:8000/',
  // timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token JWT a cada petición
api.interceptors.request.use(
  (config) => {
    // Obtener el token como lo necesitas
    const authData = JSON.parse(localStorage.getItem('auth_data'));
    const token = authData?.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;