var mongoose = require('mongoose');
var Address = require("../Address");
var Perfil = require("./Perfil");
var Comment = require("../Comment");
var Menu = require("../Menus/Menu");
var Order = require("../Orders/Order");

var RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [100, 'O nome deve ter no máximo 100 caracteres'],
        required: true,
    },
    perfil: {
        type: Perfil.schema,
        required: true,
    },
    sigla: {
        type: String,
        maxlength: [10, 'A sigla deve ter no máximo 10 caracteres'],
    },
    nif: {
        type: Number,
        match: [/^[0-9]{9}$/],
        required: true,
    },
    address: {
        type: Address.schema,
        required: true,
    },
    description: {
        type: String,
        maxlength: [500, 'A descrição deve ter no máximo 500 caracteres'],
    },
    menus: {
        type: [Menu.schema],
        default: [], //Inicializa com o array vazio
        required: true,
    },
    comments: {
        type: [Comment.schema],
        default: [], //Inicializa com o array vazio
    },
    aprove: {
        type: Boolean,
        default: false,
        required: true,
    },
    tempUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    maxOrdersPerClient: {
        type: Number,
        min: [1, 'A codeção tem de ter um tempo minimo de 0 minutos'],
        default: 1,
        required: true,
    },
    maximumRadiusDelivery: {
        type: Number,
        min: [0.0, 'O raio mínimo de entrega é 0 km'],
        default: 0.0,
        required: true
    },
    timeConfection: {
        type: Number,
        min: [0, 'A codeção tem de ter um tempo minimo de 0 minutos'],
        default: 0,
        required: true,
    },
    timeDelivery: {
        type: Number,
        min: [0, 'A entrega tem de ter um tempo minimo de 0 minutos'],
        default: 0,
        required: true,
    },
    openingTime: {
        type: Number,        
        required: true,
        min: [0, 'A hora mínima é 00:00:00'],
        max: [86400, 'A hora máxima é 24:00:00']
    },
    closingTime: {
        type: Number,             
        required: true,
        min: [0, 'A hora mínima é 00:00:00'],
        max: [86400, 'A hora máxima é 24:00:00']
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);