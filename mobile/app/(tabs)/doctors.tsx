import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, Linking, StatusBar, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doctorAPI } from '@/lib/api';
import { MapPin, Star, Phone, Search, Filter, BriefcaseMedical, CheckCircle2, BadgeCheck } from 'lucide-react-native';

export default function DoctorsScreen() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        try {
            const res = await doctorAPI.getAll();
            setDoctors(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
            <View className="flex-row gap-4 mb-4">
                <View className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden">
                    {item.image ? (
                        <Image source={{ uri: item.image }} className="w-full h-full" />
                    ) : (
                        <View className="w-full h-full items-center justify-center bg-blue-50">
                            <BriefcaseMedical size={32} className="text-primary" />
                        </View>
                    )}
                </View>
                <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                        <View>
                            <Text className="font-bold text-lg text-slate-900 flex-row items-center gap-1">
                                {item.name}
                                <BadgeCheck size={16} className="text-primary ml-1" />
                            </Text>
                            <Text className="text-sm text-slate-500">{item.specialization}</Text>
                        </View>
                        <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                            <Text className="text-xs font-bold text-yellow-700 mr-1">{item.rating || '4.8'}</Text>
                            <Star size={10} className="text-yellow-500" fill="#eab308" />
                        </View>
                    </View>

                    <View className="mt-3 flex-row flex-wrap gap-y-1 gap-x-3">
                        <View className="flex-row items-center">
                            <BriefcaseMedical size={12} className="text-slate-400 mr-1" />
                            <Text className="text-xs text-slate-600">8 Years Exp.</Text>
                        </View>
                        <View className="flex-row items-center">
                            <MapPin size={12} className="text-slate-400 mr-1" />
                            <Text className="text-xs text-slate-600 truncate max-w-[120px]">{item.hospital?.name || 'Private Clinic'}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View className="pt-3 border-t border-slate-100 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Text className="text-green-600 text-xs font-bold">Available Today</Text>
                </View>
                <TouchableOpacity
                    className="bg-primary px-5 py-2 rounded-lg shadow-sm shadow-blue-500/30"
                    onPress={() => Linking.openURL(`tel:${item.contact}`)}
                >
                    <Text className="text-white font-bold text-sm">Book Appointment</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View className="bg-white px-5 py-3 border-b border-slate-100">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-bold text-slate-900">Find Doctors</Text>
                    <TouchableOpacity className="p-2 bg-slate-50 rounded-full" onPress={() => alert('Filters coming soon!')}>
                        <Filter size={20} className="text-slate-600" />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-12 mb-4">
                    <Search size={20} className="text-slate-400 mr-2" />
                    <TextInput
                        placeholder="Search by name, specialty..."
                        className="flex-1 text-slate-700 font-medium h-full py-0"
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{ textAlignVertical: 'center' }}
                    />
                </View>

                {/* Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2 pb-2">
                    <TouchableOpacity className="px-4 py-2 bg-primary rounded-lg border border-primary">
                        <Text className="text-white text-xs font-bold">Specialty: All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-4 py-2 bg-white rounded-lg border border-slate-200">
                        <Text className="text-slate-700 text-xs font-medium">Location: Delhi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-4 py-2 bg-white rounded-lg border border-slate-200">
                        <Text className="text-slate-700 text-xs font-medium">Fee: &lt; ₹1000</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-4 py-2 bg-white rounded-lg border border-slate-200">
                        <Text className="text-slate-700 text-xs font-medium">Experience</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* List */}
            <View className="flex-1 px-5 pt-4">
                {loading ? (
                    <ActivityIndicator size="large" color="#197fe6" className="mt-10" />
                ) : (
                    <FlatList
                        data={filteredDoctors}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View className="items-center mt-20">
                                <Text className="text-slate-400 font-medium">No doctors found.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
