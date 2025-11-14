const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const { protect } = require('../middleware/auth');

// Protected route - requires authentication
router.get('/', protect, studyController.getStudyData);

module.exports = router;

