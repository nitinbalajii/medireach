const express = require('express');
const router = express.Router();
const { getDonors, registerDonor } = require('../controllers/donorController');

router.get('/', getDonors);
router.post('/', registerDonor);

module.exports = router;
