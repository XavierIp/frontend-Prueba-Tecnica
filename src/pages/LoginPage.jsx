import React, { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { IoStorefrontOutline } from 'react-icons/io5';
import { FiMail, FiLock } from 'react-icons/fi';
// 1. Importa el hook useAuth
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // 2. Obtén la función 'login' del contexto
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 3. Llama a la función 'login' del contexto
      await login({ email, password });
      
      // 4. Redirige a la página principal
      navigate('/'); 

    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transform transition-all animate-scale-in">
        {/* ... (Logo y Título) ... */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-100 rounded-full mb-3">
            <IoStorefrontOutline className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">XaviStore</h1>
          <p className="text-gray-500 mt-1">Ingresa a tu panel de control</p>
        </div>
        
        {/* ... (Formulario) ... */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              required
            />
          </div>
          {/* Password Input */}
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              required
            />
          </div>
          {/* Mensaje de Error */}
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
          {/* Botón de Login */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-3 px-4 text-base font-semibold text-white rounded-lg shadow-md
              bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 
              focus:ring-indigo-500 focus:ring-offset-2 transition duration-300
              ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;