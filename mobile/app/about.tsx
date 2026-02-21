import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, ShieldAlert, Award, Target, Zap, Cpu, Ambulance } from 'lucide-react-native';

export default function AboutScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="bg-white px-5 py-4 border-b border-slate-100 flex-row items-center gap-3">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
                    <ArrowLeft size={24} className="text-slate-900" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">About MediReach</Text>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 items-center">
                    <View className="w-20 h-20 bg-primary/10 rounded-2xl items-center justify-center mb-4">
                        <Heart size={40} className="text-primary" fill="#197fe6" />
                    </View>
                    <Text className="text-2xl font-bold text-slate-900 mb-1">MediReach</Text>
                    <Text className="text-sm text-slate-500 font-medium">Bridging Technology & Emergency Care</Text>
                </View>

                <View className="mb-8">
                    <Text className="text-lg font-bold text-slate-900 mb-2">Our Mission</Text>
                    <Text className="text-slate-600 leading-relaxed italic border-l-4 border-primary pl-4">
                        "To reduce confusion and response time during medical emergencies by building a reliable digital bridge between individuals and healthcare services."
                    </Text>
                </View>

                <View className="mb-8">
                    <Text className="text-lg font-bold text-slate-900 mb-3">About the Project</Text>
                    <Text className="text-slate-600 leading-relaxed mb-4">
                        MediReach is a city-focused emergency healthcare platform designed to make critical medical support faster, smarter, and more accessible.
                    </Text>
                    <Text className="text-slate-600 leading-relaxed">
                        The platform centralizes verified hospital information, specialty listings, emergency contact access, and SOS functionality into a single, unified system.
                    </Text>
                </View>

                <Text className="text-lg font-bold text-slate-900 mb-4">What we provide</Text>
                <View className="gap-4 mb-8">
                    {[
                        { icon: <Target size={20} color="#197fe6" />, title: 'Location-based Hospital Discovery' },
                        { icon: <Award size={20} color="#197fe6" />, title: 'Verified Specialized Listings' },
                        { icon: <Zap size={20} color="#197fe6" />, title: 'One-tap Emergency SOS' },
                        { icon: <Ambulance size={20} color="#197fe6" />, title: 'Ambulance Request Interface' }
                    ].map((f, i) => (
                        <View key={i} className="flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            {f.icon}
                            <Text className="font-semibold text-slate-800 text-sm">{f.title}</Text>
                        </View>
                    ))}
                </View>

                <Text className="text-lg font-bold text-slate-900 mb-4">The Team</Text>
                <View className="gap-3 mb-8">
                    <View className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <Text className="font-bold text-slate-900">Nitin Balajee</Text>
                        <Text className="text-xs text-primary font-bold uppercase mb-1">Project Lead | CSE</Text>
                        <Text className="text-xs text-slate-500">Conceptualization, Backend Architecture, API Development</Text>
                    </View>
                    <View className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <Text className="font-bold text-slate-900">Talha Siddiqui</Text>
                        <Text className="text-xs text-slate-600 font-bold uppercase mb-1">UI & Data Specialist | CSE</Text>
                        <Text className="text-xs text-slate-500">UI Layout, Visual Consistency, Data Compilation</Text>
                    </View>
                </View>

                <View className="bg-red-50 p-4 rounded-xl border border-red-100 mb-10 flex-row gap-3">
                    <ShieldAlert size={24} color="#dc2626" />
                    <View className="flex-1">
                        <Text className="font-bold text-red-900 text-xs mb-1">Disclaimer</p>
                        <Text className="text-[10px] text-red-700 leading-relaxed">
                            MediReach assists users in locating emergency services but does not replace official emergency systems. In life-threatening situations, contact official emergency services directly.
                        </Text>
                    </View>
                </View>

                <Text className="text-center text-[10px] text-slate-400 pb-10">
                    © 2026 MediReach Delhi. Final Year Engineering Project.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
