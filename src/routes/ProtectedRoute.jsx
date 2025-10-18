/**
 * @fileoverview Componente de Ruta Protegida (ProtectedRoute).
 *
 * permitir el acceso solo a usuarios autenticados.
 * Si el usuario no está autenticado, lo redirige a la página de inicio de sesión.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * @function useAuth
 * @returns {boolean} 
 */
const useAuth = () => {
    // Intenta leer el token 'adminToken' del almacenamiento local del navegador.
    const token = localStorage.getItem('adminToken');
    return token ? true : false;
};

/**
 * Componente de Ruta Protegida.
 * Si el usuario NO está autenticado, lo redirige a la página de "/login"
 * usando el componente `<Navigate>`.
 *
 * @component
 * @returns {JSX.Element} 
 */
const ProtectedRoute = () => {
    // Llama al hook useAuth para determinar si el usuario está autenticado.
    const isAuth = useAuth();
    return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;