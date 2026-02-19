const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    area: { type: String, required: true },

    // Location (GeoJSON)
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },

    contact: { type: String, required: true },

    // Availability
    beds: { type: Number, default: 0 },
    icuBeds: { type: Number, default: 0 },
    oxygen: { type: Number, default: 0 },
    ventilators: { type: Number, default: 0 },
    pediatricBeds: { type: Number, default: 0 },
    traumaBeds: { type: Number, default: 0 },

    // Status
    emergencyWardOpen: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5 },
    specialists: [String],

    // Verification
    lastVerified: { type: Date, default: Date.now },
    verifiedBy: { type: String },

    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Geospatial index for location-based queries
hospitalSchema.index({ location: '2dsphere' });

// Update timestamp on save
hospitalSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Hospital', hospitalSchema);
