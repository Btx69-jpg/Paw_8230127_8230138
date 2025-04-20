
var mongoose = require('mongoose');

const NutrientSchema = new mongoose.Schema({
    name:    { type: String, required: true },      
    per100g: {                                   
      calories:   { type: Number, default: 0 },
      protein:    { type: Number, default: 0 },
      fat:        { type: Number, default: 0 },
      carbohydrates: { type: Number, default: 0 },
      sugars:     { type: Number, default: 0 },
    }
  });
  
  module.exports = mongoose.model('Nutrient', NutrientSchema);