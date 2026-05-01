const express = require('express');
const router = express.Router();
const { getNearby } = require('../controllers/emergencyController');

// Nearby hospitals and emergency services
router.get('/nearby', getNearby);

module.exports = router;
