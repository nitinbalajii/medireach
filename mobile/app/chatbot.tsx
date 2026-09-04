import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { io } from 'socket.io-client';

const API_URL = 'https://medireach-idb2.onrender.com'; // Production backend

export default function ChatbotScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { role: 'model', content: 'MediReach AI Dispatch online. Do you have a medical emergency?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Generate a simple session ID
    const newSessionId = Math.random().toString(36).substring(2, 15);
    setSessionId(newSessionId);

    // Connect to socket for real-time dispatch updates
    const socket = io(API_URL);
    socketRef.current = socket;
    
    socket.emit('join_dispatch_room', newSessionId);

    socket.on('dispatch_update', (data: any) => {
      const dispatchMsg = `?? DISPATCH UPDATE: ${data.message}\n\nAmbulance from: ${data.hospital_assigned}`;
      setMessages(prev => [...prev, { role: 'model', content: dispatchMsg }]);
    });

    socket.on(`chat:stream:${newSessionId}`, (chunk: string) => {
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg.role === 'model') {
          lastMsg.content += chunk;
        } else {
          newMsgs.push({ role: 'model', content: chunk });
        }
        return newMsgs;
      });
      setIsLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: userMsg })
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Server responded with an error');
      }

      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs[newMsgs.length - 1].role === 'model') {
          // If streaming already appended it, this might overwrite with the full thing, which is fine
          newMsgs[newMsgs.length - 1].content = data.response;
        } else {
          newMsgs.push({ role: 'model', content: data.response });
        }
        return newMsgs;
      });

    } catch (error: any) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: `?? Connection Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSessionId(Math.random().toString(36).substring(2, 15));
    setMessages([{ role: 'model', content: 'MediReach AI Dispatch Reset. Ready for new emergency.' }]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-red-700 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <Bot size={24} color="white" className="mr-2" />
          <Text className="text-white text-lg font-bold">AI Dispatch</Text>
        </View>
        <TouchableOpacity onPress={handleReset} className="p-2">
          <RefreshCw size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Warning Banner */}
      <View className="bg-red-100 flex-row items-center px-4 py-2 border-b border-red-200">
        <AlertTriangle size={16} color="#dc2626" />
        <Text className="text-red-700 text-xs ml-2 flex-1">
          If someone is unresponsive, severely bleeding, or not breathing, call emergency services immediately.
        </Text>
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, idx) => (
            <View 
              key={idx} 
              className={`mb-4 flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <View className="bg-red-100 h-8 w-8 rounded-full items-center justify-center mr-2">
                  <Bot size={16} color="#dc2626" />
                </View>
              )}
              
              <View 
                className={`p-3 rounded-2xl max-w-[80%] ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 rounded-tr-none' 
                    : 'bg-white border border-slate-200 shadow-sm rounded-tl-none'
                }`}
              >
                {/* Basic markdown stripping for RN text (for boldness) */}
                <Text 
                  className={`text-base ${msg.role === 'user' ? 'text-white' : 'text-slate-800'}`}
                >
                  {msg.content.replace(/\*\*/g, '')}
                </Text>
              </View>

              {msg.role === 'user' && (
                <View className="bg-slate-200 h-8 w-8 rounded-full items-center justify-center ml-2">
                  <User size={16} color="#475569" />
                </View>
              )}
            </View>
          ))}
          {isLoading && (
            <View className="flex-row justify-start mb-4">
              <View className="bg-red-100 h-8 w-8 rounded-full items-center justify-center mr-2">
                <Bot size={16} color="#dc2626" />
              </View>
              <View className="p-3 bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-none flex-row items-center">
                <ActivityIndicator size="small" color="#dc2626" />
                <Text className="text-slate-500 ml-2">Analyzing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="px-4 py-3 bg-white border-t border-slate-200 flex-row items-center">
          <TextInput
            className="flex-1 bg-slate-100 px-4 py-3 rounded-full text-slate-800 border border-slate-200"
            placeholder="Type your emergency..."
            placeholderTextColor="#94a3b8"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={250}
          />
          <TouchableOpacity 
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
            className={`ml-2 p-3 rounded-full ${
              input.trim() && !isLoading ? 'bg-red-500' : 'bg-slate-300'
            }`}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
