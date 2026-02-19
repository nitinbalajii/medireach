const Patient = require('../models/Patient');

// @desc    Create or update patient profile
// @route   POST /api/patients
// @access  Public (no auth for now — tied to device via a simple identifier)
const createOrUpdatePatient = async (req, res) => {
    try {
        const {
            name, age, gender, bloodGroup, phone,
            emergencyContact, medicalHistory, insuranceId,
            // clientId: a UUID generated on the frontend and stored in localStorage
            // This lets us update the same profile without full auth
            clientId
        } = req.body;

        if (!name || !bloodGroup || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name, blood group, and phone are required'
            });
        }

        let patient;

        // If clientId provided, try to find existing patient to update
        if (clientId) {
            patient = await Patient.findOneAndUpdate(
                { clientId },
                {
                    name, age, gender, bloodGroup, phone,
                    emergencyContact, medicalHistory, insuranceId,
                    clientId,
                    updatedAt: Date.now()
                },
                { new: true, upsert: true, runValidators: false }
            );
        } else {
            // Create new patient
            patient = await Patient.create({
                name, age, gender, bloodGroup, phone,
                emergencyContact, medicalHistory, insuranceId
            });
        }

        res.status(201).json({
            success: true,
            data: {
                _id: patient._id,
                name: patient.name,
                bloodGroup: patient.bloodGroup,
            },
            message: 'Profile saved successfully'
        });
    } catch (error) {
        console.error('Error in createOrUpdatePatient:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving patient profile',
            error: error.message
        });
    }
};

// @desc    Get patient profile by ID (public — for QR scan)
// @route   GET /api/patients/:id
// @access  Public (intentionally — doctors scan QR without logging in)
// IMPORTANT: We only return the medically relevant fields, NOT phone/email
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).select(
            'name age gender bloodGroup emergencyContact medicalHistory insuranceId createdAt'
            // Deliberately excluding: phone, email, clientId, userId
        );

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error('Error in getPatientById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient profile',
            error: error.message
        });
    }
};

module.exports = { createOrUpdatePatient, getPatientById };
