//Models
const User = require('../Models/Perfils/User');
const Restaurant = require('../Models/Perfils/Restaurant');

//JWT
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

function DonoValidation(restuarantOwner, restaurantId) {
    let find = false;
    let i = 0;
    while (i < restuarantOwner.length && !find) {
        if (restuarantOwner[i].toString() === restaurantId.toString()) {
            find = true;
        }
        i++;
    }  
    
    return find;
}

async function validateRestaurante(req, res, next) {
    try {
        const restName = req.params.restaurant;
        const token = req.cookies?.auth_token;
        const userType = req.cookies?.priority;

        if (!token) {
            return res.status(403).render("errors/error", { numError: 403 });
        }

        const decodedName = decodeURIComponent(restName);
        const restaurant = await Restaurant.findOne({ name: decodedName}).exec();
        if (!restaurant) {
            console.log("Restaurante não existente")
            return res.status(404).render("errors/error", { numError: 404 });
        }
        
        if (!token) {
            return res.status(403).render("errors/error", {numError: 403});
        }
        
        const decoded = jwt.verify(token, SECRET_KEY);
        
        if (userType === "Restaurant" && decoded.userId === restaurant._id.toString()) {
            console.log("Restaurante")
            return next();
        }

        console.error('Não tem permissão para aceder a este restaurante:');
        return res.status(403).render("errors/error", {numError: 403});
    } catch (err) {
        console.error('Não tem permissão para aceder a este restaurante:', err);
        return res.status(403).render("errors/error", {numError: 403});
    }
}

async function validateRestauranteDonoOrRest(req, res, next) {
    try {
        const restName = req.params.restaurant;
        const token = req.cookies?.auth_token;
        const userType = req.cookies?.priority;

        if (!token) {
            return res.status(403).render("errors/error", { numError: 403 });
        }

        const decodedName = decodeURIComponent(restName);
        const restaurant = await Restaurant.findOne({ name: decodedName}).exec();
        if (!restaurant) {
            console.log("Restaurante não existente")
            return res.status(404).render("errors/error", { numError: 404 });
        }
        
        if (!token) {
            return res.status(403).render("errors/error", {numError: 403});
        }
        
        const decoded = jwt.verify(token, SECRET_KEY);
        if (userType === "Restaurant" && decoded.userId === restaurant._id.toString()) {
            console.log("Restaurante")
            return next();
        }

        const user = await User.findById(decoded.userId).exec();
        if(!user) {
            console.log("Utilizador não encontrado")
            return res.status(404).render("errors/error", { numError: 404 });
        }

        if (userType === "Dono" && decoded.userId === user._id.toString()) {
            if(DonoValidation(user.perfil.restaurantIds, restaurant._id)) {
                return next();
            }
        }

        console.error('Não tem permissão para aceder a este restaurante:');
        return res.status(403).render("errors/error", {numError: 403});
    } catch (err) {
        console.error('Não tem permissão para aceder a este restaurante:', err);
        return res.status(403).render("errors/error", {numError: 403});
    }
}

async function validateRestauranteDonoAndAdmin(req, res, next) {
    try {
        const restName = req.params.restaurant;
        const token = req.cookies?.auth_token;
        const userType = req.cookies?.priority;

        if (!token) {
            return res.status(403).render("errors/error", { numError: 403 });
        }

        const decodedName = decodeURIComponent(restName);
        const restaurant = await Restaurant.findOne({ name: decodedName}).exec();
        if (!restaurant) {
            console.log("Restaurante não existente")
            return res.status(404).render("errors/error", { numError: 404 });
        }
        
        if (!token) {
            return res.status(403).render("errors/error", {numError: 403});
        }
        
        const decoded = jwt.verify(token, SECRET_KEY);

        const user = await User.findById(decoded.userId).exec();
        if(!user) {
            console.log("Utilizador não encontrado")
            return res.status(404).render("errors/error", { numError: 404 });
        }

        if(userType === "Admin" && decoded.userId === user._id.toString()) {
            return next();
        }

        if (userType === "Dono" && decoded.userId === user._id.toString()) {
            if (DonoValidation(user.perfil.restaurantIds, restaurant._id)) {
                return next();
            }
        }

        console.error('Não tem permissão para aceder a este restaurante:');
        return res.status(403).render("errors/error", {numError: 403});
    } catch (err) {
        console.error('Não tem permissão para aceder a este restaurante:', err);
        return res.status(403).render("errors/error", {numError: 403});
    }
}


module.exports = {
    validateRestauranteDonoOrRest,
    validateRestauranteDonoAndAdmin,
    validateRestaurante
};