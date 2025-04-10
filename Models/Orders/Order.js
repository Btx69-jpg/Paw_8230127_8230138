var mongoose = require('mongoose');
var Item = require('./Item'); 

var OrderSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [50, 'O nome deve ter no máximo 50 caracteres'],
        match: [/^[a-zA-Z\s]*$/, 'Formato inválido para o nome'],
        required: true,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true,
    },
    addressOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AddressOrder',
        required: true,
    },
    countItems: {
        type: Number,
        default: 1,
        min: [1, 'A Encomenda, necessita no minimo de 0 order'] //Ver se era melhor meter um já que o outro campo é obrigatorio
    },
    itens: {
        type: [Item.schema],
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        min: [Date.now, 'A data não pode ser no passado'],
        max: [Date.now, 'A data não pode ser no futuro'],
    },
    totEncomenda: {
        type: Number,
        default: 0,
        min: [0, 'O valor mínimo da encomenda deve ser 0'],
        required: true,
    },
    statu: {
        type: String,
        enum: ['Expedida', 'Entregue'],
        default: 'Expedida',
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);