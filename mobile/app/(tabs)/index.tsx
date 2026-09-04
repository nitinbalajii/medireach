import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import * as Location from 'expo-location';
import { emergencyAPI } from '@/lib/api';
import { io } from 'socket.io-client';
import { useRouter } from 'expo-router';
import {
  Bell,
  Search,
  Siren,
  ChevronRight,
  Building2,
  Droplet,
  User,
  MapPin,
  Star,
  BriefcaseMedical,
  Activity
} from 'lucide-react-native';

// Use local IP for emulation, production URL for release
const SOCKET_URL = 'http://192.168.0.100:5000';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [activeEmergency, setActiveEmergency] = useState<any>(null);
  const [socket, setSocket] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let lastKnown = await Location.getLastKnownPositionAsync({});
      if (lastKnown) setLocation(lastKnown);

      let current = await Location.getCurrentPositionAsync({});
      setLocation(current);
    })();

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSOS = async () => {
    Alert.alert(
      'Confirm Emergency',
      'Are you sure you want to request an ambulance?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'REQUEST NOW',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // ... logic to create emergency
              const res = await emergencyAPI.create({
                type: 'sos',
                urgency: 'critical',
                lat: location?.coords.latitude || 28.6139,
                lng: location?.coords.longitude || 77.2090,
                patientName: user?.name || 'Anonymous',
                patientPhone: '9999999999',
              });
              setActiveEmergency(res.data.emergency);
              Alert.alert('Request Sent', 'Ambulance is being dispatched.');
            } catch (err) {
              Alert.alert('Error', 'Failed to send request.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="bg-white px-5 pt-2 pb-4 border-b border-slate-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View className="bg-primary p-2 rounded-lg">
              <BriefcaseMedical size={24} color="white" />
            </View>
            <Text className="text-xl font-bold text-slate-900 tracking-tight">MediReach</Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100"
            onPress={() => router.push('/(tabs)/alerts')}
          >
            <Bell size={20} className="text-slate-600" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-12">
          <Search size={20} className="text-slate-400 mr-2" />
          <TextInput
            placeholder="Search for hospitals or services..."
            className="flex-1 text-slate-700 font-medium h-full py-0"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ textAlignVertical: 'center' }}
            onSubmitEditing={() => {
              const query = searchQuery.toLowerCase();
              if (query.includes('medicine') || query.includes('pill') || query.includes('drug') || query.includes('pharmacy')) {
                router.push('/pharmacy');
              } else if (query.trim().length > 0) {
                // Default to map for hospitals/doctors/services
                router.push('/(tabs)/map');
              }
            }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6 pb-24" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Quick Actions */}
        <View className="mb-8">
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Quick Actions</Text>

          <View className="flex-col gap-3">
            {/* AI Dispatch Card */}
            <TouchableOpacity
              className="flex-row items-center bg-red-600 border border-red-700 p-4 rounded-xl active:bg-red-700"
              onPress={() => router.push('/chatbot')}
            >
              <View className="bg-red-500 p-3 rounded-lg mr-4 border border-red-400">
                <Siren size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-white text-base">AI Emergency Dispatch</Text>
                <Text className="text-red-100 text-sm mt-0.5">Start triage & call ambulance</Text>
              </View>
              <ChevronRight size={20} color="#fca5a5" />
            </TouchableOpacity>

            {/* SOS Card */}
            <TouchableOpacity
              className="flex-row items-center bg-red-50 border border-red-100 p-4 rounded-xl active:bg-red-100"
              onPress={handleSOS}
            >
              <View className="bg-red-500 p-3 rounded-lg mr-4">
                <Siren size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-red-700 text-base">Request Ambulance</Text>
                <Text className="text-xs text-red-600/80">Immediate medical emergency response</Text>
              </View>
              <ChevronRight size={20} className="text-red-400" />
            </TouchableOpacity>

            <View className="flex-row gap-3">
              {/* Find Hospital */}
              <TouchableOpacity
                className="flex-1 bg-white border border-slate-200 p-4 rounded-xl"
                onPress={() => router.push('/(tabs)/map')}
              >
                <View className="bg-blue-50 w-10 h-10 items-center justify-center rounded-lg mb-3">
                  <Building2 size={20} className="text-primary" />
                </View>
                <Text className="font-bold text-slate-900 text-sm">Find Hospital</Text>
                <Text className="text-[10px] text-slate-500 mt-1">Nearby care facilities</Text>
              </TouchableOpacity>

              {/* Find Donor */}
              <TouchableOpacity
                className="flex-1 bg-white border border-slate-200 p-4 rounded-xl"
                onPress={() => router.push('/donors')}
              >
                <View className="bg-blue-50 w-10 h-10 items-center justify-center rounded-lg mb-3">
                  <Droplet size={20} className="text-primary" />
                </View>
                <Text className="font-bold text-slate-900 text-sm">Find Donor</Text>
                <Text className="text-[10px] text-slate-500 mt-1">Connect with donors</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3 mt-3">
              {/* Find Medicine */}
              <TouchableOpacity
                className="flex-1 bg-white border border-slate-200 p-4 rounded-xl"
                onPress={() => router.push('/pharmacy')}
              >
                <View className="bg-green-50 w-10 h-10 items-center justify-center rounded-lg mb-3">
                  <Activity size={20} className="text-green-600" />
                </View>
                <Text className="font-bold text-slate-900 text-sm">Find Medicine</Text>
                <Text className="text-[10px] text-slate-500 mt-1">Check stock</Text>
              </TouchableOpacity>

              {/* Track Ambulance */}
              <TouchableOpacity
                className="flex-1 bg-white border border-slate-200 p-4 rounded-xl"
                onPress={() => router.push('/track-ambulance')}
              >
                <View className="bg-purple-50 w-10 h-10 items-center justify-center rounded-lg mb-3">
                  <Siren size={20} className="text-purple-600" />
                </View>
                <Text className="font-bold text-slate-900 text-sm">Track Ride</Text>
                <Text className="text-[10px] text-slate-500 mt-1">Live updates</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3 mt-3">
              {/* Scan QR */}
              <TouchableOpacity
                className="flex-1 bg-white border border-slate-200 p-4 rounded-xl"
                onPress={() => router.push('/scan')}
              >
                <View className="bg-indigo-50 w-10 h-10 items-center justify-center rounded-lg mb-3">
                  <View className="w-5 h-5 border-2 border-indigo-600 rounded-sm" />
                </View>
                <Text className="font-bold text-slate-900 text-sm">Scan QR</Text>
                <Text className="text-[10px] text-slate-500 mt-1">Patient info</Text>
              </TouchableOpacity>

              {/* About/More */}
              <TouchableOpacity
                className="flex-1 bg-white border border-slate-200 p-4 rounded-xl"
                onPress={() => router.push('/about')}
              >
                <View className="bg-slate-50 w-10 h-10 items-center justify-center rounded-lg mb-3">
                  <Text className="font-bold text-slate-600 text-lg">i</Text>
                </View>
                <Text className="font-bold text-slate-900 text-sm">About Us</Text>
                <Text className="text-[10px] text-slate-500 mt-1">Mission & Info</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Live Stats */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-900">Delhi Live Stats</Text>
            <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-full border border-green-200">
              <View className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1.5" />
              <Text className="text-[10px] font-bold text-green-700">LIVE</Text>
            </View>
          </View>

          <View className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <View className="p-5 flex-row divide-x divide-slate-100">
              <View className="flex-1 pr-4">
                <Text className="text-xs text-slate-500 mb-1">Available ICU Beds</Text>
                <View className="flex-row items-end">
                  <Text className="text-2xl font-bold text-primary mr-2">428</Text>
                  <Text className="text-[10px] text-green-600 font-bold mb-1.5">↑ 12%</Text>
                </View>
              </View>
              <View className="flex-1 pl-4">
                <Text className="text-xs text-slate-500 mb-1">Oxygen Stock</Text>
                <View className="flex-row items-end">
                  <Text className="text-2xl font-bold text-slate-900 mr-2">84%</Text>
                  <Text className="text-[10px] text-slate-400 font-bold mb-1.5">Stable</Text>
                </View>
              </View>
            </View>

            <View className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex-row items-center justify-between">
              <View className="flex-row -space-x-2">
                <View className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white items-center justify-center">
                  <User size={12} className="text-blue-600" />
                </View>
                <View className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white items-center justify-center">
                  <User size={12} className="text-indigo-600" />
                </View>
                <View className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white items-center justify-center">
                  <Text className="text-[8px] font-bold text-slate-600">+12</Text>
                </View>
              </View>
              <Text className="text-[10px] text-slate-400 font-medium">Updated 2 mins ago</Text>
            </View>
          </View>
        </View>

        {/* Recommended Hospitals Carousel */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-900">Recommended Hospitals</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/map')}>
              <Text className="text-xs font-bold text-primary">View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4 pl-0.5">
            {[1, 2].map((item) => (
              <TouchableOpacity key={item} className="w-64 bg-white rounded-xl border border-slate-200 overflow-hidden mr-3">
                <View className="h-28 bg-slate-200 items-center justify-center relative">
                  <Building2 size={40} className="text-slate-400" />
                  <View className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded backdrop-blur-sm">
                    <Text className="text-[10px] font-bold text-primary">4.8 ★</Text>
                  </View>
                </View>
                <View className="p-3">
                  <Text className="font-bold text-sm text-slate-900 mb-1">Apollo Hospital Delhi</Text>
                  <View className="flex-row items-center">
                    <MapPin size={12} className="text-slate-400 mr-1" />
                    <Text className="text-xs text-slate-500">Sarita Vihar, Delhi</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
