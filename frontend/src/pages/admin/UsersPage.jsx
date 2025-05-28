
import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiUser, FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Confirmation from '../../components/utils/Confirmation';
import { deleteUser, getUsersByFilter } from '../../services/userService';
import Notification from '../../components/utils/Notification';
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  const authData = localStorage.getItem('auth_data');
  const user = authData ? JSON.parse(authData).user : null;
  const currentUserId = user?.id;

  // Obtener usuarios del backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, [pagination.currentPage, filter]);

  // Función para búsqueda manual (con Enter o botón)
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      
      const response = await getUsersByFilter(
        1,
        searchTerm,
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
    } finally {
      setLoading(false);
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
  const previousUsers = [...users];
  const previousPagination = {...pagination};
  
  try {
    if (userToDelete === currentUserId) {
      showNotification('error', 'No puedes eliminarte a ti mismo');
      setShowDeleteConfirmation(false);
      setUserToDelete(null);
      return;
    }

    setUsers(previousUsers.filter(user => user.id !== userToDelete));
    setPagination(prev => ({
      ...prev,
      totalUsers: prev.totalUsers - 1
    }));
    
    await deleteUser(userToDelete);
    
    const usersLeftInPage = previousUsers.filter(user => user.id !== userToDelete).length;
    if (usersLeftInPage === 0 && previousPagination.currentPage > 1) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage - 1
      }));
    }
    
    showNotification('success', 'Usuario eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    setUsers(previousUsers);
    setPagination(previousPagination);
    showNotification('error', error.message || 'No se pudo eliminar el usuario');
  } finally {
    setShowDeleteConfirmation(false);
    setUserToDelete(null);
  }
};

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Colores según el rol
  const getRoleColors = (role) => {
    const lightColors = {
      admin: { 
        bg: 'bg-red-100 dark:bg-red-800', 
        text: 'text-red-700 dark:text-red-200' 
      },
      supervisor: { 
        bg: 'bg-blue-100 dark:bg-blue-800', 
        text: 'text-blue-700 dark:text-blue-200' 
      },
      analyst: { 
        bg: 'bg-yellow-100 dark:bg-yellow-700', 
        text: 'text-yellow-600 dark:text-yellow-200' 
      },
      employee: { 
        bg: 'bg-green-100 dark:bg-green-900', 
        text: 'text-green-800 dark:text-green-200' 
      },
      default: { 
        bg: 'bg-gray-100 dark:bg-gray-800', 
        text: 'text-foreground' 
      }
    };
  
    const darkColors = {
      admin: { 
        bg: 'dark:bg-[var(--rejected-bg-dark)]', 
        text: 'dark:text-[var(--rejected-text-dark)]' 
      },
      supervisor: { 
        bg: 'dark:bg-[var(--special-bg-dark)]', 
        text: 'dark:text-blue-200' 
      },
    };
  
    const colors = {
      admin: {
        bg: `${lightColors.admin.bg} ${darkColors.admin.bg}`,
        text: `${lightColors.admin.text} ${darkColors.admin.text}`
      },
      supervisor: {
        bg: `${lightColors.supervisor.bg} ${darkColors.supervisor.bg}`,
        text: `${lightColors.supervisor.text} ${darkColors.supervisor.text}`
      },
      analyst: {
        bg: lightColors.analyst.bg,
        text: lightColors.analyst.text
      },
      employee: {
        bg: lightColors.employee.bg,
        text: lightColors.employee.text
      },
      default: {
        bg: lightColors.default.bg,
        text: lightColors.default.text
      }
    };
  
    return colors[role] || colors.default;
  };

  return (
    <div className="p-6">
      {/* Encabezado y contador */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-foreground font-bold flex items-center">
          <FiUsers className="mr-2" />
          Gestión de Usuarios
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-foreground">
            Mostrando {users.length} de {pagination.totalUsers} usuarios
          </span>
          <Link
            to="/add-user"
            className="bg-primary text-white px-4 py-2 rounded-md flex items-center cursor-pointer hover:bg-primary-hover transition duration-200"
          >
            <FiPlus className="mr-2" />
            Nuevo Usuario
          </Link>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      {/* Barra de búsqueda y filtro */}
      <div className="bg-background rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow flex">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar usuarios por nombre, DNI, email o departamento..."
              className="block w-full pl-10 pr-3 py-2 border border-border rounded-l-md focus:outline-none text-foreground bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 border border-l-0 border-border rounded-r-md bg-primary text-white hover:bg-primary-hover transition duration-200 cursor-pointer"
              disabled={loading}
            >
              Buscar
            </button>
          </div>
          
          <div className="flex items-center space-x-2 text-foreground">
            <FiFilter className="text-gray-400" />
            <select 
              className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-border focus:border-primary-border text-foreground bg-background"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              disabled={loading}
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
          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-card">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-card text-center">
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
                            <div className="text-sm font-medium text-foreground">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {user.dni}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">{user.department}</div>
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
                            className="text-primary-text hover:text-primary-hover p-1 rounded hover:bg-blue-50 cursor-pointer"
                          >
                            <FiEdit className="text-lg" />
                          </Link>
                          <button 
                            className="text-red-500 hover:text-red-900 p-1 rounded hover:bg-red-50 cursor-pointer"
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
                    <td colSpan="6" className="px-6 py-4 text-center text-foreground">
                      {searchTerm || filter !== 'all' 
                        ? 'No se encontraron usuarios que coincidan con los filtros'
                        : 'No hay usuarios registrados'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Paginación - solo visible cuando no está cargando */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 rounded-l-md border border-border bg-background text-sm font-medium text-foreground hover:bg-card disabled:opacity-50 flex items-center"
            >
              <FiChevronLeft className="mr-1" /> Anterior
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-2 border-t border-b border-border text-sm font-medium transition-colors duration-200 ${
                  pagination.currentPage === i + 1
                    ? 'bg-special-light dark:bg-special-dark text-primary-text hover:bg-primary-hover/20 dark:hover:bg-primary-hover/30'
                    : 'bg-background text-foreground hover:bg-card'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 rounded-r-md border border-border bg-background text-sm font-medium text-foreground hover:bg-card disabled:opacity-50 flex items-center"
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

      {notification.show && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
};

export default UsersPage;