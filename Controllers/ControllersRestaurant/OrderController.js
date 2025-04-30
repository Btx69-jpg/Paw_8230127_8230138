var mongoose = require("mongoose");

//Models
var Restaurant = require("../../Models/Perfils/Restaurant");
var User = require("../../Models/Perfils/User");
var Address = require("../../Models/Address");
var AddressOrder = require("../../Models/Orders/AddressOrder");
var Item = require("../../Models/Orders/Item");
var Order = require("../../Models/Orders/Order");
var FaturaCliente = require("../../Models/Orders/FaturaCliente");
var FaturaRestaurant = require("../../Models/Orders/FaturaRestaurant");
//Function
const {carregarPortions} = require("../Functions/portions");

var orderController = {};

// GET /restaurants/:restaurant/orderManagement
orderController.addOrder = function(req, res) {
    Restaurant.findOne({ name: req.params.restaurant }).exec()
        .then(async restaurant => {
            if(restaurant) {

                const portions = await carregarPortions();
                res.render("restaurants/restaurant/Order/addOrder", { restaurant: restaurant, portions: portions});
            } else {
                console.log("O restaurante não existe");
                res.render(res.locals.previousPage);
            }
        })
        .catch(error => {
            res.status(500).render("errors/error", {numError: 500, error: error});
        })
};

async function validateCampo(firstName, lastName, phoneNumber, email, street, postal_code, city, itens, totEncomenda) {
    console.log(firstName, lastName, phoneNumber, email, street, postal_code, city, itens, totEncomenda);
    if (!firstName || !lastName || !phoneNumber || !email || !street || !postal_code || !city 
        || !itens || !totEncomenda) {
            return "Falta preencher algum campo obrigatório";
    }

    if (totEncomenda <= 0) {
        return "A encomenda deve ter um valor possitivo";
    }

    let i = 0; 
    let foundError = false;
    
    while (i < itens.length && !foundError) {
        if (!itens[i] || !itens[i].item || !itens[i].portion || itens[i].price <= 0 
            || itens[i].quantity <= 0 || itens.quantity > 10) {
                foundError = true;
        }
        i++;
    }

    if (foundError) {
        return "Alguns dos campos de preenchimento obrigatorio de um item está por preencher ou mkal preenchido"
    }

    return "";
}

/*
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
*/

//Por acabar falta criar a encomenda e associar ao restuarante e ao utilizador, caso ele exista
orderController.saveOrder = async function(req, res) {
    try {
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log("-------------------------------");
        console.log("Save Order")

        const nameRest = req.params.restaurant;
        let restaurant = await Restaurant.findOne({ name: nameRest }).exec();
        if (!restaurant) {
            console.log("O restaurante não exsite");
            res.status(404).redirect(res.locals.previousPage);
        }

        const {orderType, firstName, lastName, phoneNumber, nif, email, street, postal_code, city, totEncomenda} = req.body;

        //Cria o array de itens
        const rawItems = req.body.item || {};

        const itens = rawItems.map(i => ({
            item: i.item, 
            portion: i.portion,               
            price: parseFloat(i.price),
            quantity: parseInt(i.quantity, 10)
        }));
        console.log(itens);

        const validCampo = await validateCampo(firstName, lastName, phoneNumber, email, street, postal_code, city, itens, totEncomenda);
        if (validCampo !== "") {
            //Depois meter para carregar os campos todos
            console.log("Error: ", validCampo);
            return res.status(302).redirect(`/restaurants/${nameRest}/orders`);
        }

        //Procurar se o utilizador existe.
        let user = await User.findOne({ firstName: firstName, lastName: lastName, 'perfil.email': email, 'perfil.phoneNumber': phoneNumber}).exec();
        console.log(user);
        let faturaCliente;

        if (user) {
            faturaCliente = new FaturaCliente({
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
                email: email
            });
        } else {
            faturaCliente = new FaturaCliente({
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
                email: email
            });
        };
        console.log(FaturaCliente);

        const faturaRestaurant = new FaturaRestaurant({
            name: nameRest,
            phoneNumber: restaurant.perfil.phoneNumber,
            email: restaurant.perfil.email,
        });
        console.log(faturaRestaurant);

        const address = new Address({
            street: street,
            postal_code: postal_code,
            city: city,
        })

        const addressOrder = new AddressOrder({
            address: address,
        })

        if (nif) {
            AddressOrder.nif = nif;
        }

        console.log(addressOrder);
        //Ver se funciona sem a data e o status.
        const order = new Order({
            client: faturaCliente,
            restaurant: faturaRestaurant,
            addressOrder: addressOrder,
            itens: itens,
            price: totEncomenda,
            type: orderType,
        });

        if (user) {
            if (!user.perfil.orders) {
                user.perfil.orders = [];
            }

            /* Validar se a order já não existe no Array
            let i = 0;
            let found = false;
            while (i < user.perfil.orders && !found) {
                const orderAt = user.perfil.orders[i];
                if(orderAt.date !== order.date || orderAt.FaturaCliente)
                i++;
            }
            */
            user.perfil.orders.push(order);
            await user.save();
        }

        if (!restaurant.perfil.orders) {
            restaurant.perfil.orders = [];
        }

        restaurant.perfil.orders.push(order);
        await restaurant.save();
        console.log("Encomenda criada com sucesso");

        res.redirect(`/restaurants/${req.params.restaurant}/orders`);
    } catch(error) {
        console.log("Error: ", error);
        res.status(302).redirect(`/restaurants/${req.params.restaurant}/orders`);
    }     
};

