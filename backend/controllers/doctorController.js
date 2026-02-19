const Doctor = require('../models/Doctor');

// @desc    Get all doctors with optional filters
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
    try {
        const { specialty, onDuty, teleconsult, hospital, search } = req.query;

        let query = {};

        // Filter by specialty (case-insensitive)
        if (specialty && specialty !== 'All') {
            query.specialty = { $regex: specialty, $options: 'i' };
        }

        // Filter by teleconsultation availability
        if (teleconsult === 'true') {
            query.teleconsultationAvailable = true;
        }

        // Filter by hospital name
        if (hospital) {
            query.hospitalName = { $regex: hospital, $options: 'i' };
        }

        // Text search across name and specialty
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { specialty: { $regex: search, $options: 'i' } },
                { hospitalName: { $regex: search, $options: 'i' } },
            ];
        }

        const doctors = await Doctor.find(query).sort({ rating: -1 });

        // If onDuty filter requested, use the model method to check
        let result = doctors;
        if (onDuty === 'true') {
            result = doctors.filter(doc => doc.isCurrentlyOnDuty());
        }

        res.json({
            success: true,
            count: result.length,
            data: result.map(doc => ({
                _id: doc._id,
                name: doc.name,
                specialty: doc.specialty,
                qualifications: doc.qualifications,
                experience: doc.experience,
                hospitalName: doc.hospitalName,
                hospitalId: doc.hospitalId,
                rating: doc.rating,
                schedule: doc.schedule,
                teleconsultationAvailable: doc.availableForTeleconsult,
                consultationFee: doc.consultationFee,
                phone: doc.phone,
                email: doc.email,
                isOnDuty: doc.isCurrentlyOnDuty(),
            }))
        });
    } catch (error) {
        console.error('Error in getDoctors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctors',
            error: error.message
        });
    }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.json({
            success: true,
            data: { ...doctor.toObject(), isOnDuty: doctor.isCurrentlyOnDuty() }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching doctor', error: error.message });
    }
};

// @desc    Get all unique specialties (for filter chips)
// @route   GET /api/doctors/specialties
// @access  Public
const getSpecialties = async (req, res) => {
    try {
        const specialties = await Doctor.distinct('specialty');
        res.json({ success: true, data: specialties.sort() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching specialties', error: error.message });
    }
};

module.exports = { getDoctors, getDoctorById, getSpecialties };
