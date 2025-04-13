// packageOperations.js
const fs = require('fs');

//Models
const User = require("../../Models/Perfils/User")

function isAdmin(req, res, next) {
    console.log("isAdmin")
    console.log(req.user);

    User.findOne( {'perfil.email': req.user.email}).exec()
        .then(user => {
            console.log("User find: ", user);
            if(user && user.perfil && user.perfil.priority === 'Admin') {
                next();
            } else {
                
                res.sendStatus(403);
            }
        }) 
        .catch(error => {
            console.log(error);
        })
}

function isCliente(req, res, next) {
    if (req.user && req.user.perfil && req.user.perfil.priority === 'Cliente') {
        next();
    } else {
        res.sendStatus(403);
    }
}

function isDono(req, res, next) {
    if (req.user && req.user.perfil && req.user.perfil.priority === 'Dono') {
        next();
    } else {
        res.sendStatus(403);
    }
}
function isRestaurant(req, res, next) {
    if (req.user && req.user.perfil && req.user.perfil.priority === 'Restaurante') {
        next();
    } else {
        res.sendStatus(403);
    }
}

module.exports = {
    isAdmin,
    isCliente,
    isDono,
    isRestaurant,
};