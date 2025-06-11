
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

        const response = await api.post('/users/', body);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const addUser = async (user) => {
    try {
        await api.post(`/users/register`, user);
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
    await api.delete(`/users/delete/${userId}`);
    } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
    }
};

export const editUser = async (id, data) => {
    try {
        await api.put(`/users/update/${id}`, data);
    } catch (error) {
        console.error('Error editing user:', error);
        throw error;
    }
};

export const getUser = async (id) => {
    try {
        const response = await api.get(`/users/get_user/${id}`);
        return response.data.user;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

export const getUsersByFilter = async (page = 1, filter = '', pageSize = 5) => {
    try {
        const body = {
            page,
            page_size: pageSize,
            filter: filter
        };

        const response = await api.post('/users/get_users_by_filter', body);

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


export const addTelegramSubscription = async (userId, telegramId) => {
    try {
        const response = await api.post('/messaging/add_telegram_suscription', {
            user_id: userId,
            telegram_id: telegramId
        });
        return response.data;
    } catch (error) {
        console.error('Error adding Telegram subscription:', error);
        throw error;
    }
};

export const removeTelegramSubscription = async (userId) => {
    try {
        const response = await api.delete(`/messaging/remove_telegram_suscription/${userId}`, {
            data: { user_id: userId }
        });
        return response.data;
    } catch (error) {
        console.error('Error removing Telegram subscription:', error);
        throw error;
    }
};

export const getTelegramSubscription = async (userId) => {
    try {
        const response = await api.get(`/messaging/get_telegram_suscription/${userId}`);
        return {
            isSubscribed: response.data.is_subscribed,
            telegramId: response.data.telegram_id
        };
    } catch (error) {
        console.error('Error fetching Telegram subscription:', error);
        throw error;
    }
};


export const getHealthRiskPredictions = async (params = {}) => {
  try {
    const response = await api.get('/users/predict_health_risk/', {
      params: {
        limit: params.limit,
        offset: params.offset,
      }
    });
    console.log('Health risk predictions response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching health risk predictions:', error);
    throw error;
  }
};