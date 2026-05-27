import axios from 'axios';
import { Platform, Alert } from 'react-native';

// Utilizando la nueva IP local de la máquina (cambió la red)
const baseURL = 'http://192.168.202.35:3000';

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
