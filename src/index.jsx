import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// 1. Importa el AuthProvider
import { AuthProvider } from './context/AuthContext';
// 2. Importa BrowserRouter
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 3. Envuelve tu App con el AuthProvider */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);