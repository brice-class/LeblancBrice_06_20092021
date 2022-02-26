const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const limiter = require('../middleware/rateLimite');

router.post('/signup', userCtrl.signup);
router.post('/login', limiter.limiter, userCtrl.login);

module.exports = router;