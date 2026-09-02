import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { Droplet, Activity, Ruler, Download, Phone, Edit, Shield, FileText, Settings, Bell, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View className="bg-white px-5 py-4 border-b border-slate-100 flex-row justify-between items-center sticky top-0 z-10">
                <View>
                    <Text className="text-2xl font-bold text-slate-900">My Health Profile</Text>
                    <Text className="text-sm text-slate-500">Manage your health data</Text>
                </View>
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100"
                        onPress={() => router.push('/about')}
                    >
                        <Bell size={20} className="text-slate-600" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100"
                        onPress={() => router.push('/contact')}
                    >
                        <Settings size={20} className="text-slate-600" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>

                {/* Profile Card */}
                <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
                    <View className="flex-row items-center gap-4 mb-6">
                        <View className="relative">
                            <View className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden border-4 border-white shadow-sm">
                                <Image
                                    source={{ uri: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=0D8ABC&color=fff' }}
                                    className="w-full h-full"
                                />
                            </View>
                            <View className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
                        </View>
                        <View>
                            <Text className="text-xl font-bold text-slate-900">{user?.name || 'Rahul Sharma'}</Text>
                            <Text className="text-sm text-slate-500">New Delhi, India</Text>
                        </View>
                    </View>

                    {/* Stats Chips */}
                    <View className="flex-row flex-wrap gap-2">
                        <View className="flex-row items-center px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                            <Droplet size={16} className="text-red-600 mr-2" />
                            <View>
                                <Text className="text-[10px] font-bold text-red-600/70 uppercase">Blood</Text>
                                <Text className="text-sm font-bold text-red-700">O+ (Pos)</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                            <Activity size={16} className="text-blue-600 mr-2" />
                            <View>
                                <Text className="text-[10px] font-bold text-blue-600/70 uppercase">Weight</Text>
                                <Text className="text-sm font-bold text-blue-700">72 kg</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center px-3 py-2 bg-amber-50 rounded-lg border border-amber-100">
                            <Ruler size={16} className="text-amber-600 mr-2" />
                            <View>
                                <Text className="text-[10px] font-bold text-amber-600/70 uppercase">Height</Text>
                                <Text className="text-sm font-bold text-amber-700">178 cm</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* QR Code Card */}
                <View className="bg-primary rounded-2xl p-6 mb-6 overflow-hidden relative shadow-lg shadow-blue-500/20">
                    <View className="flex-row justify-between items-start mb-4 relative z-10">
                        <View>
                            <Text className="text-white text-xl font-bold leading-tight">Emergency{'\n'}QR Code</Text>
                            <Text className="text-blue-100 text-xs mt-1">Scan for vital medical history</Text>
                        </View>
                        <View className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Activity size={24} color="white" />
                        </View>
                    </View>

                    <View className="bg-white p-4 rounded-xl items-center justify-center mb-4 relative z-10 shadow-sm">
                        <Image
                            source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MediReachID:12345' }}
                            className="w-32 h-32"
                        />
                    </View>

                    <TouchableOpacity className="bg-white/10 border border-white/20 py-3 rounded-xl flex-row items-center justify-center relative z-10 active:bg-white/20">
                        <Download size={20} color="white" className="mr-2" />
                        <Text className="text-white font-bold">Download to Gallery</Text>
                    </TouchableOpacity>
                </View>

                {/* Emergency Contacts */}
                <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-slate-900">Emergency Contacts</Text>
                        <TouchableOpacity>
                            <Text className="text-primary font-bold text-sm">Add New</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="gap-3">
                        <View className="flex-row items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
                                <Text className="text-indigo-600 font-bold">PS</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm text-slate-500 font-medium">Wife</Text>
                                <Text className="text-base font-bold text-slate-900">Priya Sharma</Text>
                            </View>
                            <View className="flex-row gap-2">
                                <TouchableOpacity className="w-8 h-8 bg-green-100 rounded-full items-center justify-center">
                                    <Phone size={14} className="text-green-600" />
                                </TouchableOpacity>
                                <TouchableOpacity className="w-8 h-8 bg-slate-200 rounded-full items-center justify-center">
                                    <Edit size={14} className="text-slate-600" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Insurance Info */}
                <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-24">
                    <View className="flex-row items-center gap-3 mb-4">
                        <View className="p-2 bg-purple-100 rounded-lg">
                            <Shield size={20} className="text-purple-600" />
                        </View>
                        <View>
                            <Text className="text-sm font-bold text-slate-900">Insurance Details</Text>
                            <Text className="text-xs text-slate-500">Star Health Insurance</Text>
                        </View>
                    </View>
                    <View className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-xs text-slate-500">Policy No.</Text>
                            <Text className="text-xs font-mono font-medium text-slate-900">SHI-9988-2211</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-xs text-slate-500">Valid Thru</Text>
                            <Text className="text-xs font-medium text-slate-900">Dec 2025</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        className="mt-4 flex-row items-center justify-center py-3 border border-red-200 rounded-xl bg-red-50"
                        onPress={logout}
                    >
                        <LogOut size={18} className="text-red-600 mr-2" />
                        <Text className="text-red-700 font-bold">Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}
