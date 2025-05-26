import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiX, FiSave } from 'react-icons/fi';
import Confirmation from '../../components/utils/Confirmation';
import Notification from '../../components/utils/Notification';
import { 
  createDepartment, 
  updateDepartment, 
  deleteDepartment, 
  getDepartments 
} from '../../services/departmentService';

const DepartmentsSection = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true); // Nuevo estado para el loader
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      showNotification('error', 'Error al cargar los departamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingDepartment) {
        await updateDepartment(editingDepartment.department_id, formData);
        showNotification('success', 'Departamento actualizado correctamente');
      } else {
        await createDepartment(formData);
        showNotification('success', 'Departamento creado correctamente');
      }
      setShowForm(false);
      setEditingDepartment(null);
      setFormData({ name: '', description: '' });
      fetchDepartments();
    } catch (error) {
      showNotification('error', error.message);
      
      if (!editingDepartment) {
        setShowForm(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description
    });
    setShowForm(true);
  };

  const handleDelete = (departmentId) => {
    setDepartmentToDelete(departmentId);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteDepartment(departmentToDelete);
      showNotification('success', 'Departamento eliminado correctamente');
      fetchDepartments();
    } catch (error) {
      showNotification('error', error.message || 'Error al eliminar el departamento');
    } finally {
      setLoading(false);
      setShowDeleteConfirmation(false);
      setDepartmentToDelete(null);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Gestión de Departamentos</h2>
        <button
          onClick={() => {
            setEditingDepartment(null);
            setFormData({ name: '', description: '' });
            setShowForm(!showForm);
          }}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center hover:bg-primary-hover transition"
        >
          {showForm ? <FiX className="mr-2" /> : <FiPlus className="mr-2" />}
          {showForm ? 'Cancelar' : 'Nuevo Departamento'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border border-border rounded-lg">
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border rounded-md focus:ring-primary focus:border-primary text-foreground bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border rounded-md focus:ring-primary focus:border-primary text-foreground bg-background"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
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
                  Descripción
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {departments.length > 0 ? (
                departments.map((department) => (
                  <tr key={department.department_id} className="hover:bg-card text-center">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        {department.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">
                        {department.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => handleEdit(department)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        >
                          <FiEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(department.department_id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-foreground">
                    No hay departamentos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Confirmation
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Eliminar Departamento"
        message="¿Estás seguro que deseas eliminar este departamento? Esta acción no se puede deshacer."
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

export default DepartmentsSection;