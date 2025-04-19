var mongoose = require("mongoose");

//Models
const Restaurant = require("../../Models/Perfils/Restaurant");
const Order = require("../../Models/Orders/Order");

var orderController = {};


// GET /restaurants/:restaurant/orderManagement
orderController.orderManagement = async function(req, res) {
    const restaurant = await Restaurant.findOne({ name: req.params.restaurant })
      .populate('orders.client orders.addressOrder')
      .exec();
  
    // Separa por status
    const pendentes = restaurant.orders.filter(o => o.status === 'Pendente');
    const expedidas = restaurant.orders.filter(o => o.status === 'Expedida');
    const entregues = restaurant.orders.filter(o => o.status === 'Entregue');
  
    res.render("restaurants/restaurant/orderManagement", {
      restaurant, pendentes, expedidas, entregues
    });
};
  
// GET /:restaurant/orders
orderController.getOrders = async function(req, res) {
    try {
      const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
      return res.json(restaurant.orders);
    } catch (err) {
      return res.status(500).render("errors/error", {numError: 500 , error: err.message});
    }
};
  
// POST /:restaurant/orders
orderController.createOrder = async function(req, res) {
    try {
        const { client, addressOrder, itens, totEncomenda } = req.body;
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();

        const newOrder = {
            client,
            addressOrder,
            itens,       
            totEncomenda,
            status: 'Pendente'
        };

        restaurant.orders.push(newOrder);
        await restaurant.save();
        // devolve a encomenda com o _id atribuído pelo Mongo
        const created = restaurant.orders[ restaurant.orders.length - 1 ];
        return res.status(201).json(created);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
  
// PUT /:restaurant/orders/:orderId/status
orderController.updateOrderStatus = async function(req, res) {
    try {
        const { status } = req.body;
        const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
        const order = restaurant.orders.id(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Encomenda não encontrada' }); 
        }

        order.status = status;
        await restaurant.save();
        return res.json(order);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

module.exports = orderController;