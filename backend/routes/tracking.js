const express = require('express');
const router = express.Router();
const {
    getTrackingData,
    updateAmbulanceLocation
} = require('../controllers/trackingController');

// @route   GET /api/tracking/:requestId
// @desc    Get tracking information for emergency request
// @access  Public
router.get('/:requestId', getTrackingData);

// @route   PUT /api/tracking/:requestId/location
// @desc    Update ambulance location (for tracking)
// @access  Public (should be protected - ambulance driver only)
router.put('/:requestId/location', updateAmbulanceLocation);

module.exports = router;
