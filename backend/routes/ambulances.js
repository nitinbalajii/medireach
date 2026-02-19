const express = require('express');
const router = express.Router();
const {
    getAllAmbulances,
    getNearestAmbulance,
    getAmbulanceById,
    updateLocation,
    updateStatus,
    createAmbulance
} = require('../controllers/ambulanceController');

// @route   GET /api/ambulances/nearest
// @desc    Get nearest available ambulance
// @access  Public
router.get('/nearest', getNearestAmbulance);

// @route   GET /api/ambulances
// @desc    Get all ambulances
// @access  Public
router.get('/', getAllAmbulances);

// @route   POST /api/ambulances
// @desc    Create new ambulance (admin)
// @access  Public (should be protected - admin only)
router.post('/', createAmbulance);

// @route   GET /api/ambulances/:id
// @desc    Get ambulance by ID
// @access  Public
router.get('/:id', getAmbulanceById);

// @route   PUT /api/ambulances/:id/location
// @desc    Update ambulance location
// @access  Public (should be protected - ambulance driver only)
router.put('/:id/location', updateLocation);

// @route   PUT /api/ambulances/:id/status
// @desc    Update ambulance status
// @access  Public (should be protected)
router.put('/:id/status', updateStatus);

module.exports = router;
