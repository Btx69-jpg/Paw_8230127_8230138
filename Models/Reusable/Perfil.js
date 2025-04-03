var mongoose = require('mongoose');
var Order = require("../Orders/Order");

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
        minlength: [8, 'A password deve ter no mínimo 8 caracteres'],
        maxlength: [100, 'A password deve ter no máximo 35 caracteres'],
        required: true,
    },
    countOrders: {
        type: Number,
        default: 0,
        min: [0, 'O valor minimo do contador é 0'],
        required: true,
    },
    historicOrders: {
        type: [Order.schema],
        default: [], 
//        required: true,
    },
    priority: {
         // ✅ Alterado para String
        enum: ['Cliente', 'Admin'],  // ✅ Agora a enumeração está correta
        default: 'Cliente',
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Perfil', PerfilSchema);
