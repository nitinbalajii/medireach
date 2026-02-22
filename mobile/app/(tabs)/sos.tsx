import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { emergencyAPI } from '@/lib/api';
import { io } from 'socket.io-client';
import * as Location from 'expo-location';
import { Phone, Ambulance, MapPin, Clock } from 'lucide-react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

const SOCKET_URL = 'http://192.168.0.100:5000';
MapLibreGL.setAccessToken(null);

export default function SOSScreen() {
    const { user } = useAuth();
    const [activeEmergency, setActiveEmergency] = useState<any>(null);
    const [socket, setSocket] = useState<any>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [loading, setLoading] = useState(false);
    const [ambulanceLoc, setAmbulanceLoc] = useState<any>(null);
    const cameraRef = useRef<MapLibreGL.Camera>(null);

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Permission to access location was denied');
                    return;
                }

                // Try last known position first (super fast)
                let lastLoc = await Location.getLastKnownPositionAsync({});
                if (lastLoc) setLocation(lastLoc);

                // Then get fresh position
                let loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                setLocation(loc);
            } catch (err) {
                console.error('SOS Location error:', err);
            }
        })();

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (activeEmergency && socket) {
            socket.emit('track_ambulance', activeEmergency._id);
            socket.on('location_update', (data: any) => {
                setAmbulanceLoc(data);
                // Auto-center on ambulance if tracking
                if (data.lat && data.lng) {
                    cameraRef.current?.setCamera({
                        centerCoordinate: [data.lng, data.lat],
                        zoomLevel: 14,
                        animationDuration: 1000,
                    });
                }
            });
            socket.on('status_update', (data: any) => {
                setActiveEmergency(data);
            });

            return () => {
                socket.off('location_update');
                socket.off('status_update');
                socket.emit('leave_room', activeEmergency._id);
            };
        }
    }, [activeEmergency, socket]);

    const handleSOS = async () => {
        if (!location) {
            Alert.alert('Locating...', 'Please wait for GPS.');
            return;
        }

        setLoading(true);
        try {
            const res = await emergencyAPI.create({
                type: 'sos',
                urgency: 'critical',
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                patientName: user?.name,
                patientPhone: '9999999999'
            });
            setActiveEmergency(res.data.emergency);
        } catch (err) {
            Alert.alert('Failed', 'Could not send SOS');
        } finally {
            setLoading(false);
        }
    };

    if (activeEmergency) {
        return (
            <View className="flex-1 bg-white">
                <MapLibreGL.MapView
                    style={{ flex: 1 }}
                    styleURL="https://tiles.openfreemap.org/styles/bright"
                    logoEnabled={false}
                    attributionEnabled={false}
                >
                    <MapLibreGL.Camera
                        ref={cameraRef}
                        zoomLevel={14}
                        centerCoordinate={location ? [location.coords.longitude, location.coords.latitude] : [77.2090, 28.6139]}
                    />

                    {location && (
                        <MapLibreGL.PointAnnotation
                            id="user"
                            coordinate={[location.coords.longitude, location.coords.latitude]}
                        >
                            <View className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
                        </MapLibreGL.PointAnnotation>
                    )}

                    {ambulanceLoc && (
                        <MapLibreGL.PointAnnotation
                            id="ambulance"
                            coordinate={[ambulanceLoc.lng, ambulanceLoc.lat]}
                        >
                            <View
                                className="bg-red-500 rounded-full items-center justify-center border-2 border-white shadow-lg"
                                style={{ width: 32, height: 32 }}
                            >
                                <Ambulance size={16} color="white" />
                            </View>
                        </MapLibreGL.PointAnnotation>
                    )}
                </MapLibreGL.MapView>

                <View className="bg-white p-5 rounded-t-3xl shadow-xl -mt-6">
                    <Text className="text-xl font-bold mb-2">Ambulance Dispatched</Text>
                    <Text className="text-red-600 font-bold text-sm mb-4">STATUS: {activeEmergency.status.replace('_', ' ').toUpperCase()}</Text>

                    <View className="flex-row items-center mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mr-3">
                            <Ambulance size={24} color="#dc2626" />
                        </View>
                        <View>
                            <Text className="font-bold text-foreground">
                                {activeEmergency.assignedAmbulance?.vehicleNumber || 'Finding Ambulance...'}
                            </Text>
                            <Text className="text-muted-foreground text-xs">
                                {activeEmergency.assignedAmbulance?.driver?.name || 'Searching...'}
                            </Text>
                        </View>
                        <TouchableOpacity className="ml-auto bg-green-500 p-2 rounded-full">
                            <Phone size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-between mb-4">
                        <View className="items-center">
                            <Clock size={20} className="text-muted-foreground mb-1" />
                            <Text className="text-xs text-muted-foreground">ETA</Text>
                            <Text className="font-bold">8 min</Text>
                        </View>
                        <View className="items-center">
                            <MapPin size={20} className="text-muted-foreground mb-1" />
                            <Text className="text-xs text-muted-foreground">Distance</Text>
                            <Text className="font-bold">2.4 km</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        className="w-full bg-slate-900 py-3 rounded-xl items-center"
                        onPress={() => setActiveEmergency(null)}
                    >
                        <Text className="text-white font-bold">Close Tracking</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-red-600 justify-center items-center">
            <View className="items-center">
                <Text className="text-white font-bold text-3xl mb-2">EMERGENCY</Text>
                <Text className="text-red-100 text-center px-10 mb-10">
                    Pressing the button below will summon immediate help to your location.
                </Text>

                <TouchableOpacity
                    onPress={handleSOS}
                    activeOpacity={0.8}
                    className="w-64 h-64 bg-white rounded-full items-center justify-center shadow-2xl border-8 border-red-400"
                >
                    {loading ? (
                        <ActivityIndicator size="large" color="#dc2626" />
                    ) : (
                        <View className="items-center">
                            <Text className="text-red-600 text-6xl font-black tracking-widest">SOS</Text>
                            <Text className="text-slate-400 font-bold text-sm mt-2">TAP NOW</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text className="text-white/80 mt-10 text-xs text-center px-10">
                    Your location and medical profile will be shared with the nearest ambulance and hospital.
                </Text>
            </View>
        </SafeAreaView>
    );
}
