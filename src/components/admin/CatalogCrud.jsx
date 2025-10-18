/**
 * @fileoverview Componente genérico para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
 * en catálogos simples como Marcas, Modelos, Colores y Tallas.
 * Se conecta al backend a través de `catalogService`.
 */
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
// Importa el servicio genérico para catálogos.
import * as catalogService from '../../services/catalogService';

// --- Componente de Modal Genérico ---
/**
 * Un componente de modal reutilizable para agregar o editar un item de catálogo.
 * @param {object} props
 * @param {boolean} props.isOpen - Si el modal debe estar abierto o no.
 * @param {function} props.onClose - Función a llamar para cerrar el modal.
 * @param {function} props.onSubmit - Función a llamar al enviar el formulario.
 * @param {object | null} props.currentItem - El objeto del item si se está editando, o null si se está agregando.
 * @param {string} props.title - El título singular del catálogo 
 */
const CrudModal = ({ isOpen, onClose, onSubmit, currentItem, title }) => {
    // Estado para el campo 'nombre' del formulario.
    const [nombre, setNombre] = useState(currentItem ? currentItem.nombre : '');

    /**
     * Efecto que se dispara cuando `currentItem` o `isOpen` cambian.
     * Si el modal se abre para editar, actualiza el estado 'nombre'
     * con el nombre del item actual. Si se abre para agregar, limpia el campo.
     */
    useEffect(() => {
        setNombre(currentItem ? currentItem.nombre : '');
    }, [currentItem, isOpen]); 
    // Si el modal no debe estar abierto, no renderiza nada.
    if (!isOpen) return null;
    /**
     * Manejador para el evento 'submit' del formulario.
     * (pasada por props) con los datos del formulario, y limpia el estado 'nombre'.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...currentItem, nombre }); // Envía el objeto completo .
        setNombre('');
    };
    /**
     * Manejador para el botón "Cancelar".
     * Limpia el estado 'nombre' y llama a la función `onClose` (pasada por props).
     */
    const handleClose = () => {
        setNombre(''); 
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            {/* Contenedor del modal */}
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md m-4 transform transition-all animate-scale-in">
                {/* Título del modal: cambia dinámicamente si se está editando o agregando */}
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {currentItem ? 'Editar' : 'Agregar'} {title}
                </h2>
                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input 
                        type="text" 
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)} // Actualiza el estado 'nombre' al escribir
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
                        required // Campo obligatorio
                        autoComplete="off" // Evita autocompletado del navegador
                    />
                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button 
                            type="button" 
                            onClick={handleClose} 
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition shadow-md">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Componente Principal del CRUD de Catálogo ---
/**
 * Componente que muestra una lista de items de un catálogo
 * y permite agregarlos, editarlos y eliminarlos usando el `CrudModal`.
 * @param {object} props
 * @param {string} props.title - Título a mostrar en la cabecera 
 * @param {string} props.resource - El nombre del recurso en la API 
 */
