import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {

  const getPaginationNumbers = () => {
    const pageNumbers = [];
    const ellipsis = '...';
    const siblingCount = 1; 

    if (totalPages <= 5 + siblingCount) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }

    pageNumbers.push(1);

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 2);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 1);

    if (leftSiblingIndex > 2) {
      pageNumbers.push(ellipsis);
    }

    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      pageNumbers.push(i);
    }

    if (rightSiblingIndex < totalPages - 1) {
      pageNumbers.push(ellipsis);
    }
    
    pageNumbers.push(totalPages);

    return pageNumbers;
  };

  const pageNumbers = getPaginationNumbers();

  return (
    <div className="flex justify-center items-center flex-wrap mt-8 gap-2">
      
      {/* Botón Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
      >
        Anterior
      </button>

      {/* Números de Página */}
      {pageNumbers.map((number, index) => {
        // Si es "..."
        if (number === '...') {
          return (
            <span key={index} className="px-4 py-2 text-gray-500 hidden md:inline-block">
              ...
            </span>
          );
        }
        
        return (
          <button
            key={index}
            onClick={() => onPageChange(number)}
            className={`px-4 py-2 rounded-md transition duration-300 hidden md:inline-block ${
              currentPage === number
                ? 'bg-indigo-600 text-white shadow-md' // Estilo de página activa
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300' // Estilo de página inactiva
            }`}
          >
            {number}
          </button>
        );
      })}

      {/* Botón Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
      >
        Siguiente
      </button>
    </div>
  );
};

export default Pagination;