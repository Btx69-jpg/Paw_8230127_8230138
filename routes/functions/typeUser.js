// packageOperations.js
const fs = require('fs');

function isAdmin() {
    if (req.user && req.user.perfil && req.user.perfil.priority === 'Admin') {
        next();
    } else {
        res.sendStatus(403);
    }
}

function isCliente() {
    if (req.user && req.user.perfil && req.user.perfil.priority === 'Cliente') {
        next();
    } else {
        res.sendStatus(403);
    }
}

function isDono() {
    if (req.user && req.user.perfil && req.user.perfil.priority === 'Dono') {
        next();
    } else {
        res.sendStatus(403);
    }
}
function isRestaurant() {
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