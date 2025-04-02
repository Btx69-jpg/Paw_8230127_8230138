var mongoose = require('mongoose');
var User = require('../Perfils/User'); //Pratos do menu

var UsersSchema = new mongoose.Schema({
    countUsers: {
        type: Number,
        default: 1,
        min: [1, 'O minimo de pratos são 1'],
        max: [10, 'O máximo de pratos do menu são 10'],
        required: true,
    },
    users: { 
        type: [User.schema], 
        default: [], 
        required: true,
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Users', UsersSchema);