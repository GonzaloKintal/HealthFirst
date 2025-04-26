import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulación de datos (reemplazar con llamada API real)
  useEffect(() => {
    const mockUsers = [
      { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      { id: 2, name: 'Supervisor One', email: 'supervisor@example.com', role: 'supervisor' },
      { id: 3, name: 'Analyst One', email: 'analyst@example.com', role: 'analyst' },
      { id: 4, name: 'Employee One', email: 'employee@example.com', role: 'employee' }
    ];
    
    setUsers(mockUsers);
  }, []);

  const handleDelete = (userId) => {
    // Lógica para eliminar usuario
    setUsers(users.filter(user => user.id !== userId));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center cursor-pointer hover:bg-blue-700 transition duration-200">
            <FiPlus className="mr-2" /> Nuevo Usuario
        </button> */}
        <Link
          to="/add-user"
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center cursor-pointer hover:bg-blue-700 transition duration-200"
        >
          <FiPlus className="mr-2" />
          Nuevo Usuario
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-center">
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-center">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-4 justify-center">
                    <button
                        className="text-blue-600 hover:text-blue-900 text-xl cursor-pointer"
                    >
                      <FiEdit />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 text-xl cursor-pointer"
                      onClick={() => handleDelete(user.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;