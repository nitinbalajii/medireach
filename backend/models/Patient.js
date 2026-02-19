const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for now, will be required when auth is implemented
    },
    // clientId: UUID generated on frontend, stored in localStorage.
    // Allows upsert without full auth — links to a user account later.
    clientId: {
        type: String,
        index: true,
        sparse: true
    },
    name: {
        type: String,
        required: [true, 'Please add patient name']
    },
    age: {
        type: Number,
        required: [true, 'Please add patient age']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: [true, 'Please add patient gender']
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: [true, 'Please add blood group']
    },
    phone: {
        type: String,
        required: [true, 'Please add phone number']
    },
    emergencyContact: {
        name: {
            type: String,
            required: [true, 'Please add emergency contact name']
        },
        phone: {
            type: String,
            required: [true, 'Please add emergency contact phone']
        },
        relationship: {
            type: String,
            required: [true, 'Please add relationship']
        }
    },
    medicalHistory: {
        conditions: [{
            type: String
        }],
        allergies: [{
            type: String
        }],
        medications: [{
            type: String
        }],
        surgeries: [{
            type: String
        }]
    },
    insuranceId: {
        type: String
    },
    qrCode: {
        type: String // Base64 encoded QR code
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
PatientSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Patient', PatientSchema);
