const Pharmacy = require('../models/Pharmacy');

// GET /api/pharmacies?medicine=Paracetamol
const getPharmacies = async (req, res) => {
    try {
        const { medicine } = req.query;
        let filter = {};

        if (medicine) {
            // Search in inventory medicineName (case-insensitive)
            filter = {
                'inventory.medicineName': new RegExp(medicine, 'i')
            };
        }

        const pharmacies = await Pharmacy.find(filter);

        // If searching by medicine, attach matched medicines to each result
        const results = pharmacies.map(p => {
            const plain = p.toObject();
            if (medicine) {
                plain.matchedMedicines = plain.inventory
                    .filter(i => new RegExp(medicine, 'i').test(i.medicineName))
                    .map(i => ({ name: i.medicineName, availability: i.availability, price: i.price }));
            }
            return plain;
        });

        res.json({ success: true, count: results.length, data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching pharmacies', error: err.message });
    }
};

module.exports = { getPharmacies };
