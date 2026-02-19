const mongoose = require('mongoose');

const crowdReportSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },

    reportType: {
        type: String,
        enum: [
            'long_queue',
            'beds_full',
            'emergency_closed',
            'oxygen_shortage',
            'no_doctors'
        ],
        required: true
    },

    comment: String,
    reportedByName: String, // For anonymous reports

    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },

    verified: { type: Boolean, default: false },

    // Auto-expire after 2 hours
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    },

    createdAt: { type: Date, default: Date.now }
});

// TTL index - MongoDB will automatically delete expired documents
crowdReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('CrowdReport', crowdReportSchema);
