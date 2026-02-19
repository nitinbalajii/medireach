const express = require('express');
const router = express.Router();
const {
    createEmergencyRequest,
    getEmergencyRequest,
    updateRequestStatus,
    getAllEmergencyRequests
} = require('../controllers/emergencyController');

// @route   GET /api/emergency
// @desc    Get all emergency requests (admin)
// @access  Public (should be protected - admin only)
router.get('/', getAllEmergencyRequests);

// @route   POST /api/emergency
// @desc    Create emergency request
// @access  Public
router.post('/', createEmergencyRequest);

// @route   GET /api/emergency/:id
// @desc    Get emergency request details
// @access  Public
router.get('/:id', getEmergencyRequest);

// @route   PUT /api/emergency/:id/status
// @desc    Update emergency request status
// @access  Public (should be protected)
router.put('/:id/status', updateRequestStatus);

module.exports = router;
