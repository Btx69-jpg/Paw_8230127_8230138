// packageOperations.js
const fs = require('fs');

//Models
const User = require("../../Models/Perfils/User");
const Restaurant = require("../../Models/Perfils/Restaurant");

//Alterar isto tudo para apenas ver o valor de uma cokkie
function isAdmin(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Admin") {
            next();
        } else {
            res.render("errors/error500", {error: "O user não existe ou não tem permissões para aceder há página"})
            //res.sendStatus(403);
        }
    } else {
        console.log("Não existe cookie para admin");
        res.sendStatus(403);
    }
}

function isCliente(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Cliente") {
            next();
        } else {
            console.log("O user não existe ou não tem permissões para aceder há página");
            res.sendStatus(403);
        }
    } else {
        console.log("Não existe cookie para admin");
        res.sendStatus(403);
    }
}

function isDono(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Dono") {
            next();
        } else {
            console.log("O user não existe ou não tem permissões para aceder há página");
            res.sendStatus(403);
        }
    } else {
        console.log("Não existe cookie para admin");
        res.sendStatus(403);
    }
}

function isRestaurant(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cokkie === "Restaurante") {
            next();
        } else {
            console.log("O user não existe ou não tem permissões para aceder há página");
            res.sendStatus(403);
        }
    } else {
        console.log("Não existe cookie para admin");
        res.sendStatus(403);
    }
}

function isDonoRestaurantOrAdmin(req, res, next) {
    if (req.cookies && req.cookies.priority) {
        const cokkie = req.cookies.priority;
        
        if (cookie === "Admin" || cokkie === "Dono" || cokkie === "Restaurante") {
            next();
        } else {
            console.log("O user não existe ou não tem permissões para aceder há página");
            res.sendStatus(403);
        }
    } else {
        console.log("Não existe cookie para admin");
        res.sendStatus(403);
    }
}

module.exports = {
    isAdmin,
    isCliente,
    isDono,
    isRestaurant,
    isDonoRestaurantOrAdmin,
};