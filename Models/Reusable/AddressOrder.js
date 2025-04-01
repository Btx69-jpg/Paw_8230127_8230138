var mongoose = require('mongoose');
var Address = require("./Address");

var AddressSchema = Address.schema;

var AddressOrderSchema = new mongoose.Schema({
    address: {
        type: AddressSchema,
        required: true,
    },
    nif: {
        type: Number,
        match: [/^[0-9]{9}$/, 'O Nif deve conter exatamente 9 caracteres']
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AddressOrder', AddressOrderSchema);