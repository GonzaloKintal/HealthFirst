// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    // Aquí puedes añadir headers como tokens de autenticación si es necesario
    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

export default api;