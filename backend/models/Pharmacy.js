const mongoose = require('mongoose');

const PharmacySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add pharmacy name']
    },
    address: {
        type: String,
        required: [true, 'Please add address']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    phone: {
        type: String,
        required: [true, 'Please add phone number']
    },
    is24x7: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['government', 'private'],
        required: [true, 'Please add pharmacy type']
    },
    inventory: [{
        medicineId: {
            type: Number
        },
        medicineName: {
            type: String,
            required: true
        },
        availability: {
            type: String,
            enum: ['in_stock', 'low_stock', 'out_of_stock'],
            default: 'in_stock'
        },
        price: {
            type: Number,
            required: true
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    }],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
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

// Create geospatial index for location-based queries
PharmacySchema.index({ location: '2dsphere' });

// Update the updatedAt field before saving
PharmacySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Pharmacy', PharmacySchema);
