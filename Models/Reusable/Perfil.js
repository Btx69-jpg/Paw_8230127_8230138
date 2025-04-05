var mongoose = require('mongoose');
var Order = require("../Orders/Order");

var PerfilSchema = new mongoose.Schema({
    perfilPhoto: {
        type: String,
        default: "",
    },
    phoneNumber: {
        type: Number,
        match: [/^[0-9]{9}$/],
        required: true,
    },
    email:{
        type: String,
        match: [/^([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})*$/, 'Formato inválido para o email'], //Garante o formato correto do email
        maxlength: 50,
        required: true,
    },
    password: {
        type: String,
        minlength: [8, 'A password deve ter no mínimo 8 caracteres'],
        required: true,
    },
    historicOrders: {
        type: [Order.schema],
        default: [], 
    },
    priority: {
        type: String,
        enum: ['Cliente', 'Admin', 'Restaurant'],
        required: true,
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Perfil', PerfilSchema);
