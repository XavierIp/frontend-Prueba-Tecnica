/**
 * @fileoverview Componente Navbar (barra de navegación principal).
 * cambia su apariencia y las opciones que muestra según el estado de autenticación
 * del usuario (si está logueado o no, y si es administrador).
 * Se integra con el AuthContext para obtener esta información.
 */

import React, { useState } from 'react';
import { HiOutlineMenuAlt3, HiOutlineShoppingCart, HiOutlineSearch } from 'react-icons/hi';
import { FaRegUserCircle, FaUserCircle } from 'react-icons/fa'; // Iconos para usuario logueado/deslogueado.
import { FiSettings, FiLogOut } from 'react-icons/fi'; // Iconos para admin y cerrar sesión.
import { IoStorefrontOutline } from 'react-icons/io5'; // Icono para el logo.
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente funcional que renderiza la barra de navegación principal.
 */
const Navbar = () => {
   
    const [isOpen, setIsOpen] = useState(false);
    const { user, isAdmin, logout } = useAuth();

    const navLinks = [
        { name: "Inicio", link: "/" },
        { name: "Nosotros", link: "/about" },
    ];

    return (
       
        <nav className="bg-white shadow-lg sticky top-0 z-40"> 
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* Sección del Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <IoStorefrontOutline className="h-8 w-8 text-indigo-600" />
                            <span className="ml-2 text-2xl font-bold text-gray-800">ProStore</span>
                        </Link>
                    </div>

                    {/* Barra de Búsqueda (Visible solo en escritorio) */}
                    <div className="hidden md:flex flex-1 justify-center px-4">
                        <form className="w-full max-w-lg">
                            <div className="relative flex items-center text-gray-400 focus-within:text-gray-600">
                                <input
                                    type="search"
                                    name="search"
                                    placeholder="Buscar productos..."
                                    className="w-full pl-4 pr-10 py-2 border rounded-full bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-600 hover:text-indigo-600 transition duration-300"
                                >
                                    <HiOutlineSearch className="h-5 w-5" />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Sección de Acciones  Carrito, Login, Admin */}
                    <div className="flex items-center space-x-4">
                        
                        {/* Carrito de Compras (siempre visible) */}
                        <Link to="/cart" className="flex items-center text-gray-600 hover:text-indigo-600 transition duration-300">
                            <HiOutlineShoppingCart className="h-6 w-6" />
                            <span className="hidden sm:inline ml-1 text-sm font-medium">Carrito</span>
                        </Link>

                        {/* Renderizado Condicional: Botón de Admin */}
                        {/* Solo se muestra si el hook 'useAuth' indica que el usuario es administrador. */}
                        {isAdmin && (
                            <Link to="/admin" className="hidden sm:flex items-center text-gray-600 hover:text-indigo-600 transition duration-300" title="Panel de Administración">
                                <FiSettings className="h-5 w-5" />
                                <span className="ml-1 text-sm font-medium">Configurar</span>
                            </Link>
                        )}

                        {/* Renderizado Condicional: Botones de Sesión */}
                        {/* Comprueba si el objeto 'user' existe. */}
                        {user ? (
                        
                            <>
                                <Link to="/profile" className="hidden sm:flex items-center text-gray-600 hover:text-indigo-600 transition duration-300" title="Mi Perfil">
                                    <FaUserCircle className="h-6 w-6" />
                                    {/* Muestra solo el primer nombre del usuario. */}
                                    <span className="ml-1 text-sm font-medium">{user.nombre.split(' ')[0]}</span>
                                </Link>
                                <button onClick={logout} className="hidden sm:flex items-center text-gray-600 hover:text-red-600 transition duration-300" title="Cerrar Sesión">
                                    <FiLogOut className="h-5 w-5" />
                                </button>
                            </>
                        ) : (
                            // Si el usuario NO está logueado:
                            <Link to="/login" className="flex items-center text-gray-600 hover:text-indigo-600 transition duration-300">
                                <FaRegUserCircle className="h-6 w-6" />
                                <span className="hidden sm:inline ml-1 text-sm font-medium">Iniciar Sesión</span>
                            </Link>
                        )}

                        {/* Botón de Menú Móvil (Hamburguesa) */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsOpen(!isOpen)} 
                                type="button"
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            >
                                <HiOutlineMenuAlt3 className="block h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Menú Desplegable Móvil --- */}
            {isOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {/* Barra de búsqueda móvil */}
                        {/* ... (código de la barra de búsqueda móvil) ... */}
                        
                        <div className="border-t border-gray-200 !mt-3 !mb-2"></div>

                        {/* Enlaces de navegación básicos */}
                        {navLinks.map((item) => (
                            <Link key={item.name} to={item.link} className="text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
                                {item.name}
                            </Link>
                        ))}

                        {/* Opciones condicionales para el menú móvil */}
                        {isAdmin && (
                            <Link to="/admin" className="text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
                                Configurar (Admin)
                            </Link>
                        )}
                        
                        {user ? (
                            <>
                                <Link to="/profile" className="text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
                                    Mi Perfil ({user.nombre.split(' ')[0]})
                                </Link>
                                <button onClick={logout} className="w-full text-left text-gray-600 hover:bg-red-50 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium">
                                    Cerrar Sesión
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
                                Iniciar Sesión
                            </Link>
                        )}
                        
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;