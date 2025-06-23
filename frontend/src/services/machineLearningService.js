import api from './api';


// Obtiene todos los modelos de machine learning con paginación
export const getAllMLModels = async ({ page, limit }) => {
  try {
    const response = await api.post('/ml_models/all', { page, limit });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching all ML models:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al obtener todos los modelos de ML'
    };
  }
};

// Obtiene solo los modelos de machine learning activos
export const getActiveMLModels = async () => {
  try {
    const response = await api.get('/ml_models/actives');

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching active ML models:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al obtener los modelos activos de ML'
    };
  }
};

// Reentrena un modelo de machine learning por su tipo
export const retrainMLModel = async (modelType) => {
  try {
    const response = await api.post('/ml_models/training', { 
      model: modelType 
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error retraining ML model:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al reentrenar el modelo de ML'
    };
  }
};