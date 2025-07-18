var mongoose = require('mongoose');
var Order = require("../Orders/Order");

var PerfilSchema = new mongoose.Schema({
    perfilPhoto: {
        type: String,
        default: "",
    },
    phoneNumber: {
        type: Number,
        min: [100000000, 'O telefone deve ter exatamente 9 dígitos'],
        max: [999999999, 'O telefone deve ter exatamente 9 dígitos'],
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
    orders: {
        type: [Order.schema],
        default: [], 
    },
    historicOrders: {
        type: [Order.schema],
        default: [], 
    },
    priority: {
        type: String,
        enum: ['Cliente', 'Admin', 'Restaurant', 'Dono', 'Funcionario'],
        required: true,
    },
    restaurantIds: {
        type: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Restaurant',
            },
        ],
        default: undefined,
        //Função que mete como required caso o tipo seja dono. Se não, não é obrigatorio
        required: function() {
            return this.priority === 'Dono';
        },
    },
    ownersIds: {
        type: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
        ],
        default: undefined,
        //Função que mete como required caso o tipo seja restaurant. Se não, não é obrigatorio
        required: function() {
            return this.priority === 'Restaurant';
        },
    },
    banned: {
        type: Boolean,
        default: false,
        required: true,
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Perfil', PerfilSchema);
