// src/services/api.js
import axios from 'axios';

// Creamos una configuración base para Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Coge la URL del archivo .env
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;