orderController.orderManagment = function(req, res) {
    Restaurant.findOne({ name: req.params.restaurant }).exec()
        .then(restaurant => {
            if(restaurant) {
                res.render("restaurants/restaurant/Order/orderManagement", { restaurant: restaurant, filters: {}});
            } else {
                console.log("O restaurante não existe");
                res.render(res.locals.previousPage);
            }
        })
        .catch(error => {
            res.status(500).render("errors/error", {numError: 500, error: error});
        })
  
    // Separa por status
    /*
    const pendentes = restaurant.orders.filter(o => o.status === 'Pendente');
    const expedidas = restaurant.orders.filter(o => o.status === 'Expedida');
    const entregues = restaurant.orders.filter(o => o.status === 'Entregue');
    */
};

orderController.historicOrder = async function(req, res) {
    try {
        let account = null;
        const priority = req.cookies.priority;

        if(priority === "Restaurant") {
            account = await Restaurant.findOne( {name: req.params.restaurant}).exec();
        }

        if(!account) {
            return res.status(500).render("errors/error", {numError: 500, error: "Conta não encontrada"});
        }

        const maxData = new Date().toISOString().split("T")[0];

        res.render("perfil/orders/historicOrder", {account: account, historic: account.perfil.historicOrders, maxData: maxData, filters: {}});
    } catch (error) {
        console.log("Erro: ", error);
        res.redirect(res.locals.previousPage);
    }
}

orderController.showOrder = function(req, res) {
    Restaurant.findOne( {name: req.params.restaurant}).exec()
        .then(rest => {
            if(rest) {
                let found = false
                let i = 0;
                let orderId = req.params.orderId;
                
                while(i < rest.perfil.historicOrders && !found) {
                    if(rest.perfil.historicOrders[i] == orderId) {
                        found = true;
                    } else {
                        i++;
                    }
                }

                if (!found) {
                    console.log("Não foi encontrado nenhuma order");
                    res.redirect(res.locals.previousPage); 
                }

                res.render("perfil/orders/showOrder", {order: rest.perfil.historicOrders[i], priority: req.cookies.priority});
            } else {
                console.log("Não foi encontrado nenhum restaurante");
                res.redirect(res.locals.previousPage);
            }
        })
        .carch(error => {
            console.log("Erro: ", error);
            res.redirect(res.locals.previousPage);
        })
}

// GET /:restaurant/orders
orderController.getOrders = async function(req, res) {
    try {
      const restaurant = await Restaurant.findOne({ name: req.params.restaurant }).exec();
      return res.json(restaurant.orders);
    } catch (err) {
      return res.status(500).render("errors/error", {numError: 500 , error: err.message});
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