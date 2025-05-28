var mongoose = require("mongoose");
var checkOutController = {};

const Restaurant = require("../Models/Perfils/Restaurant");
const User = require("../Models/Perfils/User");
//Stripe
const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(SECRET_KEY);

//Isto é um exemplo depois adaptar para o meu codigo
/*
checkOutController.stripeCheckoutSession = async function(req, res) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 
      'sepa_debit', 
      'ideal', 
      'bancontact', 
      'klarna',
      'multibanco', 
      'paypal'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
              name: 'Produto Exemplo',
          },
          unit_amount: 5000, 
          },
        quantity: 1,
      },],
      success_url: `http://localhost:4200/perfil/user/${req.body.userId}/orders?payment=success`,
      cancel_url: `http://localhost:4200/checkOut/${req.body.userId}`,
  });

  res.json({ id: session.id });
}
*/
/**
 * !Esta forma recebe varios produtos para mandar
 * 
 */


checkOutController.stripeCheckoutSession = async function(req, res) {
  try {
    const userId = req.body;
    console.log("\n\n\n\n\n\nID do utilizador recebido:", userId, "\n\n\n\n\n");
  
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