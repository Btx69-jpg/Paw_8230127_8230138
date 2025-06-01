var mongoose = require("mongoose");

//Controllers
var navBarMiddleware = {};

//Models
const Restaurant = require("../Models/Perfils/Restaurant");

/**
 * * Middleware para aviar os admins quando surgue um novo restaurante para aprovar;
 */
navBarMiddleware.notificationAproveRestaurante = async function(req, res, next) {
    if (req.cookies && req.cookies.priority && req.cookies.priority === "Admin") {
        try {
            const count = await Restaurant.countDocuments({ aprove: false}).exec();
            res.locals.pendingRestaurantsCount = count;
        } catch (error) {
            console.error('Erro ao buscar restaurantes pendentes:', error);
            res.locals.pendingRestaurantsCount = 0;
        }
       
    } else {
        res.locals.pendingRestaurantsCount = 0;
    }
    next();
};

module.exports = navBarMiddleware;