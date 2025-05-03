
import api from './api';

// Obtener todas las licencias
export const getLicenses = async (filters = {}) => {
    try {
      const response = await api.post('/api/licenses', {
        status: filters.status || null,
        employee_name: filters.employeeName || '',
        page: filters.page || 1,
        page_size: filters.pageSize || 10
      });
      
      return {
        success: true,
        licenses: response.data.licenses,
        pagination: {
          totalPages: response.data.total_pages,
          currentPage: response.data.current_page,
          totalLicenses: response.data.total_licenses
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener las licencias'
      };
    }
};