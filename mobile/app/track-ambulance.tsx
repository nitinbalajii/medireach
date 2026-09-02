import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Ambulance } from 'lucide-react-native';

export default function TrackAmbulanceScreen() {
    const router = useRouter();
    const [trackingId, setTrackingId] = useState('');

    const handleTrack = () => {
        if (trackingId.trim()) {
            router.push(`/track-ambulance/${trackingId}` as any);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="bg-white px-5 py-4 border-b border-slate-100 flex-row items-center gap-3">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
                    <ArrowLeft size={24} className="text-slate-900" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Track Ambulance</Text>
            </View>

            <View className="flex-1 p-5 items-center justify-center -mt-20">
                <View className="w-32 h-32 bg-blue-50 rounded-full items-center justify-center mb-8 border-4 border-blue-100">
                    <Ambulance size={64} className="text-primary" />
                </View>

                <Text className="text-2xl font-bold text-slate-900 mb-2 text-center">Live Tracking</Text>
                <Text className="text-slate-500 text-center mb-8 px-8">
                    Enter the ambulance ID or emergency request ID sent to your phone number.
                </Text>

                <View className="w-full bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex-row items-center mb-6">
                    <View className="p-3">
                        <Search size={20} className="text-slate-400" />
                    </View>
                    <TextInput
                        placeholder="Enter Tracking ID (e.g. AMB-123)"
                        className="flex-1 text-lg font-bold text-slate-900 h-12"
                        placeholderTextColor="#94a3b8"
                        value={trackingId}
                        onChangeText={setTrackingId}
                        autoCapitalize="characters"
                    />
                </View>

                <TouchableOpacity
                    className={`w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-blue-500/30 ${trackingId ? 'bg-primary' : 'bg-slate-300'}`}
                    onPress={handleTrack}
                    disabled={!trackingId}
                >
                    <Text className="text-white font-bold text-lg">Track Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
