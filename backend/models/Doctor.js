const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add doctor name']
    },
    specialty: {
        type: String,
        required: [true, 'Please add specialty']
    },
    qualifications: [{
        type: String,
        required: true
    }],
    experience: {
        type: Number,
        required: [true, 'Please add years of experience']
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'Please add hospital reference']
    },
    hospitalName: {
        type: String,
        required: [true, 'Please add hospital name']
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    schedule: [{
        day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            required: true
        },
        startTime: {
            type: String,
            required: true // Format: "HH:MM"
        },
        endTime: {
            type: String,
            required: true // Format: "HH:MM"
        },
        isOnDuty: {
            type: Boolean,
            default: true
        }
    }],
    availableForTeleconsult: {
        type: Boolean,
        default: false
    },
    consultationFee: {
        type: Number,
        required: [true, 'Please add consultation fee']
    },
    phone: {
        type: String
    },
    email: {
        type: String
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
DoctorSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Method to check if doctor is on duty now
DoctorSchema.methods.isCurrentlyOnDuty = function () {
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const todaySchedule = this.schedule.find(s => s.day === currentDay && s.isOnDuty);

    if (!todaySchedule) return false;

    return currentTime >= todaySchedule.startTime && currentTime <= todaySchedule.endTime;
};

module.exports = mongoose.model('Doctor', DoctorSchema);
