var mongoose = require("mongoose");
const multer = require('multer');
//Models
const User = require("../Models/Perfils/User");

//Controllers
var historicOrderController = {};

historicOrderController.historicOrder = function(req, res) {}

/** Pagina para filtar as moradas*/
historicOrderController.searchOrder = function(req, res) {}

/* Página que cria uma nova morada (limite de moradas é 5) */
historicOrderController.showOrder = function(req, res) {}


module.exports = historicOrderController;