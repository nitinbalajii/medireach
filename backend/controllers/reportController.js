const CrowdReport = require('../models/CrowdReport');
const Hospital = require('../models/Hospital');

// @desc    Submit a crowd report
// @route   POST /api/reports
// @access  Public
const submitReport = async (req, res) => {
    try {
        const { hospitalId, reportType, description, reportedBy } = req.body;

        // Validate required fields
        if (!hospitalId || !reportType || !description) {
            return res.status(400).json({
                success: false,
                message: 'Hospital ID, report type, and description are required'
            });
        }

        // Verify hospital exists
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        // Set expiration time (6 hours from now)
        const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);

        const report = await CrowdReport.create({
            hospitalId,
            reportType,
            description,
            reportedBy: reportedBy || 'Anonymous',
            upvotes: 0,
            downvotes: 0,
            expiresAt
        });

        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error in submitReport:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting report',
            error: error.message
        });
    }
};

// @desc    Get reports for a specific hospital
// @route   GET /api/reports/hospital/:hospitalId
// @access  Public
const getReportsByHospital = async (req, res) => {
    try {
        const { hospitalId } = req.params;

        // Get non-expired reports
        const reports = await CrowdReport.find({
            hospitalId,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        console.error('Error in getReportsByHospital:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reports',
            error: error.message
        });
    }
};

// @desc    Vote on a report
// @route   PUT /api/reports/:id/vote
// @access  Public
const voteOnReport = async (req, res) => {
    try {
        const { voteType } = req.body; // 'upvote' or 'downvote'

        if (!['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                message: 'Vote type must be either "upvote" or "downvote"'
            });
        }

        const updateField = voteType === 'upvote' ? 'upvotes' : 'downvotes';

        const report = await CrowdReport.findByIdAndUpdate(
            req.params.id,
            { $inc: { [updateField]: 1 } },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error in voteOnReport:', error);
        res.status(500).json({
            success: false,
            message: 'Error voting on report',
            error: error.message
        });
    }
};

// @desc    Get all reports (admin)
// @route   GET /api/reports
// @access  Public (should be protected - admin only)
const getAllReports = async (req, res) => {
    try {
        const { includeExpired = false } = req.query;

        let query = {};
        if (!includeExpired) {
            query.expiresAt = { $gt: new Date() };
        }

        const reports = await CrowdReport.find(query)
            .populate('hospitalId', 'name address')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        console.error('Error in getAllReports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reports',
            error: error.message
        });
    }
};

// @desc    Delete expired reports (cleanup job)
// @route   DELETE /api/reports/cleanup
// @access  Public (should be protected - admin only)
const cleanupExpiredReports = async (req, res) => {
    try {
        const result = await CrowdReport.deleteMany({
            expiresAt: { $lt: new Date() }
        });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} expired reports`
        });
    } catch (error) {
        console.error('Error in cleanupExpiredReports:', error);
        res.status(500).json({
            success: false,
            message: 'Error cleaning up reports',
            error: error.message
        });
    }
};

module.exports = {
    submitReport,
    getReportsByHospital,
    voteOnReport,
    getAllReports,
    cleanupExpiredReports
};
