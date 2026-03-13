// src/services/productService.js
import api from './api';

export const obtenerProductosDeComercio = async (idComercio) => {
  try {
    // Esto llamará a: http://localhost:3000/api/productos/comercio/1
    const response = await api.get(`/productos/comercio/${idComercio}`);
    return response.data; // Devuelve el array de productos en JSON
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    return []; // Si hay error, devolvemos un array vacío para que no rompa la web
  }
};