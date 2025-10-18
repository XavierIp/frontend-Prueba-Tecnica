/**
 * @fileoverview Servicio de Productos
 *
 * Maneja la comunicación con el backend desplegado en Render, incluyendo
 * autenticación (envío de tokens JWT) y manejo de datos especiales
 * como FormData (para imágenes) y Blobs (para descargar archivos).
 */

import axios from 'axios';
import { getToken } from './authService';

/**
 * URL base para los endpoints de productos (/api/products).
 * @const {string} API_URL
 */
const API_URL = 'https://backend-prueba-tecnica-kot6.onrender.com/api/products';

/**
 * URL raíz del backend.
 * Utilizada para construir rutas completas a recursos estáticos, como imágenes
 * @const {string} BACKEND_URL
 */
export const BACKEND_URL = 'https://backend-prueba-tecnica-kot6.onrender.com';

// --- FUNCIONES PÚBLICAS (Para la tienda) ---

/**
 * Obtiene la lista pública de productos, aplicando filtros, paginación y ordenamiento.
 * Esta función es pública y no requiere token.
 * @async
 * @function getAllProducts
 * @param {object} params 
 * @returns {Promise<object>} 
 */
export const getAllProducts = async (params = {}) => {
  return await axios.get(API_URL, {
    params: params
  });
};

// --- FUNCIONES DE ADMIN (Protegidas) ---

/**
 * Obtiene la lista de productos para el panel de administración.
 * Esta es una función protegida y requiere un token.
 * @async
 * @function getAdminProducts
 * @param {number} page
 * @param {number} limit 
 * @param {string} search 
 * @param {string} marca 
 * @returns {Promise<object>} 
 */
export const getAdminProducts = async (page = 1, limit = 10, search = '', marca = '') => {
  // Obtiene el token de admin
  const token = getToken();
  
  // Construye el objeto de parámetros
  const params = {
    page,
    limit,
    search: search || undefined, 
    marca: marca || undefined   
  };

  
  return await axios.get(API_URL, {
    params: params, 
    headers: {
      Authorization: `Bearer ${token}` 
    }
  });
};

/**
 * Crea un nuevo producto. Envía los datos como 'multipart/form-data'
 * porque incluye un archivo de imagen.
 * Requiere token de admin.
 * @async
 * @function createProduct
 * @param {FormData} formData 
 * @returns {Promise<object>} 
 */
export const createProduct = async (formData) => {
  const token = getToken();
  return await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * Actualiza un producto existente por su ID.
 * También envía los datos como 'multipart/form-data' para manejar
 * el reemplazo opcional de la imagen.
 * Requiere token de admin.
 * @async
 * @function updateProduct
 * @param {string} id 
 * @param {FormData} formData 
 * @returns {Promise<object>} 
 */
export const updateProduct = async (id, formData) => {
  const token = getToken();
  return await axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * Llama al endpoint para exportar productos a Excel.
 * Envía los filtros actuales (`search`, `marca`) para exportar solo los resultados filtrados.
 * @async
 * @function exportProducts
 * @param {string} search 
 * @param {string} marca 
 * @returns {Promise<object>} 
 */
export const exportProducts = async (search = '', marca = '') => {
  const token = getToken();
  
  const params = {
    search: search || undefined,
    marca: marca || undefined
  };

  return await axios.get(`${API_URL}/export`, {
    params: params, // Envía los filtros como query params
    headers: {
      Authorization: `Bearer ${token}`
    },
    responseType: 'blob' 
  });
};

/**
 * Sube un archivo Excel para la carga masiva de productos.
 * Envía el archivo como 'multipart/form-data'.
 * Requiere token de admin.
 * @async
 * @function uploadMassProducts
 * @param {File} file 
 * @returns {Promise<object>} 
 */
export const uploadMassProducts = async (file) => {
  const token = getToken();
  const formData = new FormData();
  // 'excelFile' debe coincidir con el nombre esperado por Multer en el backend
  formData.append('excelFile', file); 

  return await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });
};

/**
 * Obtiene la ficha técnica de un producto en formato PDF.
 * Requiere token de admin.
 * @async
 * @function getProductPdf
 * @param {string} id - ID del producto.
 * @returns {Promise<object>} 
 */
export const getProductPdf = async (id) => {
  const token = getToken();
  return await axios.get(`${API_URL}/${id}/pdf`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    responseType: 'blob' 
  });
};

/**
 * Elimina un producto por su ID.
 * Requiere token de admin.
 * @async
 * @function deleteProduct
 * @param {string} id 
 * @returns {Promise<object>} 
 */
export const deleteProduct = async (id) => {
  const token = getToken();
  return await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};