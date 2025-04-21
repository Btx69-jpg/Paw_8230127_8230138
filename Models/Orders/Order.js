var mongoose = require('mongoose');

//Models
var Item = require('./Item'); 
var FaturaRestaurant = require("./FaturaRestaurant");
var FaturaUser = require("./FaturaCliente");

var OrderSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
        min: [Date.now, 'A data não pode ser no passado'],
    },
    client: {
        type: FaturaUser.schema,
        required: true,
    },
    restaurant: {
        type: FaturaRestaurant.schema,
        required: true,  
    },
    addressOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AddressOrder',
        required: true,
    },
    itens: {
        type: [Item.schema],
        required: true,
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'O valor mínimo da encomenda deve ser 0'],
        required: true,
    },
    status: {
        type: String,
        enum: ['Pendente', 'Expedida', 'Entregue'],
        default: 'Expedida',
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);