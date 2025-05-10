
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

// Solicitar una nueva licencia
export const requestLicense = async (licenseData) => {
  try {
    const response = await api.post('api/licenses/request', licenseData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error detallado:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    throw error;
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

// Obtener tipos de licencias
export const getLicenseTypes = async () => {
  try {
    const response = await api.get('/api/get_licenses_types');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching license types:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al obtener los tipos de licencia'
    };
  }
};

// Editar una licencia existente
export const updateLicense = async (id, licenseData) => {
  try {
    const response = await api.put(`api/licenses/update/${id}`, licenseData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar licencia:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    throw error;
  }
};

// Evaluar una licencia (aprobar/rechazar)
export const evaluateLicense = async (licenseId, status, comment = '') => {
  try {
    const response = await api.put(`/api/licenses/${licenseId}/evaluation`, {
      license_status: status,
      evaluation_comment: comment
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error evaluating license:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al evaluar la licencia'
    };
  }
};