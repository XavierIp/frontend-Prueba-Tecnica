/**
 * @fileoverview Componente AdminLayout.
 * Este archivo define la estructura visual principal (layout) para todas las páginas
 * del panel de administración (ej: /admin/products, /admin/users).
 */

import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    FiHome,     // Icono para "Ir a la Tienda"
    FiBox,      // Icono para "Productos"
    FiUsers,    // Icono para "Usuarios"
    FiLogOut,   // Icono para "Cerrar Sesión"
    FiMenu,     // Icono para menú hamburguesa (móvil)
    FiX,        // Icono para cerrar (móvil)
    FiTag       // Icono para "Catálogos"
} from 'react-icons/fi';

/**
 *
 * @param {object} props
 * @param {string} props.to 
 * @param {JSX.Element} props.icon 
 * @param {React.ReactNode} props.children 
 */
const SidebarLink = ({ to, icon, children }) => {
    // Obtiene la información de la ubicación actual (ruta).
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);

    return (
        <Link
            to={to}
            className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                ${isActive
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                }
            `}
        >
            {icon}
            <span className="font-medium">{children}</span>
        </Link>
    );
};

/**
 * Componente principal del Layout de Administración.
 * Define la estructura visual que envuelve a todas las páginas de /admin.
 * Maneja el estado del sidebar móvil (abierto/cerrado).
 */
const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarLinks = (
        <>
            {/* Enlaces principales de navegación del dashboard */}
            <SidebarLink to="/admin/products" icon={<FiBox className="w-5 h-5" />}>
                Productos
            </SidebarLink>
            <SidebarLink to="/admin/users" icon={<FiUsers className="w-5 h-5" />}>
                Usuarios
            </SidebarLink>
            <SidebarLink to="/admin/catalogs" icon={<FiTag className="w-5 h-5" />}>
                Catálogos
            </SidebarLink>
            
            {/* Separador visual. '!mt-auto' empuja estos enlaces al final del sidebar. */}
            <div className="border-t border-gray-200 !mt-auto"></div>
            
            {/* Enlaces de salida */}
            <SidebarLink to="/" icon={<FiHome className="w-5 h-5" />}>
                Ir a la Tienda
            </SidebarLink>
            <SidebarLink to="/logout" icon={<FiLogOut className="w-5 h-5" />}>
                Cerrar Sesión
            </SidebarLink>
        </>
    );

    return (
      
        <div className="flex h-screen bg-gray-100">
            
            {/* --- Sidebar (Escritorio) --- */}
            <aside 
                className={`
                    hidden md:flex flex-col w-64 bg-white shadow-lg transition-all duration-300
                `}
            >
                {/* Logo/Título del Sidebar */}
                <div className="flex items-center justify-center h-20 shadow-md">
                    <h1 className="text-2xl font-bold text-indigo-600">Admin XaviStore</h1>
                </div>
                {/* Contenedor de navegación. 'flex-1' hace que ocupe el espacio restante. */}
                <nav className="flex-1 flex flex-col p-6 space-y-4">
                    {sidebarLinks} {/* Renderiza los enlaces definidos arriba */}
                </nav>
            </aside>
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)} // Cierra el sidebar al hacer clic en el overlay.
                    className="fixed inset-0 z-20 bg-black opacity-50 md:hidden" // 'md:hidden' lo oculta en escritorio.
                ></div>
            )}

         
            <aside 
                className={`
                    fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-white shadow-lg 
                    transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    md:hidden transition-transform duration-300
                `}
            >
                {/* Cabecera del sidebar móvil con botón de cierre */}
                <div className="flex items-center justify-between h-20 px-6 shadow-md">
                    <h1 className="text-2xl font-bold text-indigo-600">Admin</h1>
                    <button onClick={() => setSidebarOpen(false)} className="text-gray-600 hover:text-indigo-600">
                        <FiX className="w-6 h-6" /> 
                    </button>
                </div>
                {/* Navegación móvil */}
                <nav className="flex-1 flex flex-col p-6 space-y-4">
                    {sidebarLinks} {/* Reutiliza los mismos enlaces */}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex md:hidden items-center justify-between h-16 px-6 bg-white shadow-md">
                    <button 
                        onClick={() => setSidebarOpen(true)} 
                        className="text-gray-600 hover:text-indigo-600 focus:outline-none"
                    >
                        <FiMenu className="w-6 h-6" />
                    </button>
                    <span className="font-semibold text-lg">Panel de Admin</span>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 md:p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;