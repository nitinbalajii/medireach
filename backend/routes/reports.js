const express = require('express');
const router = express.Router();
const {
    submitReport,
    getReportsByHospital,
    voteOnReport,
    getAllReports,
    cleanupExpiredReports
} = require('../controllers/reportController');

// @route   GET /api/reports
// @desc    Get all active crowd reports
// @access  Public
router.get('/', getAllReports);

// @route   GET /api/reports/hospital/:hospitalId
// @desc    Get reports for a specific hospital
// @access  Public
router.get('/hospital/:hospitalId', getReportsByHospital);

// @route   POST /api/reports
// @desc    Create a new crowd report
// @access  Public
router.post('/', submitReport);

// @route   PUT /api/reports/:id/vote
// @desc    Upvote or downvote a report
// @access  Public
router.put('/:id/vote', voteOnReport);

// @route   DELETE /api/reports/cleanup
// @desc    Delete expired reports (cleanup job)
// @access  Public (should be protected - admin only)
router.delete('/cleanup', cleanupExpiredReports);

module.exports = router;
