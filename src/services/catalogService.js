/**
 * @fileoverview 
 * Proporciona funciones CRUD (Crear, Leer, Actualizar, Eliminar) reutilizables
 * para interactuar con los endpoints de catálogos (como Marcas, Modelos, Colores, Tallas)
 * de la API del backend.
 */

import axios from 'axios';

/**
 * URL base para los endpoints de la API del backend, excluyendo la parte de autenticación.
 * Apunta al servidor desplegado en Render.
 * @const {string} API_URL
 */
const API_URL = 'https://backend-prueba-tecnica-kot6.onrender.com/api';

/**
 * Función auxiliar interna para obtener el token de administrador desde el localStorage.
 * @function getToken
 * @returns {string | null} El token JWT o null si no se encuentra.
 */
const getToken = () => localStorage.getItem('adminToken');

// --- Funciones CRUD Genéricas ---

/**
 * Obtiene todos los items de un recurso de catálogo específico
 * Esta es una llamada pública, no requiere token.
 * @async
 * @function getItems
 * @param {string} resource
 * @returns {Promise<object>}
 * @throws {Error} 
 */
export const getItems = async (resource) => {
    return await axios.get(`${API_URL}/${resource}`);
};

/**
 * Crea un nuevo item en un recurso de catálogo específico.
 * Esta es una operación protegida y requiere un token de autenticación.
 * @async
 * @function createItem
 * @param {string} resource
 * @param {object} data 
 * @returns {Promise<object>} 
 * @throws {Error}
 */
export const createItem = async (resource, data) => {
    // Obtiene el token de admin.
    const token = getToken();
    return await axios.post(`${API_URL}/${resource}`, data, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/**
 * Actualiza un item existente en un recurso de catálogo específico por su ID.
 * Esta es una operación protegida y requiere un token.
 * @async
 * @function updateItem
 * @param {string} resource
 * @param {string} id 
 * @param {object} data 
 * @returns {Promise<object>} 
 * @throws {Error} 
 */
export const updateItem = async (resource, id, data) => {
    const token = getToken();
    return await axios.put(`${API_URL}/${resource}/${id}`, data, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/**
 * Elimina un item existente de un recurso de catálogo específico por su ID.
 * Esta es una operación protegida y requiere un token.
 * @async
 * @function deleteItem
 * @param {string} resource
 * @param {string} id 
 * @returns {Promise<object>}
 * @throws {Error} 
 */
export const deleteItem = async (resource, id) => {
    const token = getToken();
    return await axios.delete(`${API_URL}/${resource}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};