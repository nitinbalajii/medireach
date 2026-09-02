import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await login({ email, password });
            // Router redirection handled by AuthContext
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-center px-8"
            >
                <View className="items-center mb-10">
                    <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-4 shadow-lg shadow-primary/30">
                        <Text className="text-4xl text-white font-bold">+</Text>
                    </View>
                    <Text className="text-3xl font-bold text-foreground">MediReach</Text>
                    <Text className="text-muted-foreground mt-2 text-center">
                        Emergency healthcare at your fingertips
                    </Text>
                </View>

                <View className="space-y-4">
                    {error ? (
                        <View className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <Text className="text-red-600 text-sm text-center">{error}</Text>
                        </View>
                    ) : null}

                    <View>
                        <Text className="text-sm font-medium text-foreground mb-2 ml-1">Email</Text>
                        <TextInput
                            className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-foreground"
                            placeholder="name@example.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-foreground mb-2 ml-1">Password</Text>
                        <TextInput
                            className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-foreground"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                        className={`w-full bg-primary rounded-xl py-4 mt-4 shadow-lg shadow-primary/25 ${loading ? 'opacity-70' : ''}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-bold text-lg">Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-muted-foreground">Don't have an account? </Text>
                        <Link href="/signup" asChild>
                            <TouchableOpacity>
                                <Text className="text-primary font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
