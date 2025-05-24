import api from './api';


export const createDepartment = async (departmentData) => {
    try {
        const response = await api.post('/users/department/create', departmentData);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Error al crear el departamento';
        throw new Error(errorMessage);
    }
};

export const updateDepartment = async (id, departmentData) => {
    try {
        const response = await api.put(`/users/department/update/${id}`, departmentData);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Error al actualizar el departamento';
        throw new Error(errorMessage);
    }
};

export const deleteDepartment = async (id) => {
    try {
        const response = await api.delete(`/users/department/delete/${id}`);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Error al eliminar el departamento';
        throw new Error(errorMessage);
    }
};

export const getDepartments = async () => {
    try {
        const response = await api.get('/users/get_departments');
        return response.data.departments;
    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Error al obtener los departamentos';
        throw new Error(errorMessage);
    }
};