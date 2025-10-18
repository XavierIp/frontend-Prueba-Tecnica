import React from 'react';
import { BACKEND_URL } from '../../services/productService';

const ProductCard = ({ product }) => {
  const imageUrl = product.imagen || '/';
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group border border-gray-200">
      <a href={`/product/${product._id}`} className="block"> {/* Enlace a la página del producto */}
        <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src={imageUrl}
            alt={product.NombreProducto}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
           
          />
        </div>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-800 h-10 overflow-hidden" title={product.NombreProducto}>
            {product.NombreProducto}
          </h3>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {product.idMarca?.nombre || 'Marca Genérica'}
          </p>
          <div className="flex justify-between items-center mt-3">
            <span className="text-lg font-bold text-gray-900">
              S/ {product.PrecioVenta?.toFixed(2) || '0.00'}
            </span>
            {/* Precio de oferta simulado (20% más) */}
            <span className="text-xs text-gray-500 line-through">
              S/ {(product.PrecioVenta * 1.20)?.toFixed(2)}
            </span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default ProductCard;