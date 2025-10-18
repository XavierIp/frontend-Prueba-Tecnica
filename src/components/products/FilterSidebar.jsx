import React, { useState, useEffect } from 'react';
import { Range } from 'react-range';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import * as catalogService from '../../services/catalogService';

// --- Componente de Sección de Filtro ---
const FilterSection = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="py-4 border-b border-gray-200 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full text-left text-sm font-semibold text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
                <span>{title}</span>
                <FiChevronDown className={`h-5 w-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="mt-4 space-y-3 pl-1">{children}</div>}
        </div>
    );
};

// --- Componente Principal de Sidebar ---
const FilterSidebar = ({ onFilterChange }) => {
    // Estados para los valores de filtro seleccionados
    const [priceRange, setPriceRange] = useState([0, 1000]); // Rango inicial
    const [selectedMarca, setSelectedMarca] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    // Estados para las opciones de filtro cargadas desde la API
    const [marcas, setMarcas] = useState([]);
    const [colores, setColores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const MIN_PRICE = 0;
    const MAX_PRICE = 1000; // Ajusta esto si tus productos son más caros

    // Cargar opciones de filtros desde el backend
    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const [marcasRes, coloresRes] = await Promise.all([
                    catalogService.getItems('marcas'),
                    catalogService.getItems('colores'),
                ]);
                setMarcas(marcasRes.data);
                setColores(coloresRes.data);
            } catch (error) {
                console.error("Error cargando opciones de filtro:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadFilterOptions();
    }, []);

    // --- Manejadores de cambio ---

    const handleMarcaChange = (event) => {
        const value = event.target.value;
        setSelectedMarca(value);
        onFilterChange({ marca: value });
    };

    const handleColorClick = (colorId) => {
        const newColorId = selectedColor === colorId ? '' : colorId;
        setSelectedColor(newColorId);
        onFilterChange({ color: newColorId });
    };

    const handleApplyPrice = () => {
        onFilterChange({ minPrice: priceRange[0], maxPrice: priceRange[1] });
    };

    if (isLoading) {
        return <div className="p-6 text-center text-gray-500 animate-pulse">Cargando filtros...</div>;
    }

    return (
        <aside className="w-full md:w-64 lg:w-72 bg-white p-4 md:p-6 rounded-lg shadow-md h-fit sticky top-24">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">FILTROS</h2>

            {/* Filtro de Marcas */}
            <FilterSection title="MARCA" defaultOpen={true}>
                <select
                    value={selectedMarca}
                    onChange={handleMarcaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                >
                    <option value="">Todas las marcas</option>
                    {marcas.map(marca => (
                        <option key={marca._id} value={marca._id}>{marca.nombre}</option>
                    ))}
                </select>
            </FilterSection>

            {/* Filtro de Rango de Precios */}
            <FilterSection title="RANGO DE PRECIO" defaultOpen={true}>
                <div className="relative pt-1 px-1 h-8 flex items-center">
                    <Range
                        values={priceRange} step={10} min={MIN_PRICE} max={MAX_PRICE}
                        onChange={(values) => setPriceRange(values)}
                        renderTrack={({ props, children }) => (
                            <div {...props} style={{ ...props.style }} className="h-1 w-full bg-gray-200 rounded-full">
                                <div ref={props.ref} className="h-1 rounded-full bg-indigo-500" style={{ background: `linear-gradient(to right, #e5e7eb ${priceRange[0]/MAX_PRICE*100}%, #6366f1 ${priceRange[0]/MAX_PRICE*100}%, #6366f1 ${priceRange[1]/MAX_PRICE*100}%, #e5e7eb ${priceRange[1]/MAX_PRICE*100}%)` }}/>
                                {children}
                            </div>
                        )}
                        renderThumb={({ props: thumbProps, isDragged }) => {
                            const { key, ...restThumbProps } = thumbProps;
                            return (
                                <div key={key} {...restThumbProps} style={{ ...restThumbProps.style }}
                                    className={`h-4 w-4 rounded-full ${isDragged ? 'bg-indigo-700' : 'bg-indigo-500'} shadow-md flex items-center justify-center cursor-grab focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
                                    <div className="h-1.5 w-1.5 bg-white rounded-full" />
                                </div>
                            );
                        }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>S/ {MIN_PRICE.toFixed(2)}</span>
                    <span>S/ {MAX_PRICE.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                    <p className="text-sm font-semibold text-gray-700 text-center bg-gray-100 px-3 py-1 rounded">
                        S/ {priceRange[0]} - S/ {priceRange[1]}
                    </p>
                    <button onClick={handleApplyPrice} className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" title="Aplicar precio">
                        <FiSearch className="h-4 w-4" />
                    </button>
                </div>
            </FilterSection>

            
        </aside>
    );
};

export default FilterSidebar;