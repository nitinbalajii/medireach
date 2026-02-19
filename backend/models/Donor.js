const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    phone: { type: String, required: true },
    email: { type: String },
    area: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [lng, lat]
    },
    available: { type: Boolean, default: true },
    lastDonation: { type: Date },
    totalDonations: { type: Number, default: 0 },
    verified: { type: Boolean, default: true },
}, { timestamps: true });

donorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Donor', donorSchema);
