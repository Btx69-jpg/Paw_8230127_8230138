var mongoose = require('mongoose');

//Models
var Item = require('./Item'); 
var FaturaRestaurant = require("./FaturaRestaurant");
var FaturaUser = require("./FaturaCliente");
var AddressOrder = require("./AddressOrder");

var OrderSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    client: {
        type: FaturaUser.schema,
    //    required: true,
    },
    restaurant: {
        type: FaturaRestaurant.schema,
    //    required: true,  
    },
    addressOrder: {
        type: AddressOrder.schema,
    //    required: true,
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
        default: 'Pendente',
        required: true,
    },
    type: {
        type: String,
        enum: ['delivery', 'pickup'],
    //    required: true,
    },
     notified: { type: Boolean, default: false },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);