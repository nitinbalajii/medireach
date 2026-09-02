import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Map, CircleAlert as AlertCircle, User, HeartPulse, Stethoscope } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#197fe6', // Stitch Blue
        tabBarInactiveTintColor: '#64748b', // slate-500
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: 'white',
          borderRadius: 20,
          height: 70,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Map size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color }) => (
            <View
              className="bg-red-600 rounded-full p-4 shadow-lg shadow-red-500/50 border-4 border-slate-50 items-center justify-center"
              style={{ width: 60, height: 60 }}
            >
              <HeartPulse size={32} color="white" />
            </View>
          ),
          tabBarLabel: () => null, // Hide label for SOS
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: 'Doctors',
          tabBarIcon: ({ color }) => <Stethoscope size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      {/* Hide Alerts from tab bar but keep route accessible if needed, or better, remove it from tabs entirely if it's not a tab. 
           Since file-based routing auto-creates tabs for files in (tabs), we must hide it if we don't want it.
           But I moved alerts.tsx to (tabs)/alerts.tsx earlier. I should move it to app/alerts.tsx if it's not a tab.
           For now, I'll just hide it via display: 'none' or just delete the Screen component and let Expo hide it? 
           No, file-based routing will show it unless I define it with href: null or redirect.
           Actually, I'll just leave it out of the <Tabs> children and Expo Router 3+ might auto-add it? 
           Use href: null to hide.
       */}
      <Tabs.Screen
        name="alerts"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

