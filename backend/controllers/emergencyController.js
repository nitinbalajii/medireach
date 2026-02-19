const EmergencyRequest = require('../models/EmergencyRequest');
const Ambulance = require('../models/Ambulance');
const Hospital = require('../models/Hospital');

// @desc    Create emergency request
// @route   POST /api/emergency
// @access  Public
const createEmergencyRequest = async (req, res) => {
    try {
        const {
            type,
            urgency,
            patientName,
            patientPhone,
            patientAge,
            location,   // optional: { type: 'Point', coordinates: [lng, lat] }
            lat,        // flat lat from SOS trigger
            lng,        // flat lng from SOS trigger
            address,
            notes
        } = req.body;

        // Build GeoJSON location — accept either flat lat/lng or full GeoJSON
        let geoLocation;
        if (location && location.coordinates) {
            geoLocation = location;
        } else if (lat !== undefined && lng !== undefined) {
            geoLocation = {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)] // GeoJSON: [lng, lat]
            };
        } else {
            return res.status(400).json({
                success: false,
                message: 'Location (lat/lng) is required'
            });
        }

        // Find nearest available ambulance (don't fail if none found)
        let nearestAmbulance = null;
        try {
            nearestAmbulance = await Ambulance.findOne({
                status: 'available',
                currentLocation: {
                    $near: {
                        $geometry: { type: 'Point', coordinates: geoLocation.coordinates },
                        $maxDistance: 50000
                    }
                }
            });
        } catch (geoErr) {
            // $near may fail if no 2dsphere index — fall back to first available
            nearestAmbulance = await Ambulance.findOne({ status: 'available' });
        }

        // Find nearest hospital with emergency ward open
        let nearestHospital = null;
        try {
            nearestHospital = await Hospital.findOne({
                emergencyWardOpen: true,
                location: {
                    $near: {
                        $geometry: { type: 'Point', coordinates: geoLocation.coordinates },
                        $maxDistance: 30000
                    }
                }
            });
        } catch (geoErr) {
            nearestHospital = await Hospital.findOne({ emergencyWardOpen: true });
        }

        // Create emergency request (even without ambulance/hospital — dispatcher can assign)
        const emergencyRequest = await EmergencyRequest.create({
            type: type || 'sos',
            urgency: urgency || 'critical',
            patientName,
            patientPhone,
            patientAge,
            location: geoLocation,
            address: address || 'SOS Emergency Location',
            assignedAmbulance: nearestAmbulance?._id || null,
            assignedHospital: nearestHospital?._id || null,
            status: nearestAmbulance ? 'ambulance_dispatched' : 'pending',
            requestedAt: Date.now(),
            dispatchedAt: nearestAmbulance ? Date.now() : null,
            notes
        });

        // Update ambulance status if one was found (use findByIdAndUpdate to bypass pre-save hook)
        if (nearestAmbulance) {
            const ambUpdate = { status: 'busy', assignedTo: emergencyRequest._id };
            if (nearestHospital && nearestHospital.location && nearestHospital.location.coordinates) {
                ambUpdate.destination = {
                    type: 'Point',
                    coordinates: nearestHospital.location.coordinates
                };
            }
            await Ambulance.findByIdAndUpdate(nearestAmbulance._id, ambUpdate);
        }

        // Populate the response
        await emergencyRequest.populate('assignedAmbulance assignedHospital');

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.emit('emergency_created', emergencyRequest);
        }

        res.status(201).json({
            success: true,
            data: {
                emergency: emergencyRequest,
                ambulance: emergencyRequest.assignedAmbulance,
                hospital: emergencyRequest.assignedHospital,
            },
            trackingUrl: `/track-ambulance/${emergencyRequest._id}`
        });
    } catch (error) {
        console.error('Error in createEmergencyRequest:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating emergency request',
            error: error.message
        });
    }
};

// @desc    Get emergency request by ID
// @route   GET /api/emergency/:id
// @access  Public
const getEmergencyRequest = async (req, res) => {
    try {
        const emergencyRequest = await EmergencyRequest.findById(req.params.id)
            .populate('assignedAmbulance')
            .populate('assignedHospital');

        if (!emergencyRequest) {
            return res.status(404).json({
                success: false,
                message: 'Emergency request not found'
            });
        }

        res.json({
            success: true,
            data: emergencyRequest
        });
    } catch (error) {
        console.error('Error in getEmergencyRequest:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching emergency request',
            error: error.message
        });
    }
};

// @desc    Update emergency request status
// @route   PUT /api/emergency/:id/status
// @access  Public (should be protected)
const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['pending', 'ambulance_dispatched', 'in_transit', 'arrived', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const updateData = { status };

        // Set timestamps based on status
        if (status === 'in_transit' && !req.body.inTransitAt) {
            updateData.inTransitAt = Date.now();
        } else if (status === 'arrived' && !req.body.arrivedAt) {
            updateData.arrivedAt = Date.now();
        } else if (status === 'completed' && !req.body.completedAt) {
            updateData.completedAt = Date.now();
        }

        const emergencyRequest = await EmergencyRequest.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('assignedAmbulance assignedHospital');

        if (!emergencyRequest) {
            return res.status(404).json({
                success: false,
                message: 'Emergency request not found'
            });
        }

        // If completed, free up the ambulance
        if (status === 'completed' && emergencyRequest.assignedAmbulance) {
            await Ambulance.findByIdAndUpdate(emergencyRequest.assignedAmbulance._id, {
                status: 'available',
                assignedTo: null
            });
        }

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(`emergency_${emergencyRequest._id}`).emit('status_update', emergencyRequest);
        }

        res.json({
            success: true,
            data: emergencyRequest
        });
    } catch (error) {
        console.error('Error in updateRequestStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating request status',
            error: error.message
        });
    }
};

// @desc    Get all emergency requests (admin)
// @route   GET /api/emergency
// @access  Public (should be protected - admin only)
const getAllEmergencyRequests = async (req, res) => {
    try {
        const { status, limit = 50 } = req.query;

        let query = {};
        if (status) {
            query.status = status;
        }

        const requests = await EmergencyRequest.find(query)
            .populate('assignedAmbulance')
            .populate('assignedHospital')
            .sort({ requestedAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        console.error('Error in getAllEmergencyRequests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching emergency requests',
            error: error.message
        });
    }
};

module.exports = {
    createEmergencyRequest,
    getEmergencyRequest,
    updateRequestStatus,
    getAllEmergencyRequests
};
