var mongoose = require("mongoose");

var commentController = {};

//Models
const Restaurant = require("../../Models/Perfils/Restaurant");

//metodo para renderizar a pagina dos comentarios
commentController.homePage = function(req, res) {
    const restName = req.params.restaurant;

    Restaurant.findOne({ name: restName}).exec()
    .then(rest => {
        if (!rest) {
            return res.status(404).redirect(res.locals.previousPage);
        }

        if (!rest.perfil.historicOrders && rest.perfil.historicOrders.length === 0) {
            console.log("Restaurante ainda sem encomendas para ser comentado");
            return res.status(404).redirect(res.locals.previousPage);
        }

        const historicOrder = rest.perfil.historicOrders;
        let comments = [];

        for (let i = 0; i < historicOrder.length; i++) {
            const order = historicOrder[i];
            if (order.comment) {
                comments.push(order);
            }
        }

        if (comments.length === 0) {
            console.log("Restaurante ainda sem comentários");
            return res.status(404).redirect(res.locals.previousPage);
        }

        return res.status(200).render("restaurants/restaurant/HomePage/avaliationPage", { orders: order });
    })
    .catch(error => {
        res.status(500).render("errors/error", {numError: 500, error: error});
    })
};

module.exports = commentController;