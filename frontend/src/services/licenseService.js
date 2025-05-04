
import api from './api';

// Obtener todas las licencias
export const getLicenses = async (filters = {}) => {
  try {
    const response = await api.post('/api/licenses', {
      user_id: filters.user_id || null,
      status: filters.status || null,
      employee_name: filters.employeeName || '',
      page: filters.page || 1,
      page_size: filters.pageSize || 10,
      show_all_users: filters.show_all_users || false
    });
    
    return {
      success: true,
      licenses: response.data.licenses || [],
      pagination: {
        totalPages: response.data.total_pages,
        currentPage: response.data.current_page,
        totalLicenses: response.data.total_licenses
      }
    };
  } catch (error) {
    console.error('Error in getLicenses:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al obtener las licencias',
      licenses: []
    };
  }
};

// Obtener detalles de una licencia específica
export const getLicenseDetail = async (licenseId) => {
  try {
    const response = await api.get(`/api/licenses/${licenseId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching license detail:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al obtener el detalle de la licencia'
    };
  }
};

// Eliminar una licencia
export const deleteLicense = async (licenseId) => {
  try {
  await api.delete(`/api/licenses/delete/${licenseId}`);
  } catch (error) {
  console.error('Error deleting user:', error);
  throw error;
  }
};