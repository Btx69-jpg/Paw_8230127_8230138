var mongoose = require('mongoose');
var ShoppingCart = require("../Orders/ShoppingCart");

var PerfilSchema = new mongoose.Schema({
    perfilPhoto: {
        type: String,
    },
    email:{
        type: String,
        match: [/^([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})*$/, 'Formato inválido para o email'], //Garante o formato correto do email
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    countOrders: {
        type: Number,
        default: 0,
        min: [0, 'O valor minimo do contador é 0'],
        required: true,
    },
    historicOrders: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'ShoppingCart',
        default: [], 
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Perfil', PerfilSchema);
