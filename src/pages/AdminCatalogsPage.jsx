import React from 'react';
import CatalogCrud from '../components/admin/CatalogCrud';

const AdminCatalogsPage = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Gestión de Catálogos</h1>
      <p className="text-gray-600">
        Administra los atributos de los productos, como marcas, modelos, colores y tallas.
      </p>

      {/* Grid responsivo para los 4 CRUDs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CatalogCrud title="Marcas" resource="marcas" />
        <CatalogCrud title="Modelos" resource="modelos" />
        <CatalogCrud title="Colores" resource="colores" />
        <CatalogCrud title="Tallas" resource="tallas" />
      </div>
    </div>
  );
};

export default AdminCatalogsPage;