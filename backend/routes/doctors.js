const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, getSpecialties } = require('../controllers/doctorController');

// GET /api/doctors/specialties — must be before /:id to avoid conflict
router.get('/specialties', getSpecialties);

// GET /api/doctors?specialty=Cardiology&onDuty=true&teleconsult=true&search=kumar
router.get('/', getDoctors);

// GET /api/doctors/:id
router.get('/:id', getDoctorById);

module.exports = router;
