var mongoose = require('mongoose');

var FaturaRestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [100, 'O nome deve ter no máximo 100 caracteres'],
        required: true,
    },
    phoneNumber: {
        type: Number,
        match: [/^[0-9]{9}$/],
        required: true,
    },
    email:{
        type: String,
        match: [/^([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})*$/, 'Formato inválido para o email'],
        maxlength: 50,
        required: true,
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FaturaRestaurant', FaturaRestaurantSchema);