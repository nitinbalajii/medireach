const express = require('express');
const router = express.Router();
const { getPharmacies } = require('../controllers/pharmacyController');

router.get('/', getPharmacies);

module.exports = router;
