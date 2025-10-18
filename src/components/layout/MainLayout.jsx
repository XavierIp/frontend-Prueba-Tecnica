import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../layout/Navbar';

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto p-4 mt-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;