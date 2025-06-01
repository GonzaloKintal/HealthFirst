
import api from './api';


export const login = async (username, password) => {
    try {
        const response = await api.post('/users/token', { username, password });
        return response.data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
}
