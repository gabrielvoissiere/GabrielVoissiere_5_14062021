const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const rateLimit = require('../middleware/rate-limit'); // importation de rate-limite pour limiter le nombre de requettes

router.post('/signup', userCtrl.signup); // route pour s'inscrire
router.post('/login', rateLimit, userCtrl.login); // route pour se connecter

module.exports = router;