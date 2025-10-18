/**
 * @fileoverview src/pages/AdminProductsPage.jsx
 *
 * Página del panel de administración para la Gestión de Productos (CRUD).
 * Este componente maneja la visualización, creación, edición, eliminación,
 * filtrado, paginación, exportación a Excel e importación masiva de productos.
 * Utiliza componentes modales (ProductModal, MassUploadModal) para las operaciones.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    FiSearch, FiPlus, FiUpload, FiDownload,
    FiEdit, FiTrash2, FiFile, FiX, FiRefreshCw, FiPrinter
} from 'react-icons/fi';
// Servicios
import * as productService from '../services/productService';
import * as catalogService from '../services/catalogService';
// Componentes
import Pagination from '../components/products/Pagination';
// Utilidades
import { saveAs } from 'file-saver'; // Para descargar archivos (Excel, PDF)

// --- Modal de Agregar/Editar Producto ---
/**
 * Componente de modal reutilizable para crear o editar un producto.
 * @param {object} props
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSave - Función asíncrona llamada al guardar (pasa FormData y el ID del producto).
 * @param {object | null} props.editingProduct - El producto a editar, o null si se va a crear uno nuevo.
 */
const ProductModal = ({ isOpen, onClose, onSave, editingProduct }) => {
    // --- Estados del Formulario ---
    const [formData, setFormData] = useState({}); // Almacena los valores de los inputs (controlados)
    const [imageFile, setImageFile] = useState(null); // Almacena el archivo de imagen seleccionado
    const [previewImage, setPreviewImage] = useState(null); // URL (local o de Cloudinary) para la vista previa

    // Estados para las opciones de los <select>
    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [colores, setColores] = useState([]);
    const [tallas, setTallas] = useState([]);
    const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false); // Estado de carga para los selects

    /**
     * Efecto para cargar los catálogos (marcas, modelos, etc.) desde la API
     * cada vez que el modal se abre.
     */
    useEffect(() => {
        if (isOpen) {
            setIsLoadingCatalogs(true);
            const loadCatalogs = async () => {
                try {
                    // Carga todos los catálogos en paralelo para mayor eficiencia
                    const [marcasRes, modelosRes, coloresRes, tallasRes] = await Promise.all([
                        catalogService.getItems('marcas'),
                        catalogService.getItems('modelos'),
                        catalogService.getItems('colores'),
                        catalogService.getItems('tallas'),
                    ]);
                    setMarcas(marcasRes.data);
                    setModelos(modelosRes.data);
                    setColores(coloresRes.data);
                    setTallas(tallasRes.data);
                } catch (error) {
                    console.error("Error cargando catálogos", error);
                    alert("Error al cargar datos para el formulario.");
                } finally {
                    setIsLoadingCatalogs(false);
                }
            };
            loadCatalogs();
        }
    }, [isOpen]); // Se dispara solo cuando isOpen cambia de false a true

    /**
     * Efecto para poblar el formulario cuando se abre en modo "Editar",
     * o limpiarlo cuando se abre en modo "Agregar".
     */
    useEffect(() => {
        if (isOpen) {
            if (editingProduct) {
                // Modo Edición: Rellena el formulario con los datos del producto
                setFormData({
                    NombreProducto: editingProduct.NombreProducto || '',
                    PrecioVenta: editingProduct.PrecioVenta || '',
                    stock: editingProduct.stock || '',
                    idMarca: editingProduct.idMarca?._id || '',
                    idModelo: editingProduct.idModelo?._id || '',
                    idColor: editingProduct.idColor?._id || '',
                    idTalla: editingProduct.idTalla?._id || '',
                });
                // CORRECCIÓN: Usa la URL completa de Cloudinary (que está en 'editingProduct.imagen')
                setPreviewImage(editingProduct.imagen || null);
                setImageFile(null); // Resetea cualquier archivo de imagen seleccionado
            } else {
                // Modo Agregar: Resetea el formulario a valores vacíos
                setFormData({
                    NombreProducto: '', PrecioVenta: '', stock: '',
                    idMarca: '', idModelo: '', idColor: '', idTalla: ''
                });
                setPreviewImage(null);
                setImageFile(null);
            }
        }
    }, [editingProduct, isOpen]); // Se dispara si cambia el producto a editar o si se abre el modal

    /**
     * Manejador para actualizar el estado 'formData' cuando
     * el usuario escribe en cualquier input o select.
     */
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /**
     * Manejador para el input de tipo 'file' (imagen).
     * Guarda el archivo en 'imageFile' y genera una vista previa local.
     */
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file); // Guarda el objeto File
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result); // Genera un Data URL para la preview
            reader.readAsDataURL(file);
        } else {
             // Si el usuario cancela la selección, vuelve a la imagen original (si edita)
             setPreviewImage(editingProduct?.imagen || null);
             setImageFile(null);
        }
    };

    /**
     * Manejador para el envío (submit) del formulario.
     * Construye un objeto FormData para enviar los datos (incluida la imagen)
     * y llama a la función 'onSave' del componente padre.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLoadingCatalogs) return; // Evita envío si los catálogos aún cargan
        
        // Validación simple
        if (!formData.NombreProducto || !formData.PrecioVenta || !formData.stock || !formData.idMarca) {
            alert('Por favor, completa los campos obligatorios (*).');
            return;
        }

        const data = new FormData();
        // Añade todos los campos de texto al FormData
        Object.keys(formData).forEach(key => {
            if(formData[key] !== ''){ data.append(key, formData[key]); }
        });
        // Añade el archivo de imagen solo si se seleccionó uno nuevo
        if (imageFile) { 
            data.append('imagen', imageFile); 
        }
        
        // Llama a la función del padre (handleSaveProduct)
        onSave(data, editingProduct?._id);
    };

    // No renderiza nada si el modal está cerrado
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl m-4 transform transition-all animate-scale-in max-h-[95vh] flex flex-col">
                {/* Cabecera del Modal */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                        {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100">
                        <FiX className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Cuerpo del Modal (Formulario) */}
                {isLoadingCatalogs ? (
                    <div className="text-center p-10 text-gray-600 animate-pulse">Cargando opciones...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-grow pr-2">
                        {/* Fila 1: Nombre y Precio */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Producto <span className="text-red-500">*</span></label>
                                <input type="text" name="NombreProducto" value={formData.NombreProducto || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/) <span className="text-red-500">*</span></label>
                                <input type="number" step="0.01" min="0" name="PrecioVenta" value={formData.PrecioVenta || ''} onChange={handleChange} placeholder="0.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>
                        </div>

                        {/* Fila 2: Stock y Marca */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock <span className="text-red-500">*</span></label>
                                <input type="number" min="0" name="stock" value={formData.stock || ''} onChange={handleChange} placeholder="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Marca <span className="text-red-500">*</span></label>
                                <select name="idMarca" value={formData.idMarca || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required>
                                    <option value="">-- Seleccione --</option>
                                    {marcas.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Fila 3: Modelo y Color */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                                <select name="idModelo" value={formData.idModelo || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                                    <option value="">-- Seleccione --</option>
                                    {modelos.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                <select name="idColor" value={formData.idColor || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                                    <option value="">-- Seleccione --</option>
                                    {colores.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Fila 4: Talla e Imagen */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Talla</label>
                                <select name="idTalla" value={formData.idTalla || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                                    <option value="">-- Seleccione --</option>
                                    {tallas.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen {editingProduct && !imageFile ? '(Opcional: Reemplazar)' : ''}</label>
                                <input type="file" accept="image/*" name="imagen" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"/>
                            </div>
                        </div>

                        {/* Vista Previa de Imagen */}
                        {previewImage && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">Vista Previa</label>
                                <img src={previewImage} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded-md shadow-sm border border-gray-200" />
                            </div>
                        )}

                        {/* Botones de Acción (Footer) */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition duration-150">
                                Cancelar
                            </button>
                            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition duration-150 shadow-md">
                                Guardar Producto
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

// --- Modal de Carga Masiva ---
const MassUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        setError(null);
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
                setSelectedFile(file);
            } else {
                setError('Archivo inválido. Solo se permiten .xlsx o .xls');
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        } else {
             setSelectedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Por favor, selecciona un archivo Excel.');
            return;
        }
        setIsUploading(true);
        setError(null);
        try {
            const response = await productService.uploadMassProducts(selectedFile);
            alert(response.data.message || 'Carga masiva completada.');
            onUploadSuccess();
            handleClose();
        } catch (err) {
            const backendMsg = err.response?.data?.message;
            const errorMsg = backendMsg || 'Error durante la carga masiva. Revisa la consola.';
            setError(errorMsg);
            console.error("Mass Upload Error (Frontend):", err.response?.data || err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setIsUploading(false);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg m-4 transform transition-all animate-scale-in">
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">Carga Masiva</h2>
                    <button onClick={handleClose} className="p-1 text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100">
                        <FiX className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Selecciona un archivo Excel (.xlsx o .xls). Columnas: <strong className="font-medium text-gray-800">Nombre Producto, Precio Venta, stock, Marca ID, Modelo ID, Color ID, Talla ID</strong>. Los IDs deben existir en la base de datos.
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition">
                        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="hidden" ref={fileInputRef} id="excelUploadInput"/>
                        <label htmlFor="excelUploadInput" className="cursor-pointer flex flex-col items-center">
                            <FiFile className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                            {selectedFile ? (
                                <span className="text-sm font-medium text-indigo-600 block max-w-full truncate">{selectedFile.name}</span>
                            ) : (
                                <span className="text-sm text-gray-600">Haz clic para <span className="font-medium text-indigo-600">seleccionar archivo</span></span>
                            )}
                            <span className="mt-1 text-xs text-gray-500">(.xlsx o .xls)</span>
                        </label>
                    </div>
                    {error && (<p className="text-sm text-red-600 text-center">{error}</p>)}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                        <button type="button" onClick={handleClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition duration-150 disabled:opacity-50" disabled={isUploading}>Cancelar</button>
                        <button type="button" onClick={handleUpload} className={`px-5 py-2 text-white rounded-md transition duration-150 shadow-md flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${isUploading || !selectedFile ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`} disabled={!selectedFile || isUploading}>
                            {isUploading ? (<><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Subiendo...</>) : (<><FiUpload className="w-4 h-4 mr-1"/><span>Subir Archivo</span></>)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Página Principal de Productos (Admin) ---
/**
 * Componente principal de la página de Administración de Productos.
 * Maneja el estado de los productos, filtros, paginación y la interacción
 * entre los componentes (tabla, filtros, modales).
 */
const AdminProductsPage = () => {
    // Estados principales
    const [products, setProducts] = useState([]); // Almacena los productos de la página actual
    const [isLoading, setIsLoading] = useState(true); // Para mostrar skeletons o spinners
    const [error, setError] = useState(null); // Para mostrar mensajes de error

    // Estados de Modales
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isMassUploadModalOpen, setIsMassUploadModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // null = Agregar, Objeto = Editar

    // Estados de Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [limit] = useState(10); // Productos por página

    // Estados de Filtros
    const [searchTerm, setSearchTerm] = useState(''); // Valor del input de búsqueda
    const [filterMarca, setFilterMarca] = useState(''); // Valor del select de marca
    const [marcas, setMarcas] = useState([]); // Opciones para el select de marca

    /**
     * Función (memoizada con useCallback) para obtener los productos del backend.
     * Esta función se recrea solo si sus dependencias (limit, searchTerm, filterMarca) cambian.
     * Acepta `pageToFetch` como argumento para la paginación.
     */
    const fetchProducts = useCallback(async (pageToFetch) => {
        try {
            setIsLoading(true);
            setError(null);
            console.log(`FETCHING Page: ${pageToFetch}, Search: '${searchTerm}', Marca: '${filterMarca}'`);
            
            // Llama al servicio con todos los parámetros
            const res = await productService.getAdminProducts(pageToFetch, limit, searchTerm, filterMarca);
            
            // Actualiza los estados con la respuesta de la API
            setProducts(res.data.products);
            setTotalPages(res.data.totalPages);
            setTotalProducts(res.data.totalProducts);
            setCurrentPage(res.data.currentPage); // Asegura que el estado local coincida con la API
        } catch (err) {
            setError("Error al cargar productos. Intenta recargar la página.");
            console.error("Fetch Products Error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [limit, searchTerm, filterMarca]); 

    /**
     * Efecto de Carga Inicial (Mount).
     * Se ejecuta solo una vez cuando el componente se monta.
     * Llama a fetchProducts(1) para obtener la primera página de datos.
     * Carga las marcas para el dropdown de filtros.
     */
    useEffect(() => {
        fetchProducts(1);
        catalogService.getItems('marcas')
            .then(res => setMarcas(res.data))
            .catch(err => console.error("Error al cargar marcas para filtro", err));
    
    }, []); 

    /**
     * Efecto de Paginación.
     * Se ejecuta cada vez que 'currentPage' cambia *y no es la carga inicial*.
     * Llama a fetchProducts con la nueva página.
     */
    const isInitialMount = useRef(true); // Ref para evitar el doble fetch inicial
    useEffect(() => {
        // Evita correr en la carga inicial (ya lo hizo el useEffect de mount)
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        // Si la página cambia (ej: por handlePageChange), llama a fetchProducts
        fetchProducts(currentPage);
    }, [currentPage, fetchProducts]); // Depende de currentPage y de la función fetchProducts


    // --- Manejadores de Eventos ---

    /**
     * Manejador para el botón "Buscar" y "Enter" en el input.
     * Resetea a la página 1 y llama a fetchProducts.
     */
    const handleSearch = () => {
        setCurrentPage(1); // Resetea a la página 1
        fetchProducts(1);  // Llama a fetch con la página 1 y los filtros actuales
    };

    /**
     * Manejador para el botón "Limpiar" filtros.
     * Resetea los estados de filtro y la página, y llama a fetchProducts.
     */
    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterMarca('');
        setCurrentPage(1);
        fetchProducts(1); // Llama a fetch con página 1 y filtros vacíos
    };

    /**
     * Manejador para el componente Pagination.
     * Solo actualiza el estado de currentPage. El useEffect se encargará de
     * llamar a fetchProducts.
     */
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            setCurrentPage(page); // Actualiza el estado
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll opcional
        }
    };

    /**
     * Manejador para el botón "Exportar".
     * Llama al servicio de exportación con los filtros actuales.
     */
    const handleExport = async () => {
        alert("Generando reporte Excel...");
        try {
            const response = await productService.exportProducts(searchTerm, filterMarca);
            saveAs(new Blob([response.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), 'Reporte_Productos_Filtrados.xlsx');
        } catch (err) {
            alert("Error al exportar: " + (err.response?.data?.message || err.message));
        }
    };

    /**
     * Manejador para guardar (Crear/Editar) desde el modal.
     */
    const handleSaveProduct = async (formData, id) => {
        try {
            if (id) {
                await productService.updateProduct(id, formData);
                alert("Producto actualizado exitosamente.");
            } else {
                await productService.createProduct(formData);
                alert("Producto creado exitosamente.");
            }
            setIsProductModalOpen(false);
            // Recarga la página actual si edita, o la primera si crea
            fetchProducts(id ? currentPage : 1);
        } catch (err) {
            alert("Error al guardar: " + (err.response?.data?.message || err.message));
        }
    };

    /**
     * Manejador para el botón "Eliminar".
     */
    const handleDeleteProduct = async (id) => {
        if (window.confirm("¿Seguro que quieres eliminar este producto?")) {
            try {
                await productService.deleteProduct(id);
                alert("Producto eliminado.");
                // Decide a qué página ir después de eliminar
                let pageToGo = (products.length === 1 && currentPage > 1) ? currentPage - 1 : currentPage;
                fetchProducts(pageToGo); // Recarga la página
            } catch (err) {
                alert("Error al eliminar: " + (err.response?.data?.message || err.message));
            }
        }
    };
    
    /**
     * Manejador para el botón "Imprimir PDF".
     */
    const handlePrintPdf = async (productId, productName) => {
         try {
            const response = await productService.getProductPdf(productId);
            const filename = `Ficha-${productName.replace(/[^a-zA-Z0-9]/g, '_')}-${productId}.pdf`;
            saveAs(new Blob([response.data], { type: 'application/pdf' }), filename);
        } catch (err) {
            alert("Error al generar el PDF: " + (err.response?.data?.message || err.message));
        }
    };

    // Manejadores para abrir los modales
    const handleOpenAddModal = () => { setEditingProduct(null); setIsProductModalOpen(true); };
    const handleOpenEditModal = (product) => { setEditingProduct(product); setIsProductModalOpen(true); };
    const handleMassUploadSuccess = () => { setIsMassUploadModalOpen(false); fetchProducts(1); };


    // --- RENDERIZADO DE LA PÁGINA ---
    return (
        <div className="space-y-6 p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Gestión de Productos <span className="text-lg font-normal text-gray-500">({totalProducts})</span>
                </h1>
                {/* Botones de Acción Principales */}
                <div className="flex items-center space-x-2 flex-wrap justify-start md:justify-end">
                    <button onClick={handleExport} className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition duration-150">
                        <FiDownload className="w-4 h-4" /><span>Exportar</span>
                    </button>
                    <button onClick={() => setIsMassUploadModalOpen(true)} className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition duration-150">
                        <FiUpload className="w-4 h-4" /><span>Carga Masiva</span>
                    </button>
                    <button onClick={handleOpenAddModal} className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition duration-150">
                        <FiPlus className="w-4 h-4" /><span>Agregar</span>
                    </button>
                </div>
            </div>

            {/* Barra de Filtros */}
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-grow w-full md:w-auto">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre..." 
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                </div>
                <select 
                    className="block w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" 
                    value={filterMarca} 
                    onChange={(e) => setFilterMarca(e.target.value)}
                >
                    <option value="">-- Todas las marcas --</option>
                    {marcas.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                </select>
                <button 
                    onClick={handleSearch} 
                    className="w-full md:w-auto flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition duration-150"
                >
                    <FiSearch className="w-4 h-4" /><span>Buscar</span>
                </button>
                <button 
                    onClick={handleClearFilters} 
                    title="Limpiar filtros" 
                    className="w-full md:w-auto flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition duration-150 border border-gray-300"
                >
                    <FiRefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Tabla de Productos */}
            <div className="w-full overflow-x-auto bg-white rounded-lg shadow-md">
                {isLoading ? (
                    <div className="p-6 text-center text-gray-500 animate-pulse">Cargando productos...</div>
                ) : error ? (
                    <div className="p-6 text-center text-red-600 bg-red-50 rounded-b-lg">{error}</div>
                ) : (
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Imagen</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Marca</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Color</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products.length > 0 ? products.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <img 
                                            className="w-12 h-12 rounded-md object-cover border border-gray-200" 
                                            // CORRECCIÓN: Usa la URL de Cloudinary directamente
                                            src={product.imagen || "/"} 
                                            alt={product.NombreProducto} 
                                            onError={(e) => { e.target.onerror = null; e.target.src="/"; }} 
                                            loading="lazy"
                                        />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap max-w-xs">
                                        <span className="block text-sm font-medium text-gray-900 truncate" title={product.NombreProducto}>{product.NombreProducto}</span>
                                        <span className="block text-xs text-gray-500 truncate">{product.idModelo?.nombre || ''}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm text-gray-700">{product.idMarca?.nombre || 'N/A'}</span></td>
                                    <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm text-gray-700">{product.idColor?.nombre || 'N/A'}</span></td>
                                    <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm text-gray-900 font-medium">S/ {product.PrecioVenta?.toFixed(2) || '0.00'}</span></td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {product.stock > 0 ? (
                                            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock < 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                {product.stock}
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Agotado</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-1">
                                        <button onClick={() => handlePrintPdf(product._id, product.NombreProducto)} title="Imprimir Ficha PDF" className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <FiPrinter className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleOpenEditModal(product)} title="Editar" className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-full transition duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <FiEdit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteProduct(product._id)} title="Eliminar" className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-500">
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" className="text-center py-10 text-gray-500">No se encontraron productos.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Paginación */}
            {!isLoading && totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}

            {/* Modales */}
            <ProductModal 
                isOpen={isProductModalOpen} 
                onClose={() => setIsProductModalOpen(false)} 
                onSave={handleSaveProduct} 
                editingProduct={editingProduct} 
            />
            <MassUploadModal 
                isOpen={isMassUploadModalOpen} 
                onClose={() => setIsMassUploadModalOpen(false)} 
                onUploadSuccess={handleMassUploadSuccess} 
            />
        </div>
    );
};

export default AdminProductsPage;