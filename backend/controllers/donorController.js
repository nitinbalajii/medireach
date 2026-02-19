const Donor = require('../models/Donor');

// GET /api/donors?bloodGroup=O%2B&area=South+Delhi&available=true
const getDonors = async (req, res) => {
    try {
        const { bloodGroup, area, available } = req.query;
        const filter = {};

        if (bloodGroup) filter.bloodGroup = bloodGroup;
        if (area) filter.area = new RegExp(area, 'i');
        if (available === 'true') filter.available = true;
        if (available === 'false') filter.available = false;

        const donors = await Donor.find(filter).sort({ available: -1, totalDonations: -1 });

        res.json({ success: true, count: donors.length, data: donors });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching donors', error: err.message });
    }
};

// POST /api/donors — register as donor
const registerDonor = async (req, res) => {
    try {
        const donor = await Donor.create(req.body);
        res.status(201).json({ success: true, data: donor });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error registering donor', error: err.message });
    }
};

module.exports = { getDonors, registerDonor };
