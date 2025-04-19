var express = require('express');
var router = express.Router({ mergeParams: true }); //Penso ser necessario, se der sem retirar
const mongoose = require('mongoose');

const comment = require("../../Controllers/ControllersRestaurant/CommentsController")

router.get("/", comment.homePage);

module.exports = router;
