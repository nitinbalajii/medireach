import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleSignup = async () => {
        if (!name || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await register({ name, email, password, role });
            // Redirect handled by AuthContext
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 32 }}>
                    <View className="items-center mb-8">
                        <View className="w-16 h-16 bg-red-100 rounded-2xl items-center justify-center mb-4">
                            <Text className="text-3xl text-red-600 font-bold">+</Text>
                        </View>
                        <Text className="text-3xl font-bold text-foreground">Create Account</Text>
                        <Text className="text-muted-foreground mt-2 text-center">
                            Join MediReach to access emergency services.
                        </Text>
                    </View>

                    <View className="space-y-4">
                        {error ? (
                            <View className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <Text className="text-red-600 text-sm text-center">{error}</Text>
                            </View>
                        ) : null}

                        <View>
                            <Text className="text-sm font-medium text-foreground mb-2 ml-1">Full Name</Text>
                            <TextInput
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-foreground"
                                placeholder="John Doe"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

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
                            onPress={handleSignup}
                            disabled={loading}
                            activeOpacity={0.8}
                            className={`w-full bg-primary rounded-xl py-4 mt-6 shadow-lg shadow-primary/25 ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-center font-bold text-lg">Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row justify-center mt-6">
                            <Text className="text-muted-foreground">Already have an account? </Text>
                            <Link href="/login" asChild>
                                <TouchableOpacity>
                                    <Text className="text-primary font-bold">Log In</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
