import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react-native';

export default function ContactScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="bg-white px-5 py-4 border-b border-slate-100 flex-row items-center gap-3">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
                    <ArrowLeft size={24} className="text-slate-900" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Contact Support</Text>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="bg-primary rounded-2xl p-6 mb-8 shadow-lg shadow-blue-500/20">
                    <Text className="text-white text-xl font-bold mb-2">We're here to help</Text>
                    <Text className="text-blue-100 text-sm mb-6">
                        Facing issues or have feedback? Reach out to our 24/7 support team.
                    </Text>

                    <View className="gap-4">
                        <TouchableOpacity onPress={() => Linking.openURL('tel:1800-123-4567')} className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                                <Phone size={20} color="white" />
                            </View>
                            <View>
                                <Text className="text-blue-100 text-xs font-bold uppercase">Emergency Helpline</Text>
                                <Text className="text-white font-bold text-lg">1800-123-4567</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@medireach.org')} className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                                <Mail size={20} color="white" />
                            </View>
                            <View>
                                <Text className="text-blue-100 text-xs font-bold uppercase">Email Support</Text>
                                <Text className="text-white font-bold text-lg">support@medireach.org</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text className="text-lg font-bold text-slate-900 mb-4">Send us a Message</Text>
                <View className="bg-white p-5 rounded-2xl border border-slate-200">
                    <Text className="text-xs text-slate-500 font-bold uppercase mb-2">Subject</Text>
                    <TextInput
                        placeholder="How can we help?"
                        className="bg-slate-50 p-4 rounded-xl text-slate-900 font-medium mb-4 border border-slate-100"
                        placeholderTextColor="#94a3b8"
                    />

                    <Text className="text-xs text-slate-500 font-bold uppercase mb-2">Message</Text>
                    <TextInput
                        placeholder="Describe your issue..."
                        multiline
                        numberOfLines={4}
                        className="bg-slate-50 p-4 rounded-xl text-slate-900 font-medium mb-6 border border-slate-100 h-32"
                        placeholderTextColor="#94a3b8"
                        textAlignVertical="top"
                    />

                    <TouchableOpacity className="bg-slate-900 py-4 rounded-xl flex-row items-center justify-center">
                        <Send size={18} color="white" className="mr-2" />
                        <Text className="text-white font-bold">Send Message</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center justify-center mt-8 mb-10 gap-2 opacity-50">
                    <MapPin size={16} className="text-slate-400" />
                    <Text className="text-xs text-slate-500">Connaught Place, New Delhi - 110001</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
