import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiUser, FiSearch, FiFilter } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Confirmation from '../../components/common/Confirmation';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'admin', 'supervisor', 'analyst', 'employee'
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Simulación de datos
  useEffect(() => {
    const mockUsers = [
      { 
        id: 1, 
        firstName: 'Admin', 
        lastName: 'User', 
        dni: '12345678',
        email: 'admin@example.com', 
        department: 'Administración',
        position: 'Administrador General',
        role: 'admin' 
      },
      { 
        id: 2, 
        firstName: 'Supervisor', 
        lastName: 'One', 
        dni: '23456789',
        email: 'supervisor@example.com',
        department: 'Operaciones',
        position: 'Supervisor de Equipo',
        role: 'supervisor' 
      },
      { 
        id: 3, 
        firstName: 'Analyst', 
        lastName: 'One', 
        dni: '34567890',
        email: 'analyst@example.com',
        department: 'Tecnología',
        position: 'Analista de Datos',
        role: 'analyst' 
      },
      { 
        id: 4, 
        firstName: 'Employee', 
        lastName: 'One', 
        dni: '45678901',
        email: 'employee@example.com',
        department: 'Ventas',
        position: 'Representante Comercial',
        role: 'employee' 
      }
    ];
    
    setUsers(mockUsers);
  }, []);

  const handleDelete = (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirmation(true);
  };
  
  const confirmDelete = () => {
    setUsers(users.filter(user => user.id !== userToDelete));
    setShowDeleteConfirmation(false);
    setUserToDelete(null);
  };

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

  // Filtrar usuarios basado en búsqueda y filtro
  const filteredUsers = users.filter(user => {
    const matchesSearch = (
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.dni.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilter = filter === 'all' || user.role === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Link
          to="/add-user"
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center cursor-pointer hover:bg-blue-700 transition duration-200"
        >
          <FiPlus className="mr-2" />
          Nuevo Usuario
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        {/* Barra de búsqueda y filtro */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar usuarios por nombre, DNI, email, departamento o cargo..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="admin">Administrador</option>
              <option value="supervisor">Supervisor</option>
              <option value="analyst">Analista</option>
              <option value="employee">Empleado</option>
            </select>
          </div>
        </div>

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
                  Departamento/Cargo
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
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
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
                            {user.firstName} {user.lastName}
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
                      <div className="text-sm text-gray-500">{user.position}</div>
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
                    No se encontraron usuarios que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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