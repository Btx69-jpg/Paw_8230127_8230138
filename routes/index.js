var express = require('express');
var router = express.Router();
const auth = require('../Middleware/AutoLoginMiddleware');

router.get('/', (req, res) => {
  auth.autoLoginMiddleware;
  res.render('index');
});

module.exports = router;
