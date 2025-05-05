
import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiUser, FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Confirmation from '../../components/utils/Confirmation';
import { deleteUser, getUsersByFilter } from '../../services/userService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalUsers: 0
  });
  const [error, setError] = useState(null);

  // Obtener usuarios del backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError(null);
        const filterToSend = filter !== 'all' ? `${filter}` : '';
        
        const response = await getUsersByFilter(
          pagination.currentPage, 
          filterToSend,
          5
        );
        
        const transformedUsers = response.users.map(user => ({
          id: user.id,
          name: user.first_name + ' ' + user.last_name,
          dni: user.dni,
          email: user.email,
          department: user.department || '',
          role: user.role
        }));
        
        setUsers(transformedUsers);
        setPagination({
          totalPages: response.total_pages || 1,
          currentPage: response.current_page,
          totalUsers: response.total_users || 0
        });
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setError('No se pudieron cargar los usuarios. Por favor intenta nuevamente.');
        setUsers([]);
        setPagination({
          totalPages: 1,
          currentPage: 1,
          totalUsers: 0
        });
      }
    };
  
    fetchUsers();
  }, [pagination.currentPage, filter]); // Solo depende de filter, no de searchTerm
  
  // Función para búsqueda manual (con Enter o botón)
  const handleSearch = async () => {
    try {
      setError(null);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      
      const response = await getUsersByFilter(
        1, // Siempre va a la página 1 en nueva búsqueda
        searchTerm, // Solo envía el texto de búsqueda
        5
      );
      
      const transformedUsers = response.users.map(user => ({
        id: user.id,
        name: user.first_name + ' ' + user.last_name,
        dni: user.dni,
        email: user.email,
        department: user.department || '',
        role: user.role
      }));
      
      setUsers(transformedUsers);
      setPagination({
        totalPages: response.total_pages || 1,
        currentPage: 1,
        totalUsers: response.total_users || 0
      });
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Error al realizar la búsqueda');
    }
  };
  
  // Manejar la tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
    }
  };

  // Manejar eliminación de usuario
  const handleDelete = (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirmation(true);
  };
  
  const confirmDelete = async () => {
    try {
      // Guarda el estado actual por si necesitamos revertir
      const previousUsers = [...users];
      const previousPagination = {...pagination};
      
      // Actualización optimista
      setUsers(previousUsers.filter(user => user.id !== userToDelete));
      setPagination(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1
      }));
      
      // Llama al servicio para eliminar el usuario en el backend
      await deleteUser(userToDelete);
      
      // Manejo de paginación como antes
      const usersLeftInPage = previousUsers.filter(user => user.id !== userToDelete).length;
      if (usersLeftInPage === 0 && previousPagination.currentPage > 1) {
        setPagination(prev => ({
          ...prev,
          currentPage: prev.currentPage - 1
        }));
      }
      
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setUsers(previousUsers);
      setPagination(previousPagination);
      setError('No se pudo eliminar el usuario. Por favor intenta nuevamente.');
    } finally {
      setShowDeleteConfirmation(false);
      setUserToDelete(null);
    }
  };

  // Colores según el rol
  const getRoleColors = (role) => {
    const colors = {
      admin: { bg: 'bg-red-100', text: 'text-red-800' },
      supervisor: { bg: 'bg-blue-100', text: 'text-blue-800' },
      analyst: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      employee: { bg: 'bg-green-100', text: 'text-green-800' },
      default: { bg: 'bg-gray-100', text: 'text-gray-800' }
    };
    return colors[role] || colors.default;
  };

  return (
    <div className="p-6">
      {/* Encabezado y contador */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Mostrando {users.length} de {pagination.totalUsers} usuarios
          </span>
          <Link
            to="/add-user"
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center cursor-pointer hover:bg-blue-700 transition duration-200"
          >
            <FiPlus className="mr-2" />
            Nuevo Usuario
          </Link>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Barra de búsqueda y filtro */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow flex">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar usuarios por nombre, DNI, email o departamento..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-blue-600 text-white hover:bg-blue-700 transition duration-200 cursor-pointer"
            >
              Buscar
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
            >
              <option value="all">Todos</option>
              <option value="admin">Administrador</option>
              <option value="supervisor">Supervisor</option>
              <option value="analyst">Analista</option>
              <option value="employee">Empleado</option>
            </select>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DNI
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 text-center">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            getRoleColors(user.role).bg
                          } ${getRoleColors(user.role).text}`}
                        >
                          <FiUser />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.dni}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${getRoleColors(user.role).bg} ${getRoleColors(user.role).text}`}>
                        {user.role === 'admin' && 'Administrador'}
                        {user.role === 'supervisor' && 'Supervisor'}
                        {user.role === 'analyst' && 'Analista'}
                        {user.role === 'employee' && 'Empleado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex space-x-4 justify-center">
                        <Link
                          to={`/edit-user/${user.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit className="text-lg" />
                        </Link>
                        <button 
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                          onClick={() => handleDelete(user.id)}
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || filter !== 'all' 
                      ? 'No se encontraron usuarios que coincidan con los filtros'
                      : 'No hay usuarios registrados'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              <FiChevronLeft className="mr-1" /> Anterior
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-2 border-t border-b border-gray-300 text-sm font-medium ${
                  pagination.currentPage === i + 1
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              Siguiente <FiChevronRight className="ml-1" />
            </button>
          </nav>
        </div>
      )}

      {/* Confirmación de Eliminación */}
      <Confirmation
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        message="¿Estás seguro que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default UsersPage;