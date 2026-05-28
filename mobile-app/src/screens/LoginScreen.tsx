import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const login = useAppStore(s => s.login);
  const restoreSession = useAppStore(s => s.restoreSession);

  // Configuración real de Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '920387237410-t4eqmn2ubsiu9h8e9op17r6qkv0ebhlr.apps.googleusercontent.com',
    iosClientId: '920387237410-7hj05b8pe5lb99f6pqa8ovqqnc61s6t3.apps.googleusercontent.com',
    androidClientId: '920387237410-t4eqmn2ubsiu9h8e9op17r6qkv0ebhlr.apps.googleusercontent.com', // Usando web client id provisionalmente o cámbialo por el tuyo de Android
  });

  // Reacción al token de Google
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        processGoogleLogin(authentication.accessToken);
      }
    }
  }, [response]);

  const processGoogleLogin = async (token: string) => {
    setIsLoading(true);
    try {
      // Extraemos el perfil de Google usando el Access Token oficial
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo validar con Google');
      
      const data = await res.json();
      
      // Enviamos el correo y nombre reales al backend
      const result = await useAppStore.getState().googleLogin(data.email, data.name);
      setIsLoading(false);

      if (result.success) {
        navigation.replace('Main');
      } else {
        Alert.alert('Error', result.error || 'Error con Google');
      }
    } catch (e: any) {
      setIsLoading(false);
      Alert.alert('Error', e.message || 'Error de conexión con Google');
    }
  };

  // Try to restore session on mount
  useEffect(() => {
    const loadSavedUser = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('saved_email');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (e) {}
    };
    
    const tryRestore = async () => {
      const restored = await restoreSession();
      if (restored) {
        navigation.replace('Main');
      } else {
        loadSavedUser();
      }
    };
    tryRestore();
  }, []);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Correo inválido', 'Por favor ingresa un correo válido.');
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      if (rememberMe) {
        await AsyncStorage.setItem('saved_email', email.trim());
      } else {
        await AsyncStorage.removeItem('saved_email');
      }
      navigation.replace('Main');
    } else {
      Alert.alert('Error', result.error || 'Credenciales incorrectas.');
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos.');
      return;
    }

    setIsLoading(true);
    const result = await useAppStore.getState().register(email.trim(), password, name.trim());
    setIsLoading(false);

    if (result.success) {
      navigation.replace('Main');
    } else {
      Alert.alert('Error', result.error || 'No se pudo crear la cuenta.');
    }
  };

  const handleAuth = () => {
    isLoginMode ? handleLogin() : handleRegister();
  };

  const handleGoogleLogin = () => {
    promptAsync();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Logo & Branding */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/comprix-logo.png')} 
            style={{ width: 320, height: 220, resizeMode: 'contain', marginBottom: 10 }} 
          />
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          {!isLoginMode && (
            <View style={styles.inputContainer}>
              <Feather name="user" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tu nombre completo"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Feather name="mail" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Tu correo electrónico"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {isLoginMode && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center' }} 
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={{ 
                  width: 18, height: 18, borderRadius: 4, borderWidth: 1, 
                  borderColor: rememberMe ? '#059669' : '#D1D5DB', 
                  backgroundColor: rememberMe ? '#059669' : 'transparent', 
                  justifyContent: 'center', alignItems: 'center', marginRight: 8 
                }}>
                  {rememberMe && <Feather name="check" size={12} color="#FFF" />}
                </View>
                <Text style={{ color: '#6B7280', fontSize: 14 }}>Recordar usuario</Text>
              </TouchableOpacity>
              
              <TouchableOpacity>
                <Text style={{ color: '#059669', fontWeight: '600' }}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]} 
            onPress={handleAuth} 
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>{isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}</Text>
                <Feather name="arrow-right" size={18} color="#FFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Social Login */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o continúa con</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={[styles.socialBtn, { borderColor: '#DB4437' }]} activeOpacity={0.85} onPress={handleGoogleLogin}>
              <Feather name="chrome" size={20} color="#DB4437" />
              <Text style={[styles.socialBtnText, { color: '#DB4437' }]}>Continuar con Google</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>{isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}</Text>
          <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
            <Text style={styles.footerLink}> {isLoginMode ? 'Regístrate gratis' : 'Inicia sesión'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1, padding: 28, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 48 },
  logoContainer: { marginBottom: 20 },
  logoBg: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', shadowColor: '#059669', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4 },
  appName: { fontSize: 30, fontWeight: '800', color: '#111827', letterSpacing: -1, marginBottom: 8 },
  tagline: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, fontWeight: '500' },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 14, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827', fontWeight: '500' },
  eyeBtn: { padding: 8 },
  loginBtn: { flexDirection: 'row', backgroundColor: '#059669', borderRadius: 16, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, shadowColor: '#059669', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 28 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 16, fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  socialBtnText: { fontSize: 15, fontWeight: '700', color: '#374151' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 36 },
  footerText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  footerLink: { fontSize: 15, color: '#059669', fontWeight: '800' },
});
