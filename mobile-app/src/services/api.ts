import axios from 'axios';
import { Platform, Alert } from 'react-native';

// Conexión al servidor de producción en Render
const baseURL = 'https://compra-inteligente-rd.onrender.com'; // Apuntando al backend en la nube

const api = axios.create({
  baseURL,
  timeout: 10000, // 10s timeout para internet lento
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'OFFLINE') {
      Alert.alert('Sin Conexión', 'Parece que no tienes internet. Revisa tu conexión y vuelve a intentarlo.');
      return Promise.reject(error);
    }
    
    if (error.code === 'ECONNABORTED') {
      Alert.alert('Internet Lento', 'La solicitud está tomando demasiado tiempo. Reintenta en unos momentos.');
      return Promise.reject(error);
    }

    console.warn('[API Error]', error?.message || error);
    return Promise.reject(error);
  }
);

export default api;
