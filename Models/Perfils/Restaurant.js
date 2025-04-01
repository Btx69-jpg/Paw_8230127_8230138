/**
 * Importante ver se o retaurante vai ter apenas um menu ou varios
 * Aproveitar e ver se o carrinho vai ter pratos ou menus
 */
var mongoose = require('mongoose');
var Address = require("../Reusable/Address");
var Perfil = require("../Reusable/Perfil");

//Permite incorporar estes dois tipos de documentos dentro do restaurante
var AddressSchema = Address.schema;
var PerfilSchema = Perfil.schema;

var RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [100, 'O nome deve ter no máximo 100 caracteres'],
        required: true,
    },
    perfil: {
        type: PerfilSchema,
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
    phoneNumber: {
        type: Number,
        match: [/^[0-9]{9}$/],
        required: true,
    },
    address: {
        type: AddressSchema,
        required: true,
    },
    description: {
        type: String,
        maxlength: [500, 'A descrição deve ter no máximo 500 caracteres'],
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);