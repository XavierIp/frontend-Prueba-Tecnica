/**
 * @fileoverview Componente RegisterPage.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoStorefrontOutline } from 'react-icons/io5';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

/**
 * Componente funcional para la página de registro.
 */
const RegisterPage = () => {
    // --- ESTADOS ---

    // Estados para almacenar los valores de los campos del formulario.
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Estado para almacenar y mostrar mensajes de error de la API (ej: "email ya existe").
    const [error, setError] = useState(null);
    // Estado para mostrar un indicador de carga mientras se procesa la solicitud.
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { register } = useAuth();

    /**
     * Manejador para el evento 'submit' del formulario de registro.
     * Es una función asíncrona porque espera la respuesta de la API.
     * @param {React.FormEvent} e - El evento del formulario.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Llama a la función 'register' del AuthContext, pasando los datos del formulario.
            // Esta función se encarga de llamar al backend, guardar el token/usuario y actualizar el estado global.
            await register({ nombre, email, password });
            // Si el registro es exitoso, redirige al usuario a la página principal ('/').
            navigate('/');
        } catch (err) {
            // Si la función 'register' lanza un error (ej: el email ya existe), lo captura.
            // Muestra el mensaje de error que envía el backend, o un mensaje genérico.
            setError(err.response?.data?.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
        } finally {
            // Se ejecuta siempre, ya sea que la petición falle o tenga éxito.
            // Desactiva el estado de carga.
            setIsLoading(false);
        }
    };

    
    return (
        // Contenedor principal que centra la tarjeta de registro en la pantalla.
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transform transition-all animate-scale-in">
                {/* Logo y Título */}
                <div className="flex flex-col items-center mb-8">
                    <Link to="/" className="p-3 bg-indigo-100 rounded-full mb-3">
                        <IoStorefrontOutline className="h-10 w-10 text-indigo-600" />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">Crear Cuenta</h1>
                    <p className="text-gray-500 mt-1">Únete a XaviStore</p>
                </div>

                {/* Formulario de Registro */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Input para el Nombre */}
                    <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    {/* Input para el Email */}
                    <div className="relative">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    {/* Input para la Contraseña */}
                    <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input type="password" placeholder="Contraseña (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" required minLength={6} />
                    </div>

                    {/* Muestra el mensaje de error si existe */}
                    {error && (<p className="text-sm text-red-600 text-center">{error}</p>)}

                    {/* Botón de envío del formulario */}
                    <button type="submit" disabled={isLoading} 
                        className={`w-full py-3 px-4 text-base font-semibold text-white rounded-lg shadow-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {/* Cambia el texto del botón si está cargando */}
                        {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </button>
                </form>

                {/* Enlace para ir a la página de Login */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;