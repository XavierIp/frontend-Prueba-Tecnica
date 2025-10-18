import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService'; // Importa la función

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate('/', { replace: true });

  }, [navigate]); 

  // Muestra un mensaje mientras se cierra la sesión
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-semibold text-gray-700">Cerrando sesión...</h1>
    </div>
  );
};

export default LogoutPage;