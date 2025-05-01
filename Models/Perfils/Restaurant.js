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
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);