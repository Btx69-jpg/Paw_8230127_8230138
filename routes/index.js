var express = require('express');
var router = express.Router();
const auth = require('../Middleware/AutoLoginMiddleware');
const { getRecommendedRestaurants } = require('../controllers/ControllersAdmin/ListRestaurantController');


router.get('/', async (req, res) => {
  try {
    const restaurantes = await getRecommendedRestaurants();
    auth.autoLoginMiddleware;
    res.render('index', { restaurantes });
  } catch (_) {
    auth.autoLoginMiddleware;
    res.render('index');
  }
});

module.exports = router;
