import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use local IP for emulation, production URL for release
// REPLACE with your machine's local IP (e.g., 192.168.1.X) if running on physical device
// Android Emulator uses 10.0.2.2
const DEV_API_URL = 'http://192.168.0.100:5000/api';
const PROD_API_URL = 'https://medireach-idb2.onrender.com/api';

const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('medireach_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: async (data: any) => {
        const res = await api.post('/auth/login', data);
        if (res.data.token) {
            await SecureStore.setItemAsync('medireach_token', res.data.token);
            await SecureStore.setItemAsync('medireach_user', JSON.stringify(res.data.user));
        }
        return res.data;
    },
    register: async (data: any) => {
        const res = await api.post('/auth/register', data);
        if (res.data.token) {
            await SecureStore.setItemAsync('medireach_token', res.data.token);
            await SecureStore.setItemAsync('medireach_user', JSON.stringify(res.data.user));
        }
        return res.data;
    },
    logout: async () => {
        await SecureStore.deleteItemAsync('medireach_token');
        await SecureStore.deleteItemAsync('medireach_user');
    },
    getUser: async () => {
        const user = await SecureStore.getItemAsync('medireach_user');
        return user ? JSON.parse(user) : null;
    }
};

export const emergencyAPI = {
    create: async (data: any) => (await api.post('/emergency', data)).data,
    getById: async (id: string) => (await api.get(`/emergency/${id}`)).data,
    getAll: async (params?: any) => (await api.get('/emergency', { params })).data,
};

export const hospitalAPI = {
    getAll: async (params?: any) => (await api.get('/hospitals', { params })).data,
};

export const ambulanceAPI = {
    getAll: async () => (await api.get('/ambulances')).data,
};

export const pharmacyAPI = {
    getAll: async (params?: any) => (await api.get('/pharmacies', { params })).data,
    getById: async (id: string) => (await api.get(`/pharmacies/${id}`)).data,
};

export const doctorAPI = {
    getAll: async (params?: any) => (await api.get('/doctors', { params })).data,
    getById: async (id: string) => (await api.get(`/doctors/${id}`)).data,
};

export const donorAPI = {
    getAll: async (params?: any) => (await api.get('/donors', { params })).data,
    register: async (data: any) => (await api.post('/donors', data)).data,
};

export default api;
