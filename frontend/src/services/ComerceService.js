// src/services/ComerceService.js
import api from './api';

export const obtenerTodosLosComercios = async () => {
  try {
    const response = await api.get('/comercios');
    return response.data;
  } catch (error) {
    console.error("Error al obtener los comercios:", error);
    return []; // Devolvemos un array vacío en caso de error
  }
};
