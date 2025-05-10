import axios from 'axios';

// Configuración base de Axios para conectarse al backend Django
const api = axios.create({
  baseURL: 'http://localhost:8000/', // Cambia esto a la URL de tu backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a cada petición
// api.interceptors.request.use(
//   (config) => {
//     const authData = localStorage.getItem('auth_data');
//     if (authData) {
//       const { token } = JSON.parse(authData);
//       if (token) {
//           config.headers['Authorization'] = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => {
//       return Promise.reject(error);
//   }
// );

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;