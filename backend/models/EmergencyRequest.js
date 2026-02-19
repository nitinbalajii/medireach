const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
    // Request Details
    type: {
        type: String,
        enum: ['ambulance', 'sos', 'hospital_info'],
        required: true
    },
    urgency: {
        type: String,
        enum: ['critical', 'high', 'medium'],
        default: 'high'
    },

    // Patient Info
    patientName: String,
    patientPhone: String,
    patientAge: Number,

    // Location (GeoJSON)
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    address: String,

    // Assignment
    assignedAmbulance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ambulance'
    },
    assignedHospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital'
    },

    // Status
    status: {
        type: String,
        enum: [
            'pending',
            'ambulance_dispatched',
            'in_transit',
            'arrived',
            'completed',
            'cancelled'
        ],
        default: 'pending'
    },

    // Timeline
    requestedAt: { type: Date, default: Date.now },
    dispatchedAt: Date,
    arrivedAt: Date,
    completedAt: Date,

    // SMS Tracking
    smsSent: { type: Boolean, default: false },
    trackingLink: String
});

// Geospatial index
emergencyRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
