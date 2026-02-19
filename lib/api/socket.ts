import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket: Socket | null = null;

// Initialize socket connection
export const initSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socket.on('connect', () => {
            console.log('✅ Socket.io connected:', socket?.id);
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket.io disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket.io connection error:', error);
        });
    }

    return socket;
};

// Get socket instance
export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Track ambulance for emergency request
export const trackAmbulance = (requestId: string, callback: (data: any) => void) => {
    const socket = getSocket();

    // Join tracking room
    socket.emit('track_ambulance', requestId);

    // Listen for location updates
    socket.on('location_update', callback);

    // Return cleanup function
    return () => {
        socket.off('location_update', callback);
    };
};

// Listen for hospital availability updates
export const onAvailabilityUpdate = (callback: (hospital: any) => void) => {
    const socket = getSocket();
    socket.on('availability_update', callback);

    return () => {
        socket.off('availability_update', callback);
    };
};

// Listen for new crowd reports
export const onNewCrowdReport = (callback: (report: any) => void) => {
    const socket = getSocket();
    socket.on('new_crowd_report', callback);

    return () => {
        socket.off('new_crowd_report', callback);
    };
};

// Listen for emergency created events
export const onEmergencyCreated = (callback: (data: any) => void) => {
    const socket = getSocket();
    socket.on('emergency_created', callback);

    return () => {
        socket.off('emergency_created', callback);
    };
};

// Listen for ambulance location updates
export const onAmbulanceLocationUpdate = (callback: (data: any) => void) => {
    const socket = getSocket();
    socket.on('ambulance_location_update', callback);

    return () => {
        socket.off('ambulance_location_update', callback);
    };
};
