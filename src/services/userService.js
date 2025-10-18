/**
 * @fileoverview Servicio de usuarios 
 * Este archivo gestiona las operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
 * relacionadas específicamente con los usuarios, en particular los administradores.
 * Todas las operaciones (excepto el login/registro que están en authService)
 * requieren un token de autenticación.
 */

import axios from 'axios';

/**
 * URL base para los endpoints de usuarios 
 * Apunta al backend desplegado en Render.
 * @const {string} API_URL
 */
const API_URL = 'https://backend-prueba-tecnica-kot6.onrender.com/api/users';

/**
 * URL base para los endpoints de autenticación (donde está /register-admin).
 * @const {string} AUTH_API_URL
 */
const AUTH_API_URL = 'https://backend-prueba-tecnica-kot6.onrender.com/api/auth';

/**
 * Función auxiliar interna para obtener el token de administrador desde el localStorage.
 * @function getToken
 * @returns {string | null} El token JWT o null si no se encuentra.
 */
const getToken = () => localStorage.getItem('adminToken');

/**
 * Obtiene la lista de todos los usuarios con rol de "admin".
 * Requiere un token de administrador para la autorización.
 * @async
 * @function getAdminUsers
 * @returns {Promise<object>} 
 * @throws {Error} 
 */
export const getAdminUsers = async () => {
    const token = getToken();
    return await axios.get(`${API_URL}/admins`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/**
 * Crea un nuevo usuario administrador.
 * Requiere un token de administrador para la autorización.
 * @async
 * @function createAdminUser
 * @param {object} userData 
 * @returns {Promise<object>} 
 * @throws {Error} 
 */
export const createAdminUser = async (userData) => {
    const token = getToken(); 
    return await axios.post(`${AUTH_API_URL}/register-admin`, userData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/**
 * Actualiza un usuario existente por su ID.
 * Requiere un token de administrador para la autorización.
 * @async
 * @function updateUser
 * @param {string} id 
 * @param {object} userData 
 * @returns {Promise<object>} 
 * @throws {Error} 
 */
export const updateUser = async (id, userData) => {
    const token = getToken(); 
    return await axios.put(`${API_URL}/${id}`, userData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/**
 * Elimina un usuario existente por su ID.
 * Requiere un token de administrador para la autorización.
 * @async
 * @function deleteUser
 * @param {string} id 
 * @returns {Promise<object>} 
 * @throws {Error} 
 */
export const deleteUser = async (id) => {
    const token = getToken(); 
    return await axios.delete(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};