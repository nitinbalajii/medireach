const express = require('express');
const router = express.Router();
const {
    getAllHospitals,
    getNearestHospitals,
    getHospitalById,
    updateAvailability,
    searchHospitals
} = require('../controllers/hospitalController');

// @route   GET /api/hospitals/search
// @desc    Search hospitals by name or specialty
// @access  Public
router.get('/search', searchHospitals);

// @route   GET /api/hospitals/nearest
// @desc    Get nearest hospitals to a location
// @access  Public
router.get('/nearest', getNearestHospitals);

// @route   GET /api/hospitals
// @desc    Get all hospitals with optional filters
// @access  Public
router.get('/', getAllHospitals);

// @route   GET /api/hospitals/:id
// @desc    Get single hospital by ID
// @access  Public
router.get('/:id', getHospitalById);

// @route   PUT /api/hospitals/:id/availability
// @desc    Update hospital availability
// @access  Public (should be protected in production)
router.put('/:id/availability', updateAvailability);

module.exports = router;
