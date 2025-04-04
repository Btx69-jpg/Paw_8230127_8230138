/**
 * Importante ver se o retaurante vai ter apenas um menu ou varios
 * Aproveitar e ver se o carrinho vai ter pratos ou menus
 */
var mongoose = require('mongoose');
var Address = require("../Reusable/Address");
var Perfil = require("../Reusable/Perfil");
var Comment = require("../Comments/Comment");
var Menu = require("../Menus/Menu");

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
    countMenus: {
        type: Number,
        default: 0,
        min: [0, 'O número mínimo de menus é 0'],
        required: true,
    },
    menus: {
        type: [Menu.schema],
        default: [], //Inicializa com o array vazio
        required: true,
    },
    countComments: {
        type: Number,
        default: 0,
        min: [0, 'O número mínimo de comentários é 0'],
        required: true,
    },
    comments: {
        type: [Comment.schema],
        default: [], //Inicializa com o array vazio
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);