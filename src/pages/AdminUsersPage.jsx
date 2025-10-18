/**
 * @fileoverview Página del panel de administración para gestionar usuarios administradores.
 *
 * Este archivo contiene dos componentes:
 * 1. UserModal: Un modal reutilizable para agregar un nuevo administrador o editar uno existente.
 * 2. AdminUsersPage: La página principal que muestra la lista de administradores,
 * permite abrir el modal y maneja la lógica de obtener (GET),
 * guardar (POST/PUT) y eliminar (DELETE) usuarios.
 */

import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
// Importa todas las funciones del servicio de usuarios (userService)
import { getAdminUsers, createAdminUser, updateUser, deleteUser } from '../services/userService';

// --- MODAL REUTILIZABLE para Agregar y Editar Usuario ---
/**
 * Componente modal para crear o editar un usuario administrador.
 * @param {object} props
 * @param {boolean} props.isOpen 
 * @param {function} props.onClose 
 * @param {function} props.onSave 
 * @param {object | null} props.editingUser 
 */
const UserModal = ({ isOpen, onClose, onSave, editingUser }) => {
    // --- Estados del Formulario ---
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); 

    useEffect(() => {
        if (isOpen) {
            if (editingUser) {
                // Modo Edición: Llena el formulario con los datos del usuario.
                setNombre(editingUser.nombre);
                setEmail(editingUser.email);
                setPassword(''); // La contraseña siempre empieza vacía por seguridad.
            } else {
                // Modo Agregar: Limpia el formulario.
                setNombre('');
                setEmail('');
                setPassword('');
            }
            setError(null); // Limpia cualquier error anterior.
        }
    }, [isOpen, editingUser]);

    /**
     * Manejador para el envío (submit) del formulario.
     * @param {React.FormEvent} e 
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita la recarga de la página.
        setError(null); // Limpia errores.

        // Prepara el objeto userData con los datos del formulario.
        const userData = { nombre, email };

        // --- Lógica de Contraseña ---
        if (password) {
            // Si se escribió una contraseña, valida su longitud.
            // El backend debe tener una validación más robusta.
            if (password.length < 6) {
                setError('La contraseña debe tener al menos 6 caracteres.');
                return; 
            }
            userData.password = password; // Añade la contraseña al objeto.
        } else if (!editingUser) {
            // Si es un usuario NUEVO (!editingUser) y la contraseña está vacía, es un error.
            setError('La contraseña es obligatoria para nuevos usuarios.');
            return; 
        }
        // Si se está editando (editingUser existe) y la contraseña está vacía,
        // simplemente no se incluye `userData.password`, y el backend no la actualizará.

        try {
            // Llama a la función 'onSave' pasada desde AdminUsersPage.
            // Pasa los datos del usuario y el ID (si existe, en modo edición).
            await onSave(userData, editingUser?._id);
            onClose(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error al guardar.');
        }
    };

    // Si el modal no está abierto, no renderiza nada.
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            {/* Tarjeta del Modal */}
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg m-4 transform transition-all animate-scale-in">
                {/* Cabecera del Modal */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                        {/* Título dinámico */}
                        {editingUser ? 'Editar Administrador' : 'Agregar Nuevo Admin'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition">
                        <FiX className="w-5 h-5 md:w-6 md:h-6"/>
                    </button>
                </div>

                {/* Cuerpo del Modal - Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campo Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    {/* Campo Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    {/* Campo Contraseña */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {/* Etiqueta dinámica para la contraseña */}
                            {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'}
                        </label>
                        <input
                            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            placeholder={editingUser ? 'Dejar en blanco para no cambiar' : 'Mínimo 6 caracteres'}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required={!editingUser} // Requerido solo si es un usuario nuevo
                            minLength={password ? 6 : undefined} // Valida longitud solo si se escribió algo
                        />
                        {!editingUser && <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres.</p>}
                    </div>

                    {/* Muestra errores de la API */}
                    {error && (<p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{error}</p>)}

                    {/* Pie del Modal - Botones de Acción */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition duration-150">
                            Cancelar
                        </button>
                        <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition duration-150 shadow-md">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Página Principal de Gestión de Usuarios ---
/**
 * Componente de página que muestra la lista de usuarios administradores
 * y proporciona los controles para agregarlos, editarlos y eliminarlos.
 */
const AdminUsersPage = () => {
    // --- Estados de la Página ---
    const [users, setUsers] = useState([]); // Almacena la lista de usuarios admin
    const [isLoading, setIsLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de error de carga

    // Estados para controlar el modal
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // null = Modo Agregar, Objeto = Modo Editar

    /**
     * Función para obtener los usuarios administradores desde la API
     * y actualizar el estado.
     */
    const fetchAdminUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAdminUsers();
            setUsers(response.data);
        } catch (err) {
            setError(err.message || 'Error al cargar los usuarios. Asegúrate de estar autenticado.');
            console.error("Fetch Admin Users Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Efecto para cargar los usuarios cuando el componente se monta por primera vez.
    useEffect(() => {
        fetchAdminUsers();
    }, []); 

    // --- Lógica y Manejadores de CRUD ---

    /**
     * Abre el modal en modo "Agregar" (limpiando `editingUser`).
     */
    const handleOpenAddModal = () => {
        setEditingUser(null);
        setModalOpen(true);
    };

    /**
     * Abre el modal en modo "Editar" (pasando el `user` seleccionado).
     * @param {object} user - El objeto de usuario a editar.
     */
    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    /**
     * Función que se pasa al modal. Decide si llamar a `updateUser` o `createAdminUser`.
     * @param {object} userData 
     * @param {string | null} id 
     */
    const handleSaveUser = async (userData, id) => {
        try {
            if (id) {
                // Lógica de Editar (PUT)
                await updateUser(id, userData);
                alert('Usuario actualizado correctamente.');
            } else {
                // Lógica de Agregar (POST)
                await createAdminUser(userData);
                alert('Usuario administrador creado correctamente.');
            }
            fetchAdminUsers(); // Recarga la lista de usuarios
        } catch (err) {
            console.error("Save User Error:", err.response?.data || err);
            throw err;
        }
    };

    /**
     * Manejador para el botón de eliminar. Pide confirmación antes de actuar.
     * @param {string} id - El ID del usuario a eliminar.
     * @param {string} name - El nombre del usuario (para el mensaje de confirmación).
     */
    const handleDeleteUser = async (id, name) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario administrador "${name}"? Esta acción no se puede deshacer.`)) {
            try {
                await deleteUser(id);
                alert('Usuario eliminado correctamente.');
                fetchAdminUsers(); 
            } catch (err) {
                alert("Error al eliminar el usuario: " + (err.response?.data?.message || err.message));
                console.error("Delete User Error:", err.response?.data || err);
            }
        }
    };

    // --- Renderizado de la Página ---
    return (
        <div className="space-y-6 p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* Cabecera de la Página */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestión de Usuarios Admin</h1>
                <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition duration-150"
                >
                    <FiPlus className="w-4 h-4" />
                    <span>Agregar Admin</span>
                </button>
            </div>

            {/* Tabla de Usuarios */}
            <div className="w-full overflow-x-auto bg-white rounded-lg shadow-md">
                {/* Estados de Carga y Error */}
                {isLoading && (<div className="p-6 text-center text-gray-500 animate-pulse">Cargando usuarios...</div>)}
                {error && (<div className="p-6 text-center text-red-600 bg-red-50 rounded-b-lg">{error}</div>)}
                
                {/* Contenido de la Tabla (solo si no está cargando y no hay error) */}
                {!isLoading && !error && (
                    <table className="w-full min-w-[600px]"> {/* Ancho mínimo para evitar compresión */}
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rol</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.length > 0 ? users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">{user.nombre}</span>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-700">{user.email}</span>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {/* Acceso seguro al nombre del rol populado */}
                                            {user.idRol?.nombre ? user.idRol.nombre.charAt(0).toUpperCase() + user.idRol.nombre.slice(1) : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                                        {/* Botón Editar: Llama a handleOpenEditModal con el usuario de esta fila */}
                                        <button onClick={() => handleOpenEditModal(user)} title="Editar" className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-full transition duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <FiEdit className="w-4 h-4" />
                                        </button>
                                        {/* Botón Eliminar: Llama a handleDeleteUser con el ID y nombre del usuario */}
                                        <button onClick={() => handleDeleteUser(user._id, user.nombre)} title="Eliminar" className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-500">
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                // Mensaje si no hay usuarios
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-gray-500">
                                        No se encontraron usuarios administradores.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            <UserModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveUser}
                editingUser={editingUser}
            />
        </div>
    );
};

export default AdminUsersPage;