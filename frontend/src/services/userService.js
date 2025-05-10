
import api from './api';

// Obtener todos los usuarios
export const getUsers = async (page = 1, search = '', role) => {
    try {
        const body = {
            page,
            page_size: 5,
        };

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

export const editUser = async (id, data) => {
    try {
        await api.put(`/api/users/update/${id}`, data);
    } catch (error) {
        console.error('Error editing user:', error);
        throw error;
    }
};

export const getUser = async (id) => {
    try {
        const response = await api.get(`/api/get_user/${id}`);
        return response.data.user;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};
// export const getUser = async (id) => {
//     try {
//         // Obtener el token del localStorage
//         const authData = JSON.parse(localStorage.getItem('auth_data'));
//         const token = authData.token;

//         // Configurar los headers con el token
//         const config = {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         };

//         const response = await api.get(`/api/get_user/${id}`, config);
//         return response.data.user;
//     } catch (error) {
//         console.error('Error fetching user:', error);
//         throw error;
//     }
// };

export const getUsersByFilter = async (page = 1, filter = '', pageSize = 5) => {
    try {
        const body = {
            page,
            page_size: pageSize,
            filter: filter
        };

        const response = await api.post('/api/get_users_by_filter', body);

        return {
            users: response.data.users,
            total_pages: response.data.total_pages,
            current_page: response.data.current_page,
            total_users: response.data.total_users
        };
    } catch (error) {
        console.error('Error fetching filtered users:', error);
        throw error;
    }
};
