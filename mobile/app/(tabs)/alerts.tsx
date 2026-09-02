import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { emergencyAPI } from '@/lib/api';
import { AlertTriangle, Clock, MapPin, CheckCircle } from 'lucide-react-native';

export default function AlertsScreen() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAlerts = async () => {
        try {
            const res = await emergencyAPI.getAll({ status: 'active' }); // Mock filter, backend returns all
            // Filter client-side if needed or backend supports it
            setAlerts(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAlerts();
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className={`mb-4 p-4 rounded-xl border-l-4 shadow-sm bg-white ${item.status === 'active' ? 'border-red-500' : 'border-green-500'}`}>
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center">
                    {item.status === 'active' ? (
                        <AlertTriangle size={20} className="text-red-500 mr-2" />
                    ) : (
                        <CheckCircle size={20} className="text-green-500 mr-2" />
                    )}
                    <Text className="font-bold text-lg text-foreground capitalize">
                        {item.type.toUpperCase()} REQUEST
                    </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${item.status === 'active' ? 'bg-red-100' : 'bg-green-100'}`}>
                    <Text className={`text-xs font-bold ${item.status === 'active' ? 'text-red-700' : 'text-green-700'}`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                    </Text>
                </View>
            </View>

            <Text className="text-muted-foreground mb-3" numberOfLines={2}>
                {item.notes || 'Emergency assistance requested.'}
            </Text>

            <View className="flex-row gap-4">
                <View className="flex-row items-center">
                    <Clock size={14} className="text-slate-400 mr-1" />
                    <Text className="text-xs text-slate-500">
                        {new Date(item.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <MapPin size={14} className="text-slate-400 mr-1" />
                    <Text className="text-xs text-slate-500">2.5 km away</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50 px-5 pt-4">
            <Text className="text-3xl font-bold mb-2 text-foreground">Alerts</Text>
            <Text className="text-muted-foreground mb-6">Live emergency updates near you.</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#dc2626" />
            ) : (
                <FlatList
                    data={alerts}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View className="items-center py-10">
                            <CheckCircle size={48} className="text-slate-300 mb-4" />
                            <Text className="text-slate-400 font-medium">No active alerts nearby.</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}
