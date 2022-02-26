const rateLimit = require('express-rate-limit')

exports.limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 2,
  });
  