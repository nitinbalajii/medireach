import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Linking, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pharmacyAPI } from '@/lib/api';
import { useRouter } from 'expo-router';
import { Search, MapPin, Clock, Truck, Phone, Navigation, CheckCircle2, XCircle, AlertCircle } from 'lucide-react-native';

export default function PharmacyScreen() {
    const router = useRouter();
    const [pharmacies, setPharmacies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadPharmacies();
    }, []);

    const loadPharmacies = async () => {
        try {
            const res = await pharmacyAPI.getAll();
            setPharmacies(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPharmacies = pharmacies.filter(pharmacy =>
        pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pharmacy.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pharmacy.inventory?.some((item: any) =>
            item.medicineName.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-4">
            <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row gap-3">
                    <View className="w-12 h-12 bg-blue-50 rounded-lg items-center justify-center">
                        <Text className="text-primary font-bold text-xl">{item.name.substring(0, 2).toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text className="font-bold text-lg text-slate-900">{item.name}</Text>
                        <Text className="text-xs text-slate-500">{item.location?.address?.split(',')[0]} • 0.5 km</Text>
                    </View>
                </View>

                <View className={`px-2 py-1 rounded-full flex-row items-center gap-1 ${item.stockStatus !== 'Out of Stock' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <View className={`w-2 h-2 rounded-full ${item.stockStatus !== 'Out of Stock' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <Text className={`text-[10px] font-bold ${item.stockStatus !== 'Out of Stock' ? 'text-green-700' : 'text-red-700'}`}>
                        {item.stockStatus || 'In Stock'}
                    </Text>
                </View>
            </View>

            <View className="flex-col gap-2 mb-4">
                <View className="flex-row items-start gap-2">
                    <MapPin size={16} className="text-slate-400 mt-0.5" />
                    <Text className="text-sm text-slate-600 flex-1">{item.location?.address || 'New Delhi'}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    <Text className="text-sm text-slate-600">Open 24 Hours</Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <Truck size={16} className="text-slate-400" />
                    <Text className="text-sm text-slate-600">Home Delivery Available</Text>
                </View>
            </View>

            <View className="flex-row gap-3">
                <TouchableOpacity className="flex-1 flex-row items-center justify-center border border-slate-200 py-2.5 rounded-lg bg-slate-50">
                    <Navigation size={18} className="text-slate-700 mr-2" />
                    <Text className="text-sm font-medium text-slate-700">Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center bg-primary py-2.5 rounded-lg shadow-sm shadow-blue-500/30"
                    onPress={() => Linking.openURL(`tel:${item.contact}`)}
                >
                    <Phone size={18} className="text-white mr-2" />
                    <Text className="text-sm font-bold text-white">Call Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View className="bg-white px-5 pt-3 pb-4 border-b border-slate-100 sticky top-0 z-10">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-2xl font-bold text-slate-900">Find Medicine</Text>
                    <TouchableOpacity onPress={() => loadPharmacies()} className="p-2">
                        <Text className="text-primary font-bold text-xs">Refresh</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row gap-2">
                    <View className="flex-1 bg-slate-100 rounded-xl px-4 py-3 flex-row items-center h-12">
                        <Search size={20} className="text-slate-400 mr-2" />
                        <TextInput
                            placeholder="Search medicine (e.g. Dolo 650)"
                            className="flex-1 text-slate-900 font-medium h-full py-0"
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={{ textAlignVertical: 'center' }}
                        />
                    </View>
                </View>

                {/* Filter Tags */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 gap-2">
                    <TouchableOpacity className="px-3 py-1.5 rounded-full border border-slate-200 bg-white flex-row items-center gap-1">
                        <Truck size={14} className="text-primary" />
                        <Text className="text-xs font-medium text-slate-700">Home Delivery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-3 py-1.5 rounded-full border border-slate-200 bg-white flex-row items-center gap-1">
                        <Clock size={14} className="text-primary" />
                        <Text className="text-xs font-medium text-slate-700">24/7 Open</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-3 py-1.5 rounded-full border border-slate-200 bg-white flex-row items-center gap-1">
                        <AlertCircle size={14} className="text-primary" />
                        <Text className="text-xs font-medium text-slate-700">Generic Substitutes</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <View className="flex-1 px-5 pt-4">
                {loading ? (
                    <ActivityIndicator size="large" color="#197fe6" className="mt-10" />
                ) : (
                    <FlatList
                        data={filteredPharmacies}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View className="items-center mt-20">
                                <Text className="text-slate-400 font-medium">No pharmacies found.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
