import axios from 'axios';

// Configuración base de Axios para conectarse al backend Django
const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // Cambia esto a la URL de tu backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;