var mongoose = require("mongoose");
var checkOutController = {};

const Restaurant = require("../Models/Perfils/Restaurant");
const User = require("../Models/Perfils/User");

//Stripe
const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(SECRET_KEY);

//Funções
const { verificarDistancia } = require("./Functions/APImoradas");

checkOutController.validateDistance = async function(req, res) {
  try {
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
    console.log("Calculo da distancia")
    const { addressRet, addressClient, distanceKm} = req.body;

    const resultado = await verificarDistancia(addressRet, addressClient, distanceKm);

    if (!resultado.dentroDoLimite) {
      return res.status(400).json({ dentroDoLimite: false, distanciaKm: -1, error: resultado.error });
    }

    console.log("Distancia Calculada calculada: ", resultado.distanciaKm);

    return res.status(200).json({
      dentroDoLimite: resultado.dentroDoLimite,
      distanciaKm: resultado.distanciaKm
    });
  } catch(error) {
    console.error("Erro no validateDistance:", error);
    return res.status(500).json({ sucesso: false, error: 'Erro interno no servidor.' });
  }  
}

checkOutController.stripeCheckoutSession = async function(req, res) {
  try {
    const userId = req.body;
  
    if (!userId || !userId.userId) {
      return res.status(400).json({ error: 'ID do utilizador é obrigatório' });
    }
    
    let user;
    try {
      user = await User.findById(userId.userId).exec();
      if (!user) {
        return res.status(404).json({ error: "Utilizador não encontrado" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: error });
    }

    const products = user.cart.itens; 

    // Buscar restaurante corretamente usando await
    let restaurant;
    try {
      restaurant = await Restaurant.findById(products[0].from).exec();
      
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurante não encontrado" });
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      return res.status(500).json({ error: error });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Lista de produtos é obrigatória' });
    }

    const lineItems = products.map(product => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: product.item,
          images: [product.image],
          metadata: {
            itemId: product._id.toString(),
            portion: product.portion || '',
          },
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 
      'sepa_debit', 
      'ideal', 
      'bancontact', 
      'klarna',
      'multibanco', 
      'paypal'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `http://localhost:4200/checkOut/${req.body.userId}/delivery?payment=success`,
      cancel_url: `http://localhost:4200/checkOut/${req.body.userId}`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Erro na criação da sessão Stripe:', error);
    res.status(500).json({ error: 'Erro ao criar sessão Stripe' });
  }
};

module.exports = checkOutController;