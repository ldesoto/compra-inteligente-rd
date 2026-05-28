import axios from 'axios';
import { Platform, Alert } from 'react-native';

// Conexión al servidor local para no depender de despliegues lentos en Render
// Si usas un dispositivo físico en Android/iOS, cambia 'localhost' por la IP de tu computadora (ej: 192.168.1.5)
const baseURL = 'http://localhost:3001';

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
