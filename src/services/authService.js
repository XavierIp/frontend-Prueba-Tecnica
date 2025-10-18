/**
 * @fileoverview Servicio de autenticación (authService.js).
 * Este archivo centraliza todas las interacciones con la API de autenticación del backend
 * y gestiona el almacenamiento local (localStorage) del token de autenticación y
 * los datos del usuario.
 */

// Importa axios, la librería usada para realizar peticiones HTTP al backend.
import axios from 'axios';

/**
 * URL base para los endpoints de autenticación (login, registro) en el backend.
 * Apunta al servidor desplegado en Render.
 * @const {string} AUTH_API_URL
 */
const AUTH_API_URL = 'https://backend-prueba-tecnica-kot6.onrender.com/api/auth';

/**
 * Clave utilizada para guardar el token JWT del administrador en localStorage.
 * @const {string} TOKEN_KEY
 */
const TOKEN_KEY = 'adminToken';

/**
 * Clave utilizada para guardar el objeto del usuario (en formato JSON string) en localStorage.
 * @const {string} USER_KEY
 */
const USER_KEY = 'adminUser';

/**
 * Envía las credenciales de inicio de sesión  al endpoint /login del backend.
 * @async
 * @function login
 * @param {object} credentials 
 * @returns {Promise<object>} 
 */
export const login = async (credentials) => {
    return await axios.post(`${AUTH_API_URL}/login`, credentials);
};

// --- Funciones de LocalStorage ---

/**
 * Guarda el token de autenticación y el objeto del usuario en el localStorage del navegador.
 * El objeto 'user' se convierte a un string JSON para poder guardarlo.
 * @function saveAuthData
 * @param {string} token - El token JWT (string) recibido del backend.
 * @param {object} user - El objeto de usuario recibido del backend.
 */
export const saveAuthData = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token); // Guarda el token.
    localStorage.setItem(USER_KEY, JSON.stringify(user)); // Guarda el usuario como string.
};

/**
 * Elimina el token y los datos del usuario del localStorage.
 * Efectivamente, cierra la sesión del usuario en el navegador.
 * @function logout
 */
export const logout = () => {
    localStorage.removeItem(TOKEN_KEY); // Elimina el token.
    localStorage.removeItem(USER_KEY); // Elimina los datos del usuario.
};

/**
 * Obtiene el token de autenticación guardado en localStorage.
 * @function getToken
 * @returns {string | null} El token JWT como string si existe, o null si no existe.
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Obtiene el objeto del usuario guardado en localStorage.
 * Lee el string JSON y lo convierte de nuevo a un objeto JavaScript.
 * Usado por AuthContext para inicializar el estado del usuario al cargar la app.
 * @function getUser
 * @returns {object | null} El objeto del usuario si existe, o null si no existe.
 */
export const getUser = () => {
    const user = localStorage.getItem(USER_KEY);
    // Si 'user' no es null, lo parsea (convierte de string a objeto). Si es null, devuelve null.
    return user ? JSON.parse(user) : null;
};

/**
 * Envía los datos de registro de un nuevo cliente (nombre, email, password)
 * al endpoint /register-client del backend.
 * @async
 * @function register
 * @param {object} userData - Objeto que contiene los datos del nuevo cliente.
 * @returns {Promise<object>} Una promesa que resuelve con la respuesta de Axios.
 */
export const register = async (userData) => {
    return await axios.post(`${AUTH_API_URL}/register-client`, userData);
};