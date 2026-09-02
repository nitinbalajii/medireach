import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, User, Zap } from 'lucide-react-native';

export default function ScanScreen() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const getPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        getPermissions();
    }, []);

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        // Assuming QR code contains full URL: https://medireach.org/scan/12345
        // We want to extract the ID and open web page or show modal

        // For now, let's just open the URL in browser or show data
        Alert.alert(
            "Patient ID Scanned",
            `Data: ${data}\n\nOpening health profile...`,
            [{ text: "OK", onPress: () => setScanned(false) }]
        );
        // Ideally: router.push(`/patient/${extractedId}`)
    };

    if (hasPermission === null) {
        return <View className="flex-1 bg-black items-center justify-center"><Text className="text-white">Requesting camera permission...</Text></View>;
    }
    if (hasPermission === false) {
        return <View className="flex-1 bg-black items-center justify-center"><Text className="text-white">No access to camera</Text></View>;
    }

    return (
        <View className="flex-1 bg-black">
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />

            <SafeAreaView className="flex-1 justify-between p-5">
                <View className="flex-row justify-between items-start">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/40 rounded-full items-center justify-center backdrop-blur-md">
                        <X size={24} color="white" />
                    </TouchableOpacity>
                    <View className="bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                        <Text className="text-white text-xs font-bold">SCAN QR CODE</Text>
                    </View>
                    <TouchableOpacity className="w-10 h-10 bg-black/40 rounded-full items-center justify-center backdrop-blur-md">
                        <Zap size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="items-center mb-10">
                    <View className="w-64 h-64 border-2 border-white/50 rounded-3xl items-center justify-center relative">
                        <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                        <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                        <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                        <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-xl" />

                        <View className="bg-primary/20 p-4 rounded-full animate-pulse">
                            <User size={32} color="white" opacity={0.8} />
                        </View>
                    </View>
                    <Text className="text-white/80 mt-6 text-center font-medium">
                        Align QR code within the frame{'\n'}to view patient health profile
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}
