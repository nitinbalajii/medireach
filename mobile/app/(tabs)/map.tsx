import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Platform } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { hospitalAPI, ambulanceAPI } from '@/lib/api';
import { Building2, Ambulance, Navigation, Search, Crosshair, Star } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// MapLibre is key-less when using OpenFreeMap tiles
MapLibreGL.setAccessToken(null);

export default function MapScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [ambulances, setAmbulances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'hospitals' | 'ambulances'>('all');
    const [selectedHospital, setSelectedHospital] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const cameraRef = useRef<MapLibreGL.Camera>(null);

    useEffect(() => {
        if (searchQuery.length >= 3) {
            const match = hospitals.find(h =>
                h.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (match) {
                setSelectedHospital(match);
                cameraRef.current?.setCamera({
                    centerCoordinate: [match.location.coordinates[0], match.location.coordinates[1]],
                    zoomLevel: 14,
                    animationDuration: 1000,
                });
            }
        }
    }, [searchQuery, hospitals]);

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Permission to access location was denied');
                    setLoading(false);
                    return;
                }

                // Try last known position first
                let lastLoc = await Location.getLastKnownPositionAsync({});
                if (lastLoc) setLocation(lastLoc);

                let loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                setLocation(loc);
                fetchData();
            } catch (error) {
                console.error('Error getting location:', error);
                setLoading(false);
            }
        })();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [hospData, ambData] = await Promise.all([
                hospitalAPI.getAll(),
                ambulanceAPI.getAll()
            ]);
            setHospitals(hospData.data || []);
            setAmbulances(ambData.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const centerMap = () => {
        if (location && cameraRef.current) {
            cameraRef.current.setCamera({
                centerCoordinate: [location.coords.longitude, location.coords.latitude],
                zoomLevel: 12,
                animationDuration: 1000,
            });
        }
    };

    if (!location && loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#197fe6" />
                <Text className="mt-4 text-slate-500">Locating you...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-200">
            <MapLibreGL.MapView
                style={styles.map}
                styleURL="https://tiles.openfreemap.org/styles/bright"
                onPress={() => setSelectedHospital(null)}
                logoEnabled={false}
                attributionEnabled={false}
            >
                <MapLibreGL.Camera
                    ref={cameraRef}
                    zoomLevel={12}
                    centerCoordinate={location ? [location.coords.longitude, location.coords.latitude] : [77.2090, 28.6139]}
                />

                {/* User Location */}
                <MapLibreGL.UserLocation visible={true} />

                {(filter === 'all' || filter === 'hospitals') && hospitals
                    .filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()) || (h.location?.address || '').toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((h) => (
                        <MapLibreGL.MarkerView
                            key={h._id}
                            id={h._id}
                            coordinate={[h.location.coordinates[0], h.location.coordinates[1]]}
                        >
                            <TouchableOpacity
                                onPress={() => setSelectedHospital(h)}
                                className="bg-white rounded-full border border-slate-200 shadow-md"
                                style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <View className="bg-primary rounded-full items-center justify-center" style={{ width: 28, height: 28 }}>
                                    <Building2 size={16} color="white" />
                                </View>
                            </TouchableOpacity>
                        </MapLibreGL.MarkerView>
                    ))}

                {(filter === 'all' || filter === 'ambulances') && ambulances
                    .filter(a => (a.vehicleNumber || '').toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((a) => (
                        <MapLibreGL.MarkerView
                            key={a._id}
                            id={a._id}
                            coordinate={[a.currentLocation.coordinates[0], a.currentLocation.coordinates[1]]}
                        >
                            <View
                                className="bg-white rounded-full border border-slate-200 shadow-md"
                                style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <View className="bg-red-500 rounded-full items-center justify-center" style={{ width: 28, height: 28 }}>
                                    <Ambulance size={16} color="white" />
                                </View>
                            </View>
                        </MapLibreGL.MarkerView>
                    ))}
            </MapLibreGL.MapView>

            {/* Top Overlay: Search & Filter */}
            <SafeAreaView className="absolute top-0 left-0 right-0 p-4" edges={['top']}>
                <View className="bg-white rounded-xl shadow-sm border border-slate-100 flex-row items-center px-4 h-12 mb-3">
                    <Search size={20} className="text-slate-400 mr-2" />
                    <TextInput
                        placeholder="Search hospitals, trauma centers..."
                        className="flex-1 text-slate-900 font-medium h-full"
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                    <TouchableOpacity
                        onPress={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full border ${filter === 'all' ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-200'}`}
                    >
                        <Text className={`text-xs font-bold ${filter === 'all' ? 'text-white' : 'text-slate-700'}`}>All</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setFilter('hospitals')}
                        className={`px-4 py-2 rounded-full border flex-row items-center gap-1 ${filter === 'hospitals' ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}
                    >
                        <Building2 size={14} color={filter === 'hospitals' ? 'white' : '#64748b'} />
                        <Text className={`text-xs font-bold ${filter === 'hospitals' ? 'text-white' : 'text-slate-700'}`}>Hospitals</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setFilter('ambulances')}
                        className={`px-4 py-2 rounded-full border flex-row items-center gap-1 ${filter === 'ambulances' ? 'bg-red-500 border-red-500' : 'bg-white border-slate-200'}`}
                    >
                        <Ambulance size={14} color={filter === 'ambulances' ? 'white' : '#64748b'} />
                        <Text className={`text-xs font-bold ${filter === 'ambulances' ? 'text-white' : 'text-slate-700'}`}>Ambulances</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            {/* Recenter Button */}
            <TouchableOpacity
                onPress={centerMap}
                className="absolute right-5 bg-white p-3 rounded-xl shadow-lg border border-slate-100 items-center justify-center"
                style={{ bottom: selectedHospital ? 240 : 100 }}
            >
                <Crosshair size={24} className="text-slate-700" />
            </TouchableOpacity>

            {/* Bottom Sheet Card */}
            {selectedHospital && (
                <View className="absolute bottom-5 left-5 right-5 bg-white rounded-2xl shadow-xl border border-slate-100 p-4">
                    <View className="flex-row justify-between items-start mb-3">
                        <View>
                            <Text className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-1 self-start">
                                Hospital
                            </Text>
                            <Text className="text-lg font-bold text-slate-900">{selectedHospital.name}</Text>
                            <Text className="text-xs text-slate-500 mt-1">{selectedHospital.location?.address?.split(',')[0] || 'Delhi'}</Text>
                        </View>
                        <View className="items-end">
                            <View className="flex-row items-center gap-1">
                                <Text className="font-bold text-slate-900">4.8</Text>
                                <Star size={12} className="text-amber-500" fill="#f59e0b" />
                            </View>
                            <Text className="text-[10px] text-slate-400">1.2k reviews</Text>
                        </View>
                    </View>

                    <View className="flex-row gap-2 mb-4">
                        <View className="flex-1 bg-slate-50 p-2 rounded-lg items-center border border-slate-100">
                            <Text className="text-[10px] text-slate-500 mb-1">Beds</Text>
                            <Text className="font-bold text-primary">{selectedHospital.beds || 0} Avail</Text>
                        </View>
                        <View className="flex-1 bg-slate-50 p-2 rounded-lg items-center border border-slate-100">
                            <Text className="text-[10px] text-slate-500 mb-1">ICU</Text>
                            <Text className="font-bold text-slate-900">{selectedHospital.icuBeds || 0} Avail</Text>
                        </View>
                        <View className="flex-1 bg-slate-50 p-2 rounded-lg items-center border border-slate-100">
                            <Text className="text-[10px] text-slate-500 mb-1">Oxygen</Text>
                            <Text className="font-bold text-slate-900">Good</Text>
                        </View>
                    </View>

                    <View className="flex-row gap-3">
                        <TouchableOpacity className="flex-1 bg-primary py-3 rounded-xl flex-row items-center justify-center shadow-lg shadow-blue-500/20">
                            <Navigation size={18} className="text-white mr-2" />
                            <Text className="text-white font-bold">Navigate</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});
