/**
 * ProductListPage.jsx
 * * Componente principal para mostrar la lista pública de productos en la tienda.
 * Maneja la obtención de productos del backend, la aplicación de filtros (marca, color, precio),
 * el ordenamiento y la paginación, sincronizando el estado con los parámetros de la URL.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Componentes hijos
import FilterSidebar from '../components/products/FilterSidebar';
import ProductCard from '../components/products/ProductCard';
import Pagination from '../components/products/Pagination';

// Servicio para interactuar con la API de productos
import * as productService from '../services/productService';

const ProductListPage = () => {
    // --- ESTADOS ---

    // Datos de productos y estado de carga/error
    const [products, setProducts] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null); 

    // Paginación
    const [currentPage, setCurrentPage] = useState(1); 
    const [totalPages, setTotalPages] = useState(1); 
    const [totalProducts, setTotalProducts] = useState(0); 
    const [limit] = useState(8); 

    // Filtros y Ordenamiento (reflejan el estado actual basado en la URL)
    const [filters, setFilters] = useState({}); 
    const [sortBy, setSortBy] = useState('newest'); 

    // Hooks de React Router para leer y modificar la URL
    const location = useLocation(); 
    const navigate = useNavigate(); 


    /**
     * Leer parámetros de la URL al cargar o cuando la URL cambie.
     * Actualiza los estados locales (currentPage, sortBy, filters) para que coincidan con la URL.
     * Esto permite compartir enlaces con filtros/página aplicados y que funcionen al refrescar.
     */
    useEffect(() => {
        console.log("Effect [location.search]: Reading URL params...");
        const params = new URLSearchParams(location.search);
        const page = parseInt(params.get('page')) || 1;
        const sort = params.get('sort') || 'newest';
        const marca = params.get('marca') || '';
        const color = params.get('color') || ''; 
        const minPrice = params.get('minPrice') || '';
        const maxPrice = params.get('maxPrice') || '';

        // Actualiza los estados locales. Esto NO dispara fetchProducts directamente.
        setCurrentPage(page);
        setSortBy(sort);
        setFilters({ marca, color, minPrice, maxPrice });

    }, [location.search]); 


    /**
     * Cargar productos desde el backend.
     * Se dispara cuando cambian sus dependencias (currentPage, sortBy, filters).
     * Utiliza useCallback para optimizar y evitar recreaciones innecesarias.
     */
    const fetchProducts = useCallback(async () => {
       
        try {
            setIsLoading(true);
            setError(null); 
            console.log(`FETCHING PRODUCTS - Page: ${currentPage}, Sort: ${sortBy}, Filters:`, filters);

          
            const params = {
                page: currentPage,
                limit: limit, 
                sort: sortBy,
                marca: filters.marca || undefined,
                color: filters.color || undefined,
                minPrice: filters.minPrice || undefined,
                maxPrice: filters.maxPrice || undefined,
            };

            // Llama al servicio para obtener los productos
            const response = await productService.getAllProducts(params);

            // Actualiza el estado con los datos recibidos del backend
            setProducts(response.data.products);
            setTotalProducts(response.data.totalProducts);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);

        } catch (err) {
            setError("Error al cargar los productos. Por favor, intenta de nuevo más tarde.");
            console.error("Fetch Products Error Details:", err); // Log detallado del error
        } finally {
            setIsLoading(false); 
        }
  
    }, [currentPage, sortBy, filters, limit]); 


    /**
     * Disparar la carga de productos.
     * Este useEffect depende de la función `fetchProducts` (que está memoizada con useCallback).
     * Se ejecuta cuando el componente se monta por primera vez y cada vez que `fetchProducts` se recrea
     * (es decir, cuando cambian currentPage, sortBy, o filters).
     */
    useEffect(() => {
        console.log("Effect [fetchProducts]: Calling fetchProducts...");
        fetchProducts();
    }, [fetchProducts]); 

    /**
     * Función unificada para actualizar los parámetros de la URL.
     * @param {object} newParams - Objeto con los parámetros a añadir/actualizar/eliminar.
     */
    const updateURLAndNavigate = (newParams) => {
        const params = new URLSearchParams(location.search);
        let resetPage = false; 

        Object.keys(newParams).forEach(key => {
            if (key !== 'page' && params.get(key) !== newParams[key]) {
                resetPage = true;
            }
            // Si el nuevo valor existe, lo establece en la URL
            if (newParams[key]) {
                params.set(key, newParams[key]);
            } else {
                // Si el nuevo valor es vacío/null/undefined, lo elimina de la URL
                params.delete(key);
            }
        });

        // Si se cambió un filtro o el orden, siempre ir a la página 1
        if (resetPage) {
            params.set('page', '1');
        }

        // Navega a la nueva URL construida. Esto disparará el primer useEffect
        // que leerá la URL, actualizará los estados, y luego el segundo useEffect
        // llamará a fetchProducts con los nuevos estados.
        navigate(`?${params.toString()}`, { replace: true }); 
    };

    /**
     * Manejador llamado por FilterSidebar cuando un filtro cambia.
     * @param {object} newFilter 
     */
    const handleFilterChange = (newFilter) => {
        console.log("Filter Change Received:", newFilter);
        updateURLAndNavigate(newFilter); 
    };

    /**
     * Manejador para el cambio en el <select> de ordenamiento.
     */
    const handleSortChange = (e) => {
        updateURLAndNavigate({ sort: e.target.value }); 
    };

    /**
     * Manejador llamado por el componente Pagination cuando se hace clic en un número de página.
     */
    const handlePageChange = (pageNumber) => {
        // Solo actualiza el parámetro 'page' en la URL
        updateURLAndNavigate({ page: pageNumber });
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    // --- RENDERIZADO DEL COMPONENTE ---
    return (
        <div className="px-4 py-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Sidebar de Filtros */}
                <div className="w-full md:w-1/4 lg:w-72 flex-shrink-0"> {/* Ancho fijo en pantallas grandes */}
                    {/* Pasa la función handleFilterChange como prop */}
                    <FilterSidebar onFilterChange={handleFilterChange} />
                </div>

                {/* Contenido Principal (Grid de productos y paginación) */}
                <div className="w-full md:w-3/4">
                    {/* Barra superior con conteo y ordenamiento */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm mb-6 gap-3">
                        <span className="text-gray-700 text-sm font-medium whitespace-nowrap">
                           {/* Muestra un mensaje mientras carga, o el conteo */}
                           {isLoading ? 'Buscando productos...' : `Mostrando ${products.length} de ${totalProducts} productos`}
                        </span>
                        <div className="flex items-center space-x-2 text-sm w-full sm:w-auto justify-end">
                            <label htmlFor="sortBy" className="text-gray-600 whitespace-nowrap">Ordenar por:</label>
                            <select
                                id="sortBy"
                                className="border border-gray-300 rounded-md py-1 px-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white w-full sm:w-auto"
                                value={sortBy}
                                onChange={handleSortChange}
                                disabled={isLoading} // Deshabilita mientras carga
                            >
                                <option value="newest">Más nuevos</option>
                                <option value="price-asc">Precio: Más bajo</option>
                                <option value="price-desc">Precio: Más alto</option>
                                {/* Añade más opciones si tu backend las soporta (ej. 'name-asc') */}
                            </select>
                        </div>
                    </div>

                    {/* Grid de Productos o Mensajes de Estado */}
                    {isLoading ? (
                         // Skeleton Loading: Muestra cajas grises mientras carga
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                            {Array.from({ length: limit }).map((_, i) => ( // Muestra 'limit' placeholders
                                <div key={i} className="bg-white rounded-lg shadow-md h-80">
                                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-5 bg-gray-200 rounded w-1/4 mt-3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        // Mensaje de Error
                        <div className="text-center text-red-600 p-8 bg-red-50 rounded-lg shadow border border-red-200">
                           <p className="font-semibold text-lg">¡Oops! Algo salió mal</p>
                           <p className="text-sm mt-2">{error}</p>
                           {/* Botón para reintentar la carga */}
                           <button onClick={() => fetchProducts()} className="mt-4 px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition duration-150">Intentar de nuevo</button>
                        </div>
                    ) : products.length > 0 ? (
                        // Grid con los productos cargados
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                         // Mensaje si no se encontraron productos con los filtros
                         <div className="text-center text-gray-500 p-8 bg-gray-100 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-700">No se encontraron productos</h3>
                            <p className="text-sm mt-1">Intenta ajustar los filtros de búsqueda.</p>
                         </div>
                    )}

                    {/* Paginación */}
                    {/* Solo muestra si hay más de 1 página y no está cargando */}
                    {!isLoading && totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange} // Pasa el manejador correcto
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;