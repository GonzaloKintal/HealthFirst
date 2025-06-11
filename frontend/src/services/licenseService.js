
import api from './api';

// Obtener todas las licencias
export const getLicenses = async (filters = {}) => {
  try {
    const response = await api.post('/licenses/', {
      user_id: filters.user_id || null,
      status: filters.status || null,
      employee_name: filters.employee_name || '',
      type: filters.type || null,
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
      error: error.response?.data?.error || 'Error al obtener las licencias. Por favor intenta nuevamente.',
      licenses: []
    };
  }
};

// Obtener detalles de una licencia específica
export const getLicenseDetail = async (licenseId) => {
  try {
    const response = await api.get(`/licenses/${licenseId}`);
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
    const response = await api.post('/licenses/request', licenseData, {
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
  await api.delete(`/licenses/delete/${licenseId}`);
  } catch (error) {
  console.error('Error deleting user:', error);
  throw error;
  }
};

// Obtener tipos de licencias
export const getLicenseTypes = async () => {
  try {
    const response = await api.get('/licenses/get_licenses_types');
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
    const response = await api.put(`/licenses/update/${id}`, licenseData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data
    };
    
  } catch (error) {
    console.error('Error al actualizar licencia:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Error al actualizar la licencia'
    };
  }
};

// Evaluar una licencia (aprobar/rechazar)
export const evaluateLicense = async (licenseId, status, comment = '') => {
  try {
    const response = await api.put(`/licenses/${licenseId}/evaluation`, {
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

// Agregar un certificado a una licencia
export const addCertificateToLicense = async (licenseId, base64File) => {
  try {
    const response = await api.put(`/licenses/add_certificate/${licenseId}`, base64File, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error al agregar certificado a la licencia', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    
    return {
      success: false,
      error: error.response?.data?.error || 'Error al agregar el certificado a la licencia'
    };
  }
};

// Verificar coherencia de certificado
export const analyzeCertificate = async (base64File) => {
  try {
    const response = await api.post('/licenses/certificate/coherence', {
      file_base64: base64File
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error al analizar el certificado', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    
    return {
      success: false,
      error: error.response?.data?.error || 'Error al analizar el certificado'
    };
  }
};

// Exportar licencias a CSV
export const exportLicensesToCSV = async (filters = {}) => {
  try {
    const response = await api.post('/licenses/export', 
      JSON.stringify({
        user_id: filters.user_id || null,
        show_all_users: filters.show_all_users || false,
        status: filters.status || null,
        employee_name: filters.employee_name || ''
      }), 
      {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }
    );

    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'licencias.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      success: true
    };
  } catch (error) {
    console.error('Error exporting licenses to CSV:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    return {
      success: false,
      error: error.response?.data?.error || 'Error al exportar las licencias a CSV'
    };
  }
};

// Obtener anomalías de supervisores
export const getSupervisorAnomalies = async (filters = {}) => {
  try {
    const response = await api.get('/licenses/anomalies/supervisor', {
      params: {
        start_date: filters.start_date || null,
        end_date: filters.end_date || null,
        user_id: filters.user_id || null,
        is_anomaly: filters.is_anomaly || null,
        limit: filters.limit || null,
        offset: filters.offset || null
      }
    });
    console.log('Response from getSupervisorAnomalies:', response.data);
    
    return {
      success: true,
      data: response.data.results || [],
      count: response.data.count || 0,
      next: response.data.next || null,
      previous: response.data.previous || null
    };
  } catch (error) {
    console.error('Error fetching supervisor anomalies:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al obtener las anomalías de supervisores',
      data: [],
      count: 0,
      next: null,
      previous: null
    };
  }
};

 // Obtener anomalías de empleados
export const getEmployeeAnomalies = async (filters = {}) => {
  try {
    const response = await api.get('/licenses/anomalies/employee', {
      params: {
        start_date: filters.start_date || null,
        end_date: filters.end_date || null,
        employee_id: filters.employee_id || null,
        is_anomaly: filters.is_anomaly || null,
        limit: filters.limit || null,
        offset: filters.offset || null
      }
    });
    console.log('Response from getEmployeeAnomalies:', response.data);

    return {
      success: true,
      data: response.data.results || [],
      count: response.data.count || 0,
      next: response.data.next || null,
      previous: response.data.previous || null
    };
  } catch (error) {
    console.error('Error fetching employee anomalies:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al obtener las anomalías de empleados',
      data: [],
      count: 0,
      next: null,
      previous: null
    };
  }
};