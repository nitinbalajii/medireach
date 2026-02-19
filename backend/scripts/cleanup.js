require('dotenv').config();
const mongoose = require('mongoose');
const EmergencyRequest = require('../models/EmergencyRequest');
const Ambulance = require('../models/Ambulance');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    // Reset all ambulances to available
    const a = await Ambulance.updateMany({}, { status: 'available', assignedTo: null });
    console.log('✅ Ambulances reset:', a.modifiedCount, 'updated to available');

    // Delete old test requests from 2025
    const cutoff = new Date('2026-01-01');
    const d = await EmergencyRequest.deleteMany({ requestedAt: { $lt: cutoff } });
    console.log('🗑️  Old 2025 requests deleted:', d.deletedCount);

    // Show remaining
    const remaining = await EmergencyRequest.countDocuments();
    console.log('📋 Remaining emergency requests:', remaining);

    process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
