const EmergencyRequest = require('../models/EmergencyRequest');
const Ambulance = require('../models/Ambulance');

// @desc    Get tracking data for emergency request
// @route   GET /api/tracking/:requestId
// @access  Public
const getTrackingData = async (req, res) => {
    try {
        const emergencyRequest = await EmergencyRequest.findById(req.params.requestId)
            .populate('assignedAmbulance')
            .populate('assignedHospital');

        if (!emergencyRequest) {
            return res.status(404).json({
                success: false,
                message: 'Emergency request not found'
            });
        }

        // Calculate ETA if ambulance is assigned
        let eta = null;
        if (emergencyRequest.assignedAmbulance && emergencyRequest.assignedAmbulance.currentLocation) {
            eta = calculateETA(
                emergencyRequest.assignedAmbulance.currentLocation.coordinates,
                emergencyRequest.location.coordinates
            );
        }

        res.json({
            success: true,
            data: {
                ...emergencyRequest.toObject(),
                eta
            }
        });
    } catch (error) {
        console.error('Error in getTrackingData:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tracking data',
            error: error.message
        });
    }
};

// @desc    Update ambulance location (for tracking)
// @route   PUT /api/tracking/:requestId/location
// @access  Public (should be protected - ambulance driver only)
const updateAmbulanceLocation = async (req, res) => {
    try {
        const { coordinates } = req.body;

        if (!coordinates || coordinates.length !== 2) {
            return res.status(400).json({
                success: false,
                message: 'Valid coordinates [lng, lat] are required'
            });
        }

        const emergencyRequest = await EmergencyRequest.findById(req.params.requestId)
            .populate('assignedAmbulance');

        if (!emergencyRequest) {
            return res.status(404).json({
                success: false,
                message: 'Emergency request not found'
            });
        }

        if (!emergencyRequest.assignedAmbulance) {
            return res.status(400).json({
                success: false,
                message: 'No ambulance assigned to this request'
            });
        }

        // Update ambulance location
        const ambulance = await Ambulance.findByIdAndUpdate(
            emergencyRequest.assignedAmbulance._id,
            {
                currentLocation: {
                    type: 'Point',
                    coordinates
                }
            },
            { new: true }
        );

        // Calculate new ETA
        const eta = calculateETA(coordinates, emergencyRequest.location.coordinates);

        // Emit socket event for real-time update
        const io = req.app.get('io');
        if (io) {
            io.to(`emergency_${emergencyRequest._id}`).emit('location_update', {
                ambulanceId: ambulance._id,
                location: ambulance.currentLocation,
                eta
            });
        }

        res.json({
            success: true,
            data: {
                location: ambulance.currentLocation,
                eta
            }
        });
    } catch (error) {
        console.error('Error in updateAmbulanceLocation:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating location',
            error: error.message
        });
    }
};

// Helper function to calculate ETA
const calculateETA = (fromCoords, toCoords) => {
    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in km
    const lat1 = toRad(fromCoords[1]);
    const lat2 = toRad(toCoords[1]);
    const dLat = toRad(toCoords[1] - fromCoords[1]);
    const dLon = toRad(toCoords[0] - fromCoords[0]);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Assume average speed of 40 km/h in city traffic
    // Add traffic multiplier (1.4x for realistic city conditions)
    const avgSpeed = 40;
    const trafficMultiplier = 1.4;
    const timeInHours = (distance * trafficMultiplier) / avgSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);

    return timeInMinutes;
};

const toRad = (value) => {
    return (value * Math.PI) / 180;
};

module.exports = {
    getTrackingData,
    updateAmbulanceLocation,
    calculateETA
};
