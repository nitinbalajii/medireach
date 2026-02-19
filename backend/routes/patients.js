const express = require('express');
const router = express.Router();
const { createOrUpdatePatient, getPatientById } = require('../controllers/patientController');

// POST /api/patients — save/update profile
router.post('/', createOrUpdatePatient);

// GET /api/patients/:id — public, for QR scan
router.get('/:id', getPatientById);

module.exports = router;
