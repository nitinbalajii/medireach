const mongoose = require('mongoose');

const ambulanceSchema = new mongoose.Schema({
    vehicleNumber: { type: String, required: true, unique: true },
    type: {
        type: String,
        enum: ['Basic', 'Advanced', 'Cardiac'],
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'busy', 'offline'],
        default: 'available'
    },

    // Current location (GeoJSON)
    currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },

    driver: {
        name: String,
        phone: String
    },

    // Current assignment
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmergencyRequest'
    },
    destination: {
        type: { type: String, enum: ['Point'] },
        coordinates: [Number]
    },
    eta: Number, // minutes

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Geospatial index
ambulanceSchema.index({ currentLocation: '2dsphere' });

// Update timestamp
ambulanceSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Ambulance', ambulanceSchema);
