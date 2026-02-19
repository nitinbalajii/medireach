// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Generic fetch wrapper with error handling
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// Hospital API
export const hospitalAPI = {
    // Get all hospitals with optional filters
    getAll: async (filters?: { area?: string; emergencyWardOpen?: boolean; minBeds?: number }) => {
        const params = new URLSearchParams();
        if (filters?.area) params.append('area', filters.area);
        if (filters?.emergencyWardOpen) params.append('emergencyWardOpen', 'true');
        if (filters?.minBeds) params.append('minBeds', filters.minBeds.toString());

        const query = params.toString() ? `?${params.toString()}` : '';
        return fetchAPI(`/hospitals${query}`);
    },

    // Get nearest hospitals to a location
    getNearest: async (lat: number, lng: number, maxDistance?: number) => {
        const params = new URLSearchParams({
            lat: lat.toString(),
            lng: lng.toString(),
        });
        if (maxDistance) params.append('maxDistance', maxDistance.toString());

        return fetchAPI(`/hospitals/nearest?${params.toString()}`);
    },

    // Get single hospital by ID
    getById: async (id: string) => {
        return fetchAPI(`/hospitals/${id}`);
    },

    // Update hospital availability
    updateAvailability: async (id: string, data: {
        beds?: number;
        icuBeds?: number;
        oxygen?: number;
        ventilators?: number;
        pediatricBeds?: number;
        traumaBeds?: number;
    }) => {
        return fetchAPI(`/hospitals/${id}/availability`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};

// Ambulance API
export const ambulanceAPI = {
    // Get all ambulances
    getAll: async (status?: 'available' | 'busy' | 'offline') => {
        const params = status ? `?status=${status}` : '';
        return fetchAPI(`/ambulances${params}`);
    },

    // Get nearest available ambulance
    getNearest: async (lat: number, lng: number) => {
        const params = new URLSearchParams({
            lat: lat.toString(),
            lng: lng.toString(),
        });
        return fetchAPI(`/ambulances/nearest?${params.toString()}`);
    },

    // Update ambulance location
    updateLocation: async (id: string, lat: number, lng: number, eta?: number) => {
        return fetchAPI(`/ambulances/${id}/location`, {
            method: 'PUT',
            body: JSON.stringify({ lat, lng, eta }),
        });
    },
};

// Crowd Reports API
export const reportsAPI = {
    // Get all active reports
    getAll: async (hospitalId?: string) => {
        const params = hospitalId ? `?hospitalId=${hospitalId}` : '';
        return fetchAPI(`/reports${params}`);
    },

    // Submit new report
    create: async (data: {
        hospitalId: string;
        reportType: 'long_queue' | 'beds_full' | 'emergency_closed' | 'oxygen_shortage' | 'no_doctors';
        comment?: string;
        reportedByName?: string;
    }) => {
        return fetchAPI('/reports', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Vote on report
    vote: async (id: string, voteType: 'up' | 'down') => {
        return fetchAPI(`/reports/${id}/vote`, {
            method: 'PUT',
            body: JSON.stringify({ voteType }),
        });
    },
};

// Emergency API
export const emergencyAPI = {
    // Create emergency request
    create: async (data: {
        type: 'ambulance' | 'sos' | 'hospital_info';
        urgency?: 'critical' | 'high' | 'medium';
        patientName?: string;
        patientPhone?: string;
        patientAge?: number;
        lat: number;
        lng: number;
        address?: string;
    }) => {
        return fetchAPI('/emergency', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get emergency request details
    getById: async (id: string) => {
        return fetchAPI(`/emergency/${id}`);
    },
};

// Patient API
export const patientAPI = {
    // Save or update a patient profile (upsert by clientId)
    saveProfile: async (data: {
        clientId: string;
        name: string;
        age: number;
        gender: string;
        bloodGroup: string;
        phone: string;
        emergencyContact?: { name: string; phone: string; relation: string };
        medicalHistory?: {
            conditions?: string[];
            allergies?: string[];
            medications?: string[];
            surgeries?: string[];
        };
        insuranceId?: string;
    }) => {
        return fetchAPI('/patients', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get patient profile by MongoDB _id (public — for QR scan)
    getById: async (id: string) => {
        return fetchAPI(`/patients/${id}`);
    },
};

// Health check
export const healthCheck = async () => {
    return fetchAPI('/health');
};

// Auth API
export const authAPI = {
    register: async (data: { name: string; email: string; password: string; role?: string }) => {
        const res = await fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) });
        if (res.token) localStorage.setItem('medireach_token', res.token);
        if (res.user) localStorage.setItem('medireach_user', JSON.stringify(res.user));
        return res;
    },
    login: async (data: { email: string; password: string }) => {
        const res = await fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) });
        if (res.token) localStorage.setItem('medireach_token', res.token);
        if (res.user) localStorage.setItem('medireach_user', JSON.stringify(res.user));
        return res;
    },
    logout: () => {
        localStorage.removeItem('medireach_token');
        localStorage.removeItem('medireach_user');
    },
    getUser: () => {
        if (typeof window === 'undefined') return null;
        const u = localStorage.getItem('medireach_user');
        return u ? JSON.parse(u) : null;
    },
    isLoggedIn: () => {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('medireach_token');
    },
};

// Donor API
export const donorAPI = {
    getAll: async (filters?: { bloodGroup?: string; area?: string; available?: boolean }) => {
        const params = new URLSearchParams();
        if (filters?.bloodGroup) params.append('bloodGroup', filters.bloodGroup);
        if (filters?.area) params.append('area', filters.area);
        if (filters?.available !== undefined) params.append('available', String(filters.available));
        const query = params.toString() ? `?${params.toString()}` : '';
        return fetchAPI(`/donors${query}`);
    },
    register: async (data: object) =>
        fetchAPI('/donors', { method: 'POST', body: JSON.stringify(data) }),
};

// Pharmacy API
export const pharmacyAPI = {
    search: async (medicine?: string) => {
        const query = medicine ? `?medicine=${encodeURIComponent(medicine)}` : '';
        return fetchAPI(`/pharmacies${query}`);
    },
};