const CatalogCrud = ({ title, resource }) => {
    // --- Estados ---
    const [items, setItems] = useState([]); // Almacena la lista de items 
    const [isLoading, setIsLoading] = useState(true); // Indica si los datos están cargando
    const [error, setError] = useState(null); // Almacena un mensaje de error si la carga falla
    
    // Estados para controlar el modal
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null); // Guarda el item que se está editando

    /**
     * Efecto para cargar los items (GET) desde la API cuando el componente se monta
     * o cuando la prop 'resource' cambia.
     */
    useEffect(() => {
        const loadItems = async () => {
            try {
                setIsLoading(true);
                setError(null);
                // Llama al servicio genérico `getItems` pasando el recurso 
                const res = await catalogService.getItems(resource);
                setItems(res.data); // Actualiza el estado con los items recibidos
            } catch (err) {
                setError(`Error al cargar ${resource}.`);
                console.error(err); // Registra el error en consola
            } finally {
                setIsLoading(false); // Deja de cargar, ya sea con éxito o error
            }
        };
        loadItems();
    }, [resource]); // Vuelve a ejecutar este efecto si la prop 'resource' cambia

    // --- Manejadores de Modal ---
    /**
     * Abre el modal. Si se pasa un 'item', se abre en modo "Editar".
     * Si no, se abre en modo "Agregar".
     * @param {object | null} item - El item a editar, o null.
     */
    const handleOpenModal = (item = null) => {
        setCurrentItem(item); // Establece el item actual.
        setModalOpen(true);
    };

    /**
     * Cierra el modal y limpia el estado `currentItem`.
     */
    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentItem(null);
    };

    // --- Manejadores de Acciones CRUD ---

    /**
     * Manejador llamado por el modal al guardar (Submit).
     * Decide si llamar a la API para crear (POST) o actualizar (PUT).
     * @param {object} itemData - Datos del formulario del modal 
     */
    const handleSubmit = async (itemData) => {
        try {
            if (itemData._id) {
                // --- Lógica de Editar (PUT) ---
                // Si itemData tiene _id, significa que estamos editando.
                const res = await catalogService.updateItem(resource, itemData._id, { nombre: itemData.nombre });
                // Actualiza el estado 'items' reemplazando el item antiguo por el actualizado.
                setItems(items.map(item => item._id === res.data._id ? res.data : item));
            } else {
                // --- Lógica de Agregar (POST) ---
                // Si no tiene _id, es un item nuevo.
                const res = await catalogService.createItem(resource, { nombre: itemData.nombre });
                // Añade el nuevo item (devuelto por la API) al final de la lista.
                setItems([...items, res.data]);
            }
            handleCloseModal(); // Cierra el modal si la operación fue exitosa.
        } catch (err) {
            // Muestra una alerta si la API devuelve un error.
            alert(`Error al guardar: ${err.response?.data?.message || err.message}`);
        }
    };

    /**
     * Manejador para el botón de eliminar (DELETE).
     * Pide confirmación y luego llama al servicio de eliminación.
     * @param {string} id - El _id del item a eliminar.
     */
    const handleDelete = async (id) => {
        // Pide confirmación al usuario.
        if (window.confirm('¿Estás seguro de que quieres eliminar este item?')) {
            try {
                // Llama al servicio de eliminación.
                await catalogService.deleteItem(resource, id);
                // Actualiza el estado 'items' filtrando el item eliminado.
                setItems(items.filter(item => item._id !== id));
            } catch (err) {
                alert(`Error al eliminar: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    // --- Renderizado del Componente ---
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Cabecera con título y botón de agregar */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <button 
                    onClick={() => handleOpenModal()} // Abre el modal en modo "Agregar"
                    className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
                >
                    <FiPlus className="w-4 h-4" />
                    <span>Agregar</span>
                </button>
            </div>

            {/* Lista de items */}
            <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                {/* Muestra estado de carga */}
                {isLoading && <p className="p-4 text-center text-gray-500">Cargando...</p>}
                {/* Muestra estado de error */}
                {error && <p className="p-4 text-center text-red-500">{error}</p>}
                {/* Muestra mensaje si no hay items y no está cargando */}
                {!isLoading && !error && items.length === 0 && (
                    <p className="p-4 text-center text-gray-500">No hay items creados.</p>
                )}
                {/* Mapea y renderiza los items si existen */}
                {!isLoading && !error && items.map((item) => (
                    <div key={item._id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                        {/* Muestra el ID y el Nombre */}
                        {/* <span className="text-sm text-gray-700">{item._id}</span> // ID Opcional */}
                        <span className="text-sm text-gray-700">{item.nombre}</span>
                        {/* Botones de Editar y Eliminar */}
                        <div className="space-x-2">
                            <button onClick={() => handleOpenModal(item)} className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition" title="Editar">
                                <FiEdit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition" title="Eliminar">
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Renderiza el Modal (está oculto por defecto hasta que isOpen sea true) */}
            <CrudModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSubmit={handleSubmit}
                currentItem={currentItem}
                title={title} // Pasa el título singular al modal.
            />
        </div>
    );
};

export default CatalogCrud;