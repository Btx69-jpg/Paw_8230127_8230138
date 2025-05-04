var mongoose = require('mongoose');

var NutrientSchema = require('./Nutrient'); //Pratos do menu

var DishSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [50, 'O título deve ter no máximo 50 caracteres'],
        match: [/^[\p{L}\s]+$/u, 'Formato inválido para o nome'], //Garante que o nome só tem letras, com acentos ou não, e espaços
        required: true,
    },
    description: {
        type: String,
        maxlength: [250, 'A descrição deve ter no máximo 200 caracteres'],
        required: true,
    },
    category: {
        type: String,
        maxlength: [50, 'O nome deve ter no máximo 50 caracteres'],
        match: [/^[\p{L}\s]+$/u, 'Formato inválido para o nome'], //Garante que o nome só tem letras, com acentos ou não, e espaços
        default: "",
        required: true,
    },
    portions: [{
        portion: { type: mongoose.Schema.Types.ObjectId, ref: 'Portion' },
        price: {
            type: Number,
            required: true
        }
    }],
    photo: {
        type: String,
        default: "",
    },
    nutritionalInfo: [ NutrientSchema.schema ],
    totalNutritionalInfo: {
        type: NutrientSchema.schema,
        default: {}
    },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Dish', DishSchema);