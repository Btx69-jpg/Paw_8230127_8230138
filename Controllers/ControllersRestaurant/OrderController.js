var mongoose = require("mongoose");

//Models
var Restaurant = require("../../Models/Perfils/Restaurant");
var User = require("../../Models/Perfils/User");
var Address = require("../../Models/Address");
var AddressOrder = require("../../Models/Orders/AddressOrder");
var Order = require("../../Models/Orders/Order");
var FaturaCliente = require("../../Models/Orders/FaturaCliente");
var FaturaRestaurant = require("../../Models/Orders/FaturaRestaurant");

//Function
const {carregarPortions} = require("../Functions/portions");
const {duplicateOrder} = require("./functions/DuplicateOrder");
var orderController = {};

orderController.addOrder = function(req, res) {
    Restaurant.findOne({ name: req.params.restaurant }).exec()
        .then(async restaurant => {
            if(!restaurant) {
                console.log("O restaurante não existe");
                res.render(res.locals.previousPage);
            }

            const portions = await carregarPortions();
            res.render("restaurants/restaurant/Order/addOrder", { restaurant: restaurant, portions: portions});
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
  
//Metodo que cria uma nova encomenda
orderController.saveOrder = async function(req, res) {
    try {
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

        const validCampo = await validateCampo(firstName, lastName, phoneNumber, email, street, postal_code, city, itens, totEncomenda);
        if (validCampo !== "") {
            //Depois meter para carregar os campos todos
            console.log("Error: ", validCampo);
            return res.status(302).redirect(`/restaurants/${nameRest}/orders`);
        }

        //Procurar se o utilizador existe.
        let user = await User.findOne({ firstName: firstName, lastName: lastName, 'perfil.email': email, 'perfil.phoneNumber': phoneNumber}).exec();
        if(user && user.bannedOrder === true) {
            console.log("O utilizador está banido");
            return res.status(302).redirect(`/restaurants/${nameRest}/orders`);
        }

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

        const faturaRestaurant = new FaturaRestaurant({
            name: nameRest,
            phoneNumber: restaurant.perfil.phoneNumber,
            email: restaurant.perfil.email,
        });

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

        //Ver se funciona sem a data e o status.
        const order = new Order({
            client: faturaCliente,
            restaurant: faturaRestaurant,
            addressOrder: addressOrder,
            itens: itens,
            price: totEncomenda,
            type: orderType,
        });

        const findOrderRest = duplicateOrder(restaurant.perfil.orders, order);
        if (findOrderRest) {
            console.log("A encomenda já existe!");
            return res.status(302).redirect(`/restaurants/${nameRest}/orders`);
        }

        if (user) {
            if (!user.perfil.orders) {
                user.perfil.orders = [];
            }

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
    const nameRest = req.params.restaurant;
    Restaurant.findOne({ name: nameRest }).exec()
        .then(restaurant => {
            if (!restaurant || (!restaurant.perfil.orders || restaurant.perfil.orders.length === 0)) {
                console.log("O restaurante não tem encomendas ou não existe");
                return res.status(400).redirect(res.locals.previousPage);
            } 
            
            const orders = restaurant.perfil.orders;
            res.render("restaurants/restaurant/Order/orderManagement", { restaurant: restaurant, orders: orders, filters: {}});
        })
        .catch(error => {
            res.status(500).render("errors/error", {numError: 500, error: error});
        })
};

async function findUserOrder(orderId) {
    return await User.findOne({ 'perfil.orders._id': orderId}).exec();
}

function findOrder(orders, orderId) {
    let found = false;
    let i = 0;

    while(i < orders.length && !found) {
        if(orders[i]._id.toString() === orderId.toString()) {
            found = true;
        } else {
            i++;
        }
    }

    if (!found) {
        i = -1;
    }

    return i;
}

function validateRestaruante(restaurant) {
    let error = "";
   
    if (!restaurant || !restaurant.perfil || !restaurant.perfil.orders) {
        error = "O restaurante não existe ou não tem encomendas";
    } 

    return error;
}

orderController.updateOrderStatus = async function(req, res) {
    try {
        const nameRest = req.params.restaurant;
        let restaurant = await Restaurant.findOne({ name: nameRest }).exec(); 
        const validation = validateRestaruante(restaurant);
        if (validation !== "") {
            console.log(validation);
            return res.status(404).redirect(res.locals.previousPage);
        }

        const orderId = req.params.orderId;
        const restPosOrder = findOrder(restaurant.perfil.orders, orderId);
        if (restPosOrder === -1) {
            console.log("A encomenda não existe");
            return res.status(404).redirect(res.locals.previousPage);
        }

        if (restaurant.perfil.orders[restPosOrder].status === "Entregue") {
            console.log("A encomenda já foi entregue");
            return res.status(404).redirect(res.locals.previousPage);
        }

        const status = req.body.status;

        if(!status) {
            console.log("O status não foi definido");
            return res.status(400).redirect(res.locals.previousPage);
        }

        if(restaurant.perfil.orders[restPosOrder].status === status) {
            console.log("A encomenda já tem o status que está a tentar atribuir");
            return res.status(400).redirect(res.locals.previousPage);
        }

        console.log("Status: ", status);
        const orderUpdate = req.params.orderId;
        let user = await findUserOrder(orderId);
        
        if (status === "Entregue") {
            if (!restaurant.perfil.historicOrders) {
                restaurant.perfil.historicOrders = [];
            }
            restaurant.perfil.orders[restPosOrder].status = status;
            restaurant.perfil.historicOrders.push(restaurant.perfil.orders[restPosOrder]);
            restaurant.perfil.orders.splice(restPosOrder, 1);
            await restaurant.save();

            if (user) {
                const userPosOrder = findOrder(user.perfil.orders, orderUpdate);
                if (userPosOrder !== -1) {
                    if (!user.perfil.historicOrders) {
                        user.perfil.historicOrders = [];
                    }
                    user.perfil.orders[userPosOrder].status = status;
                    user.perfil.historicOrders.push(user.perfil.orders[userPosOrder]);
                    user.perfil.orders.splice(userPosOrder, 1);
                    await user.save();
                } else {
                    console.log("A encomenda não existe no utilizador");
                    return res.status(404).redirect(res.locals.previousPage);
                }
            }
        } else {
            restaurant.perfil.orders[restPosOrder].status = status;
            await restaurant.save();

            if(user) {
                const userPosOrder = findOrder(user.perfil.orders, orderUpdate);
                user.perfil.orders[userPosOrder].status = status;
                await user.save();
            }
        }

        if (restaurant.perfil.orders.length > 0) {
            return res.redirect(res.locals.previousPage);
        }

        const portions = await carregarPortions();
        res.render("restaurants/restaurant/Order/addOrder", { restaurant: restaurant, portions: portions}); 
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).render("errors/error", {numError: 500, error: error});
    }
}

orderController.deleteOrder = async function(req, res) {
    try {
        const nameRest = req.params.restaurant;
        let restaurant = await Restaurant.findOne({ name: nameRest }).exec();
        
        let validation = validateRestaruante(restaurant);
        if (validation !== "") {
            console.log(validation);
            return res.status(404).redirect(res.locals.previousPage);
        }

        const orderDel = req.params.orderId;
        const posOrderDeleteRest = findOrder(restaurant.perfil.orders, orderDel);
        
        if (posOrderDeleteRest === -1) {
            console.log("A encomenda a eliminar não existe!");
            return res.status(302).redirect(res.locals.previousPage);
        }

        //* Procurar se o user existe, para se sim eliminar-lhe a encomenda.
        let user = await findUserOrder(orderDel);
        
        if(!user) {
            const portions = await carregarPortions();
            return res.render("restaurants/restaurant/Order/addOrder", { restaurant: restaurant, portions: portions});
        }
        
        if(!user.perfil || !user.perfil.orders) {
            console.log("O utilizador não tem encomendas");
            return res.status(404).redirect(res.locals.previousPage);
        }

        const posOrderDeleteUser = findOrder(user.perfil.orders, orderDel);
        if (posOrderDeleteUser === -1) {
            console.log("A encomenda a eliminar não existe!");
            return res.status(302).redirect(res.locals.previousPage);
        }

        restaurant.perfil.orders.splice(posOrderDeleteRest, 1);
        await restaurant.save();

        user.perfil.orders.splice(posOrderDeleteUser, 1);
        await user.save();

        if (restaurant.perfil.orders.length > 0) {
            return res.redirect(res.locals.previousPage);
        }

        const portions = await carregarPortions();
        res.render("restaurants/restaurant/Order/addOrder", { restaurant: restaurant, portions: portions});   
    } catch(error) {
        console.log("Error: ", error);
        res.status(500).redirect(res.locals.previousPage);
    }
}

orderController.historicOrder = async function(req, res) {
    try {
        const account = await Restaurant.findOne( {name: req.params.restaurant}).exec();

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
            if(!rest) {
                console.log("Não foi encontrado nenhum restaurante");
                return res.redirect(res.locals.previousPage);
            }

            let found = false
            let i = 0;
            let orderId = req.params.orderId;
            
            while (i < rest.perfil.historicOrders.length && !found) {
                if(rest.perfil.historicOrders[i]._id.toString() === orderId.toString()) {
                    found = true;
                } else {
                    i++;
                }
            }

            if (!found) {
                console.log("Não foi encontrado nenhuma order");
                return res.status(400).redirect(res.locals.previousPage); 
            }

            res.render("perfil/orders/showOrder", {order: rest.perfil.historicOrders[i], priority: req.cookies.priority});
        })
        .catch(error => {
            console.log("Erro: ", error);
            res.redirect(res.locals.previousPage);
        })
}

orderController.searchOrder = function(req, res) {
    Restaurant.findOne( {name: req.params.restaurant}).exec()
        .then(rest => {
            if(!rest) {
                console.log("Não foi encontrado nenhum restaurante");
                return res.stauts(404).redirect(res.locals.previousPage);
            }

            const status = req.query.status;
            const orders = rest?.perfil?.orders || [];

            const ordersFiltered = orders.filter(order => {
                if (status && (order.status !== status && status !== "all")) {
                    return false;
                }

                delete order.restaurant;
                return true;
            });

           res.render("restaurants/restaurant/Order/orderManagement", { restaurant: rest, orders: ordersFiltered, filters: { status: status }});
        })
        .catch(error => {
            console.log("Erro: ", error);
            res.status(500).redirect(res.locals.previousPage);
        })
}

module.exports = orderController;