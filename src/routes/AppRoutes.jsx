/**
 * @fileoverview Configuración central de rutas para la aplicación React.
 *
 * 1. Rutas Públicas de la Tienda (ej: /, /about), que usan el MainLayout.
 * 2. Rutas Públicas de Autenticación (ej: /login, /register), que no usan layout.
 * 3. Rutas Protegidas del Administrador (ej: /admin/*), que están
 * envueltas por un <ProtectedRoute> para seguridad y usan el <AdminLayout>.
 *
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Importaciones de Layouts ---

import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';


import ProductListPage from '../pages/ProductListPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import LogoutPage from '../pages/LogoutPage'; 

import AdminProductsPage from '../pages/AdminProductsPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AdminCatalogsPage from '../pages/AdminCatalogsPage';

import ProtectedRoute from './ProtectedRoute';

/**
 * Componente funcional que define la estructura de enrutamiento de la aplicación.
 * @returns {JSX.Element} Un árbol de componentes de Ruta.
 */
const AppRoutes = () => {
  return (
    <Routes>
      
      {/* --- 1. Rutas Públicas (Tienda) --- */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<ProductListPage />} />
        {/* Aquí irían otras rutas públicas como /producto/:id, /carrito, etc. */}
      </Route>
      
      {/* --- 2. Rutas Públicas (Autenticación) --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/logout" element={<LogoutPage />} />

      {/* --- 3. Rutas Protegidas (Admin) --- */}
      <Route element={<ProtectedRoute />}>
        {/* Si la protección se pasa, se renderiza el AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminProductsPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="catalogs" element={<AdminCatalogsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;