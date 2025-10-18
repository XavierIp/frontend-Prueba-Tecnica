/**
 * @fileoverview Creación y gestión del Contexto de Autenticación (AuthContext).
 *
 * Este archivo centraliza el estado global del usuario (si está autenticado, sus datos)
 * y provee funciones para manejar el inicio de sesión (handleLogin),
 * cierre de sesión (handleLogout) y registro (handleRegister)
 * a través de toda la aplicación de React.
 */

import React, { createContext, useContext, useState } from 'react';
import * as authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

/**
 * Crea el AuthContext. Este objeto (creado por React) contendrá el estado
 * de autenticación.
 * @type {React.Context}
 */
const AuthContext = createContext();

/**
 * Componente "Proveedor" que envuelve a la aplicación (o partes de ella).
 * Mantiene el estado del usuario (`user`) y provee las funciones de autenticación
 * (`login`, `logout`, `register`) y valores derivados (`isAdmin`)
 * a todos sus componentes hijos a través del `AuthContext.Provider`.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children 
 */
export const AuthProvider = ({ children }) => {
    /**
     * Estado local para almacenar el objeto del usuario actual.
     * `user` será el objeto del usuario o `null` si no está logueado.
     */
    const [user, setUser] = useState(authService.getUser());
    
    // Hook para obtener la función de navegación (para redirigir).
    const navigate = useNavigate();
    /**
     * Maneja el inicio de sesión del usuario.
     * Llama al servicio de API `authService.login` con las credenciales.
     * Si tiene éxito, guarda los datos (token y usuario) en localStorage
     * y actualiza el estado global `user`.
     *
     * @async
     * @param {object} credentials 
     * @returns {Promise<object>} 
     * @throws {Error} Lanza un error si la API falla 
     */
    const handleLogin = async (credentials) => {
        // Llama al servicio de API (backend)
        const response = await authService.login(credentials);
        const { token, user } = response.data;

        // Guarda los datos en localStorage para persistencia
        authService.saveAuthData(token, user);
        
        // Actualiza el estado de React 
        setUser(user);
        
        return response; // Devuelve la respuesta 
    };

    /**
     * Maneja el cierre de sesión del usuario.
     * Limpia los datos de autenticación del localStorage,
     * resetea el estado global `user` a `null`,
     * y redirige al usuario a la página de login.
     */
    const handleLogout = () => {
        authService.logout(); // Limpia localStorage
        setUser(null); // Limpia el estado global de React
        navigate('/'); 
    };

    /**
     * Maneja el registro de un nuevo usuario .
     * Llama al servicio de API `authService.register`.
     * Si tiene éxito, guarda los datos (token y usuario) en localStorage
     * y actualiza el estado global `user` (iniciando sesión automáticamente).
     *
     * @async
     * @param {object} userData 
     * @returns {Promise<object>} 
     * @throws {Error} 
     */
    const handleRegister = async (userData) => {
        // Llama al servicio de API (backend)
        const response = await authService.register(userData);
        const { token, user } = response.data;
        
        // Guarda los datos en localStorage y actualiza el estado global
        authService.saveAuthData(token, user);
        setUser(user);
        
        return response; // Devuelve la respuesta (para RegisterPage)
    };
    
    // --- Valor del Contexto ---
    
    /**
     * El objeto `value` que se compartirá con todos los componentes consumidores.
     * Contiene el estado del usuario, funciones para modificarlo y
     * un valor booleano derivado (`isAdmin`) para comprobaciones de permisos fáciles.
     */
    const value = {
        user, // El objeto del usuario logueado (o null)
        /**
         * Booleano derivado para verificar fácilmente si el usuario es administrador.
         * Usa optional chaining (`?.`) para evitar errores si `user` o `user.idRol` son nulos
         * (ej: cuando nadie está logueado).
         * @type {boolean}
         */
        isAdmin: user?.idRol?.nombre === 'admin',
        login: handleLogin, // Función para iniciar sesión
        logout: handleLogout, // Función para cerrar sesión
        register: handleRegister, // Función para registrarse
    };

    // Renderiza el Proveedor de Contexto nativo de React.
    // Pasa el objeto `value` componentes hijos
    // que estén envueltos por `AuthProvider`.
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook personalizado `useAuth` para consumir el AuthContext fácilmente.
 * En lugar de que cada componente tenga que importar `useContext` y `AuthContext`
 * por separado, simplemente importan y llaman a `useAuth()`.
 *
 * @returns {object} El objeto `value` del contexto (user, isAdmin, login, logout, register).
 * @throws {Error} 
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        // Esta comprobación ayuda a detectar errores de implementación tempranamente.
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};