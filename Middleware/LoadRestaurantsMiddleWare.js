var mongoose = require("mongoose");
const Restaurant = require("../Models/Perfils/Restaurant");

getRestaurants = async function(req, res, next) {
    try {
        const restaurants = await Restaurant.find({ aprove: true }).limit(3).exec();
        res.locals.restaurants = restaurants;
    } catch (error) {
        res.locals.restaurants = [];
    }

    next();
}
module.exports = getRestaurants;
