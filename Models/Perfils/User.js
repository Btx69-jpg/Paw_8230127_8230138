var mongoose = require('mongoose');
var AddressOrder = require("../Orders/AddressOrder");
var Perfil = require("./Perfil");
const Order = require('../Orders/Order');

var UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        max: [50, 'O primeiro nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], 
        required: true,
    },
    lastName: {
        type: String,
        max: [50, 'O ultimo nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'], 
        required: true,
    },  
    perfil: {
        type: Perfil.schema,
        required: true,
    },
    addresses: {
        type: [AddressOrder.schema],
        default: [],
    },  
    cart: {
        type: Order.schema,
        default: {}, 
    },
    birthdate: {
        type: Date,
        min: ['1900-01-01', 'A data mínima é 1900-01-01'],
        max: [new Date(), 'A data máxima é a data atual'],
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);