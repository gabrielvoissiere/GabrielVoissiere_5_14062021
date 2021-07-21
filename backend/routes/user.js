const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user.js');
const rateLimit = require('../middleware/rate-limit');

router.post('/signup', userCtrl.signup);
router.post('/login', rateLimit, userCtrl.login);

module.exports = router;