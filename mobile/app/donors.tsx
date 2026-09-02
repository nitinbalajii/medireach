import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Linking, TextInput, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, MapPin, Phone, Droplet, User, Filter } from 'lucide-react-native';
import api, { donorAPI } from '@/lib/api';

export default function DonorsScreen() {
    const router = useRouter();
    const [donors, setDonors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('All');

    useEffect(() => {
        loadDonors();
    }, []);

    const loadDonors = async () => {
        try {
            const res = await donorAPI.getAll();
            setDonors(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredDonors = donors.filter(d =>
        (selectedGroup === 'All' || d.bloodGroup === selectedGroup) &&
        (d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.area.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-3">
            <View className="flex-row justify-between items-start">
                <View className="flex-row gap-3">
                    <View className="w-12 h-12 bg-red-50 rounded-full items-center justify-center border border-red-100">
                        <Text className="text-red-600 font-bold text-lg">{item.bloodGroup}</Text>
                    </View>
                    <View>
                        <Text className="font-bold text-slate-900 text-lg">{item.name}</Text>
                        <View className="flex-row items-center gap-1">
                            <MapPin size={12} className="text-slate-400" />
                            <Text className="text-xs text-slate-500">{item.area || 'Delhi'}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    className="bg-green-50 p-2 rounded-full border border-green-100"
                    onPress={() => Linking.openURL(`tel:${item.phone}`)}
                >
                    <Phone size={18} className="text-green-600" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View className="bg-white px-5 pt-3 pb-4 border-b border-slate-100 sticky top-0 z-10">
                <View className="flex-row items-center gap-2 mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
                        <Filter size={24} className="text-slate-900" style={{ transform: [{ rotate: '90deg' }] }} />
                        {/* Using Filter icon rotated as mock back button or just standard back */}
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-slate-900">Blood Donors</Text>
                </View>

                {/* Search */}
                <View className="bg-slate-100 rounded-xl px-4 py-3 flex-row items-center h-12 mb-4">
                    <Search size={20} className="text-slate-400 mr-2" />
                    <TextInput
                        placeholder="Search by name or area..."
                        className="flex-1 text-slate-900 font-medium h-full py-0"
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{ textAlignVertical: 'center' }}
                    />
                </View>

                {/* Blood Group Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                    {['All', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                        <TouchableOpacity
                            key={bg}
                            onPress={() => setSelectedGroup(bg)}
                            className={`px-4 py-2 rounded-full border ${selectedGroup === bg ? 'bg-red-500 border-red-500' : 'bg-white border-slate-200'}`}
                        >
                            <Text className={`font-bold text-xs ${selectedGroup === bg ? 'text-white' : 'text-slate-700'}`}>{bg}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View className="flex-1 px-5 pt-4">
                {loading ? (
                    <ActivityIndicator size="large" color="#ef4444" className="mt-10" />
                ) : (
                    <FlatList
                        data={filteredDonors}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View className="items-center mt-20">
                                <Droplet size={48} className="text-slate-300 mb-4" />
                                <Text className="text-slate-400 font-medium">No donors found nearby.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
