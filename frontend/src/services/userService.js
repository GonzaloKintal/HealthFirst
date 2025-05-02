
import api from './api';

// Obtener todos los usuarios
export const getUsers = async (page = 1, search = '', role) => {
    try {
        const body = {
            page,
            page_size: 5,
        };

        console.log('Request body:', body);

        if (search) body.search = search;
        if (role && role !== 'all') body.role = role;

        const response = await api.post('/api/users', body);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const addUser = async (user) => {
    try {
        console.log('User data:', user);
        await api.post(`/api/users/register`, user);
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
    await api.delete(`/api/users/delete/${userId}`);
    } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
    }
};

export const editUser = async (user) => {
    try {
        await api.put(`/api/users/update/${user.id}`, user);
    } catch (error) {
        console.error('Error editing user:', error);
        throw error;
    }
};




// // Obtener todos los repuestos
// export const getRepuestos = () => {
//     return axios.get(API_URL);
// };

// // Crear un nuevo repuesto
// export const createRepuesto = (repuesto) => {
//     return axios.post(API_URL, repuesto);
// };

// // Eliminar un repuesto por su código
// export const deleteRepuesto = (cod) => {
//     return axios.delete(`${API_URL}/${cod}`);
// };

// // Editar un repuesto
// export const editRepuesto = (repuesto) => {
//   return axios.put(`${API_URL}/${repuesto.cod}`, repuesto);
// };
