// packageOperations.js
const fs = require('fs');

//Models
const User = require("../../Models/Perfils/User");
const Restaurant = require("../../Models/Perfils/Restaurant");

//Alterar isto tudo para apenas ver o valor de uma cokkie
function isAdmin(req, res, next) {
    User.findOne( {_id: req.user.userId}).exec()
        .then(user => {
            if(user && user.perfil && user.perfil.banned !== true && user.perfil.priority === 'Admin') {
                next();
            } else {
                console.log("O user não existe ou não tem permissões para aceder há página");
                res.sendStatus(403);
            }
        }) 
        .catch(error => {
            console.log(error);
        })
}

function isCliente(req, res, next) {
    User.findOne( {_id: req.user.userId}).exec()
        .then(user => {
            if (user && user.perfil && user.perfil.banned !== true && user.perfil.priority === 'Cliente') {
                next();
            } else {
                console.log("O user não existe ou não tem permissões para aceder há página");
                res.sendStatus(403);
            }
        }) 
        .catch(error => {
            console.log(error);
        })
}

function isDono(req, res, next) {
    User.findOne( {_id: req.user.userId}).exec()
        .then(user => {
            if (user && user.perfil &&  user.perfil.banned !== true && user.perfil.priority === 'Dono') {
                next();
            } else {
                console.log("O user não existe ou não tem permissões para aceder há página");
                res.sendStatus(403);
            }
        }) 
        .catch(error => {
            console.log(error);
        })
}

function isRestaurant(req, res, next) {
    Restaurant.findOne( {_id: req.user.userId}).exec()
        .then(restaurant => {
            if (restaurant && restaurant.perfil && user.perfil.banned !== true && restaurant.perfil.priority === 'Restaurante' ) {
                next();
            } else {
                console.log("O user não existe ou não tem permissões para aceder há página");
                res.sendStatus(403);
            }
        }) 
        .catch(error => {
            console.log(error);
        })
}

function isDonoRestaurantOrAdmin(req, res, next) {
    User.findOne( {_id: req.user.userId}).exec()
        .then(user => {
            if (user && user.perfil && user.perfil.banned !== true && user.perfil.priority === "Admin" || user.perfil.priority === 'Dono' || user.perfil.priority === "Restaurante" ) {
                next();
            } else {
                console.log("O user não existe ou não tem permissões para aceder há página");
                res.sendStatus(403);
            }
        }) 
        .catch(error => {
            console.log(error);
        })
}

module.exports = {
    isAdmin,
    isCliente,
    isDono,
    isRestaurant,
    isDonoRestaurantOrAdmin,
};