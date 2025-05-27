var mongoose = require("mongoose");
var checkOutController = {};

//Stripe
const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(SECRET_KEY);

//Isto é um exemplo depois adaptar para o meu codigo
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

/**
 * !Esta forma recebe varios produtos para mandar
 * 
 */

/*
checkOutController.stripeCheckoutSession = async function(req, res) {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Lista de produtos é obrigatória' });
    }

    const lineItems = products.map(product => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: product.name,
        },
        unit_amount: Math.round(product.price * 100), // € -> centavos
      },
      quantity: product.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'google_pay', 'apple_pay'], // ✅ Define aqui os métodos permitidos
      mode: 'payment',
      line_items: lineItems,
      success_url: 'http://localhost:4200/success',
      cancel_url: 'http://localhost:4200/cancel',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Erro na criação da sessão Stripe:', error);
    res.status(500).json({ error: 'Erro ao criar sessão Stripe' });
  }
};
*/

module.exports = checkOutController;