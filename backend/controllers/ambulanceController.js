const Ambulance = require('../models/Ambulance');

// @desc    Get all ambulances
// @route   GET /api/ambulances
// @access  Public
const getAllAmbulances = async (req, res) => {
    try {
        const { status, type } = req.query;

        let query = {};

        if (status) {
            query.status = status;
        }

        if (type) {
            query.type = type;
        }

        const ambulances = await Ambulance.find(query).populate('assignedTo');

        res.json({
            success: true,
            count: ambulances.length,
            data: ambulances
        });
    } catch (error) {
        console.error('Error in getAllAmbulances:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ambulances',
            error: error.message
        });
    }
};

// @desc    Get nearest available ambulance
// @route   GET /api/ambulances/nearest
// @access  Public
const getNearestAmbulance = async (req, res) => {
    try {
        const { lat, lng, type } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        let query = {
            status: 'available',
            currentLocation: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: 50000 // 50km
                }
            }
        };

        if (type) {
            query.type = type;
        }

        const ambulance = await Ambulance.findOne(query);

        if (!ambulance) {
            return res.status(404).json({
                success: false,
                message: 'No available ambulances found nearby'
            });
        }

        res.json({
            success: true,
            data: ambulance
        });
    } catch (error) {
        console.error('Error in getNearestAmbulance:', error);
        res.status(500).json({
            success: false,
            message: 'Error finding nearest ambulance',
            error: error.message
        });
    }
};

// @desc    Get ambulance by ID
// @route   GET /api/ambulances/:id
// @access  Public
const getAmbulanceById = async (req, res) => {
    try {
        const ambulance = await Ambulance.findById(req.params.id).populate('assignedTo');

        if (!ambulance) {
            return res.status(404).json({
                success: false,
                message: 'Ambulance not found'
            });
        }

        res.json({
            success: true,
            data: ambulance
        });
    } catch (error) {
        console.error('Error in getAmbulanceById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ambulance',
            error: error.message
        });
    }
};

// @desc    Update ambulance location
// @route   PUT /api/ambulances/:id/location
// @access  Public (should be protected - ambulance driver only)
const updateLocation = async (req, res) => {
    try {
        const { coordinates, eta } = req.body;

        if (!coordinates || coordinates.length !== 2) {
            return res.status(400).json({
                success: false,
                message: 'Valid coordinates [lng, lat] are required'
            });
        }

        const ambulance = await Ambulance.findByIdAndUpdate(
            req.params.id,
            {
                currentLocation: {
                    type: 'Point',
                    coordinates
                },
                eta: eta || ambulance.eta
            },
            { new: true, runValidators: true }
        ).populate('assignedTo');

        if (!ambulance) {
            return res.status(404).json({
                success: false,
                message: 'Ambulance not found'
            });
        }

        // Emit socket event for real-time tracking
        const io = req.app.get('io');
        if (io && ambulance.assignedTo) {
            io.to(`emergency_${ambulance.assignedTo._id}`).emit('location_update', {
                ambulanceId: ambulance._id,
                location: ambulance.currentLocation,
                eta: ambulance.eta
            });
        }

        res.json({
            success: true,
            data: ambulance
        });
    } catch (error) {
        console.error('Error in updateLocation:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating ambulance location',
            error: error.message
        });
    }
};

// @desc    Update ambulance status
// @route   PUT /api/ambulances/:id/status
// @access  Public (should be protected)
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['available', 'busy', 'offline'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: available, busy, or offline'
            });
        }

        const updateData = { status };

        // If setting to available, clear assignment
        if (status === 'available') {
            updateData.assignedTo = null;
            updateData.destination = null;
        }

        const ambulance = await Ambulance.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!ambulance) {
            return res.status(404).json({
                success: false,
                message: 'Ambulance not found'
            });
        }

        res.json({
            success: true,
            data: ambulance
        });
    } catch (error) {
        console.error('Error in updateStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating ambulance status',
            error: error.message
        });
    }
};

// @desc    Create new ambulance (admin)
// @route   POST /api/ambulances
// @access  Public (should be protected - admin only)
const createAmbulance = async (req, res) => {
    try {
        const ambulance = await Ambulance.create(req.body);

        res.status(201).json({
            success: true,
            data: ambulance
        });
    } catch (error) {
        console.error('Error in createAmbulance:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating ambulance',
            error: error.message
        });
    }
};

module.exports = {
    getAllAmbulances,
    getNearestAmbulance,
    getAmbulanceById,
    updateLocation,
    updateStatus,
    createAmbulance
};
