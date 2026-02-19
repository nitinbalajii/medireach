const Hospital = require('../models/Hospital');

// @desc    Get all hospitals with optional filters
// @route   GET /api/hospitals
// @access  Public
const getAllHospitals = async (req, res) => {
    try {
        const { area, emergencyWardOpen, minBeds, specialty } = req.query;

        let query = {};

        // Filter by area
        if (area && area !== 'All Delhi') {
            query.area = area;
        }

        // Filter by emergency ward status
        if (emergencyWardOpen === 'true') {
            query.emergencyWardOpen = true;
        }

        // Filter by minimum beds
        if (minBeds) {
            query.beds = { $gte: parseInt(minBeds) };
        }

        // Filter by specialty
        if (specialty) {
            query.specialisations = { $in: [specialty] };
        }

        const hospitals = await Hospital.find(query).sort({ name: 1 });

        res.json({
            success: true,
            count: hospitals.length,
            data: hospitals
        });
    } catch (error) {
        console.error('Error in getAllHospitals:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hospitals',
            error: error.message
        });
    }
};

// @desc    Get nearest hospitals to a location
// @route   GET /api/hospitals/nearest
// @access  Public
const getNearestHospitals = async (req, res) => {
    try {
        const { lat, lng, maxDistance = 10000, limit = 10 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const hospitals = await Hospital.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(maxDistance) // in meters
                }
            }
        }).limit(parseInt(limit));

        // Calculate distance for each hospital
        const hospitalsWithDistance = hospitals.map(hospital => {
            const distance = calculateDistance(
                parseFloat(lat),
                parseFloat(lng),
                hospital.location.coordinates[1],
                hospital.location.coordinates[0]
            );

            return {
                ...hospital.toObject(),
                distance: Math.round(distance * 10) / 10 // Round to 1 decimal
            };
        });

        res.json({
            success: true,
            count: hospitalsWithDistance.length,
            data: hospitalsWithDistance
        });
    } catch (error) {
        console.error('Error in getNearestHospitals:', error);
        res.status(500).json({
            success: false,
            message: 'Error finding nearest hospitals',
            error: error.message
        });
    }
};

// @desc    Get single hospital by ID
// @route   GET /api/hospitals/:id
// @access  Public
const getHospitalById = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        res.json({
            success: true,
            data: hospital
        });
    } catch (error) {
        console.error('Error in getHospitalById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hospital',
            error: error.message
        });
    }
};

// @desc    Update hospital availability
// @route   PUT /api/hospitals/:id/availability
// @access  Public (should be protected in production)
const updateAvailability = async (req, res) => {
    try {
        const { beds, icuBeds, oxygen, ventilators, pediatricBeds, traumaBeds } = req.body;

        const hospital = await Hospital.findByIdAndUpdate(
            req.params.id,
            {
                beds,
                icuBeds,
                oxygen,
                ventilators,
                pediatricBeds,
                traumaBeds,
                lastVerified: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        // Emit socket event for real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('availability_update', hospital);
        }

        res.json({
            success: true,
            data: hospital
        });
    } catch (error) {
        console.error('Error in updateAvailability:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating availability',
            error: error.message
        });
    }
};

// @desc    Search hospitals by name or specialty
// @route   GET /api/hospitals/search
// @access  Public
const searchHospitals = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const hospitals = await Hospital.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { specialisations: { $regex: q, $options: 'i' } },
                { area: { $regex: q, $options: 'i' } }
            ]
        }).limit(20);

        res.json({
            success: true,
            count: hospitals.length,
            data: hospitals
        });
    } catch (error) {
        console.error('Error in searchHospitals:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching hospitals',
            error: error.message
        });
    }
};

// Helper function to calculate distance using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
};

const toRad = (value) => {
    return (value * Math.PI) / 180;
};

module.exports = {
    getAllHospitals,
    getNearestHospitals,
    getHospitalById,
    updateAvailability,
    searchHospitals
};
