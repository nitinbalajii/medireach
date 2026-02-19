const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// CORS: allow Vercel URL in prod, any origin in dev
const allowedOrigin = process.env.FRONTEND_URL || '*';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Middleware
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/ambulances', require('./routes/ambulances'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/donors', require('./routes/donors'));
app.use('/api/pharmacies', require('./routes/pharmacies'));

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'MediReach Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Join tracking room
    socket.on('track_ambulance', (requestId) => {
        socket.join(`emergency_${requestId}`);
        console.log(`📍 Tracking ambulance for request: ${requestId}`);
    });

    // Ambulance location update
    socket.on('update_location', async (data) => {
        const { ambulanceId, location, eta } = data;

        // Broadcast to all clients tracking this ambulance
        io.emit('location_update', { ambulanceId, location, eta });
    });

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io ready for real-time updates`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}\n`);
});

module.exports = { app, io };
