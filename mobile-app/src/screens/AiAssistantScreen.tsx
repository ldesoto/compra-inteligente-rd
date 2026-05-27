import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppStore } from '../store/useAppStore';

export default function AiAssistantScreen({ navigation }: any) {
  const { sendChatMessage } = useAppStore();
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: '¡Hola! Soy tu asistente financiero de Comprix. ¿Necesitas ayuda armando tu menú semanal, buscando los precios más bajos o verificando si una oferta es real?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText;
    const userMsg = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(textToSend);
      setMessages(prev => [...prev, { id: Date.now().toString() + 'ai', role: response.role || 'assistant', text: response.content || 'Error procesando.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString() + 'ai', role: 'assistant', text: 'Lo siento, tuve un problema conectándome al servidor central.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Asistente Inteligente</Text>
            <View style={styles.statusDot} />
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Feather name="more-horizontal" size={24} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Chat Area */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatArea} 
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => (
            <View key={msg.id} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              {msg.role === 'assistant' && (
                <LinearGradient colors={['#16A34A', '#15803D']} style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={14} color="#FFF" />
                </LinearGradient>
              )}
              <View style={[styles.messageContent, msg.role === 'user' ? styles.userMessageContent : styles.aiMessageContent]}>
                <Text style={[styles.messageText, msg.role === 'user' ? styles.userMessageText : styles.aiMessageText]}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
          {isTyping && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <LinearGradient colors={['#16A34A', '#15803D']} style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color="#FFF" />
              </LinearGradient>
              <View style={[styles.messageContent, styles.aiMessageContent]}>
                <Text style={styles.aiMessageText}>Escribiendo...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <TextInput 
            style={styles.textInput}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={!inputText.trim()}>
            <LinearGradient colors={inputText.trim() ? ['#16A34A', '#15803D'] : ['#E2E8F0', '#CBD5E1']} style={styles.sendButtonGradient}>
              <Feather name="send" size={18} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
  },
  backButton: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center'
  },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginRight: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A' },
  menuButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  chatArea: { flex: 1 },
  chatContent: { padding: 20, paddingBottom: 40 },
  messageBubble: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-end', maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  aiBubble: { alignSelf: 'flex-start' },
  aiAvatar: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    marginRight: 10, marginBottom: 5
  },
  messageContent: { padding: 15, borderRadius: 20 },
  userMessageContent: { backgroundColor: '#0F172A', borderBottomRightRadius: 4 },
  aiMessageContent: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  messageText: { fontSize: 15, lineHeight: 22 },
  userMessageText: { color: '#F8FAFC' },
  aiMessageText: { color: '#0F172A' },
  inputArea: {
    flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 30,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9'
  },
  textInput: {
    flex: 1, minHeight: 45, maxHeight: 100, backgroundColor: '#F1F5F9',
    borderRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12,
    color: '#0F172A', fontSize: 15, marginRight: 12
  },
  sendButton: { width: 48, height: 48 },
  sendButtonGradient: {
    flex: 1, borderRadius: 24, alignItems: 'center', justifyContent: 'center'
  }
});
