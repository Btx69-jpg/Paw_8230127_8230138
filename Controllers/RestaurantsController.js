var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const pathR = require('path');

//Models
var Restaurant = require("../Models/Perfils/Restaurant");
var User = require("../Models/Perfils/User"); 
var Address = require("../Models/Address");
var Perfil = require("../Models/Perfils/Perfil");
var restaurantsController = {};

//Metodos
const { updatePackage, deletePackage } = require('./Functions/crudPackage');
const { deleteImage, saveImage, updateImage } = require("./Functions/crudImagesRest");
const { existsRestaurantsDesaprove } = require("./ControllersPerfil/ControllersAdmin/AprovacaoRestController");
const { validarMorada } = require("./Functions/APImoradas");

//Constantes
const totRestaurant = 15; 

function covertTimeToSeconds(time) {
    const parts = time.split(':').map(Number);
    const [hh, mm, ss = 0] = parts;
    return hh * 3600 + mm * 60 + ss;
}

async function validationRestaurant(name, nif, phoneNumber, email, password, confirmPassword, 
    street, postal_code, city, maxOrdersPerClient, maximumRadiusDelivery, timeConfection,
    timeDelivery, openingSeconds, closingSeconds) {
    
    const restaurants = await Restaurant.find({}).exec();
   
    if (restaurants.length >= totRestaurant) {
        return ["Não é possivel criar mais restaurantes"];
    }

    let problem = [];

    if (!name || !nif || !phoneNumber || !email || !password || !confirmPassword || 
        !street || !postal_code || !city || !maxOrdersPerClient || !maximumRadiusDelivery|| 
        !timeConfection || !timeDelivery) {
        problem.push("Alguns dos campos obrigatórios não está preenchido");
    }

    const validateMorada = await validarMorada(street, postal_code, city);
    if (!validateMorada.valido) {
        problem.push("A morada introduzida não exite");
    }

    if (openingSeconds < 0 || openingSeconds > 86400) {
        problem.push("O tempo de abertura tem de ser entre a 00:00:00 e as 23:59:59");
    }

    if (closingSeconds < 0 || closingSeconds > 86400) {
        problem.push("O tempo de abertura tem de ser entre a 00:00:00 e as 23:59:59");
    }

    if (password !== confirmPassword) { 
        problem.push("As passwords não coincidem");
    }

    if (maxOrdersPerClient < 1) {
        problem.push("O maximo de encomendas por cliente não pode ser inferior a 1");
    }

    if (maximumRadiusDelivery < 0.1) {
        problem.push("O maximo de raio de entrega não pode ser inferior a 100m (0,1)");
    }

    if (timeConfection < 0) {
        problem.push("O tempo de confessão não pode ser inferior ou igual a 0");
    }

    if (timeDelivery < 0) {
        problem.push("O tempo de entrega não pode ser inferior ou igual a 0");
    }

    if (openingSeconds > closingSeconds ) {
        problem.push("A hora de fecho tem de ser supeior há de abertura");
    }

    let find = false;
    let i = 0;
    
    // Verifica se já existe um restaurante com o mesmo nome, NIF, email ou número de telefone
    while (i < restaurants.length && !find) {
        if (restaurants[i].name === name) {
            problem.push("Já existe um restaurante com esse nome");
            find = true;
        } else if (restaurants[i].nif === nif) {
            problem.push("Já existe um restaurante com esse NIF");
            find = true;
        } else if (restaurants[i].perfil.email === email) {
            problem.push("Já existe um restaurante com esse email");
            find = true;
        } else if (restaurants[i].perfil.phoneNumber === phoneNumber) {
            problem.push("Já existe um restaurante com esse numero telefonico");
            find = true;
        }
        i++;
    }

    return problem;
}

async function validationEditRestaurant(name, nif, phoneNumber, email, 
    street, postal_code, city, maxOrdersPerClient, maximumRadiusDelivery, timeConfection,
    timeDelivery, openingSeconds, closingSeconds, restaurant) {
    
    let problem = [];
    
    if (!name || !nif || !phoneNumber || !email || !street || !postal_code || !city || 
        !maxOrdersPerClient || !maximumRadiusDelivery|| !timeConfection || !timeDelivery) {
        problem.push("Alguns dos campos obrigatórios não está preenchido");
    }

    if (openingSeconds < 0 || openingSeconds > 86400) {
        problem.push("O tempo de abertura tem de ser entre a 00:00:00 e as 23:59:59");
    }

    if (closingSeconds < 0 || closingSeconds > 86400) {
        problem.push("O tempo de abertura tem de ser entre a 00:00:00 e as 23:59:59");
    }

    if (maxOrdersPerClient < 1) {
        problem.push("O maximo de encomendas por cliente não pode ser inferior a 1");
    }

    if (maximumRadiusDelivery < 0.1) {
        problem.push("O maximo de raio de entrega não pode ser inferior a 100m (0,1)");
    }

    if (timeConfection < 0) {
        problem.push("O tempo de confessão não pode ser inferior ou igual a 0");
    }

    if (timeDelivery < 0) {
        problem.push("O tempo de entrega não pode ser inferior ou igual a 0");
    }

    if (openingSeconds > closingSeconds ) {
        problem.push("A hora de fecho tem de ser supeior há de abertura");
    }

    const validateMorada = await validarMorada(street, postal_code, city);
    if (!validateMorada.valido) {
        problem.push("A morada introduzida não exite");
    }

    let find = false;
    let i = 0;
    const restaurants = await Restaurant.find({}).exec();

    // Verifica se já existe um restaurante com o mesmo nome, NIF, email ou número de telefone
    while (i < restaurants.length && !find) {
        if (restaurant.name !== name && restaurants[i].name === name) {
            problem.push("Já existe um restaurante com esse nome");
            find = true;
        } else if (restaurant.nif !== nif && restaurants[i].nif === nif) {
            problem.push("Já existe um restaurante com esse NIF");
            find = true;
        } else if (restaurant.perfil.email !== email && restaurants[i].perfil.email === email) {
            problem.push("Já existe um restaurante com esse email");
            find = true;
        } else if (restaurant.perfil.phoneNumber !== phoneNumber && restaurants[i].perfil.phoneNumber === phoneNumber) {
            problem.push("Já existe um restaurante com esse numero telefonico");
            find = true;
        }
        i++;
    }

    return problem;
}

function getAutRemoveEdit(restaurants, user) {
    let autRemoveEdit = [];

    const ids = user.perfil.restaurantIds.map(_id => _id.toString());

    for (let j = 0; j < restaurants.length; j++) {
        const rId = restaurants[j]._id.toString();
        autRemoveEdit[j] = ids.includes(rId);
    }

    return autRemoveEdit;
}

restaurantsController.restaurantsPage = function(req, res) {
    Restaurant.find({ aprove: true}).exec()
        .then(restaurants => {
            let autRemoveEdit = [];

            if (req.cookies && req.cookies.priority && req.cookies.priority === "Dono") {
                autRemoveEdit = getAutRemoveEdit(restaurants, res.locals.user);
            }
                
            res.render("restaurants/restaurants", {restaurants: restaurants, filters: {}, autRemoveEdit: autRemoveEdit});
        })
        .catch(error => {
            res.status(500).render("errors/error", {numError: 500, error: error});
        });
};

restaurantsController.createRestaurant = function(req, res) {
    let action = "";
    let voltar = "";

    if (!req.cookies || !req.cookies.priority) {
        return res.status(403).render("errors/error", { numError: 403 });
    }

    const priority = req.cookies.priority;

    switch (res.locals.currentPage) {
        case "/restaurants/createRestaurant": {
            if (priority === "Dono" || priority === "Admin") {
                action = "/restaurants/saveRestaurant";
                voltar = "/restaurants/"
            } else {
                return res.status(403).render("errors/error", {numError: 403});
            }
            break;
        } case "/perfil/admin/listRestaurants/createRestaurant": {
            if (priority !== "Admin") {
                return res.status(403).render("errors/error", {numError: 403});
            }
            
            action = "/perfil/admin/listRestaurants/saveRestaurant";
            voltar = "/perfil/admin/listRestaurants";
            break;
        } case "/registRestaurant": {
            if (priority === "Dono" || priority === "Cliente") {
                action = "/registRestaurant/saveRestaurant";
                voltar = "/";
            } else {
                return res.status(403).render("errors/error", {numError: 403});
            }
            break;
        } default: {
            action = "";
            voltar = "";
            return res.status(404).render("erros/error404");
        }
    }

    res.render('restaurants/crudRestaurantes/addRestaurant', {action: action, voltar: voltar});
};

restaurantsController.search = async function(req, res) {
    try {
        let query = {};
        const { name = '', city = '', order = 'no'} = req.query;
        query.aprove = true;
        
        if (name) {
          query.name = { "$regex": name, "$options": "i" };
        }
      
        if (city) {
            query["address.city"] = { "$regex": city, "$options": "i" };
        }

        let sortObj = null;
        switch (order) {
            case 'nameAsc': {
                sortObj = { name: 1 };
                break;
            } case 'nameDesc': {
                sortObj = { name: -1 };
                break;
            } default: {
                break;
            }
        }
        
        let restaurants = null;    
        if (sortObj) {
            restaurants = await Restaurant.find(query).sort(sortObj).exec(); 
        } else {
            restaurants = await Restaurant.find(query).exec()
        }
        
        const paginaAtual = res.locals.currentPage; 
        
        switch(paginaAtual) {
            case "/restaurants/search": {
                let autRemoveEdit = [];

                if (req.cookies && req.cookies.priority && req.cookies.priority === "Dono") {
                    autRemoveEdit = getAutRemoveEdit(restaurants)
                }
                res.render("restaurants/restaurants", {restaurants: restaurants, filters: {name, city, order}, autRemoveEdit: autRemoveEdit });
                break;
            } case "/perfil/admin/listRestaurants/search": {
                existsRestaurantsDesaprove()
                .then(exists => {
                    res.render("perfil/admin/PagesAdmin/Restaurant/listRestaurants", {restaurants: restaurants, filters: {name, city, order}, desaprove: exists});
                });
                break;
            } default: {
                console.log("Pagina inválida")
                break;
            }
        }
    } catch(error) {
        res.status(500).render("errors/error", {numError: 500, error: error});
    } 
};

//Armazena um novo restaurate
restaurantsController.saveRestaurant = async function(req, res) {
    try { 
        await saveImage(req, res);
        
        const {name, sigla, nif, phoneNumber, email, password, confirmPassword, street, postal_code,
                city, description, maxOrdersPerClient, maximumRadiusDelivery, timeConfection,
                timeDelivery, openingTime, closingTime} = req.body;
    
        const openingSeconds = covertTimeToSeconds(openingTime);
        const closingSeconds = covertTimeToSeconds(closingTime); 
        const validation = await validationRestaurant(name, nif, phoneNumber, email, password, confirmPassword, 
            street, postal_code, city, maxOrdersPerClient, maximumRadiusDelivery, timeConfection,
            timeDelivery, openingSeconds, closingSeconds);
        
        if (validation.length > 0) {
            console.log("Validation:", validation)
            return res.status(500).render("errors/error", {numError: 500, error: validation});
        }

        //Ir buscar e guardar o caminho da imagem
        let pathImage = req.file?.path || '';
        const caminhoCorrigido = "/" + pathImage.replace(/^public[\\/]/, "");

        //Cryptografia da password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        let aproved = false;
        const cookie = req.cookies.priority
        
        if (cookie === "Admin") {
            aproved = true;
        }

        const perfil = new Perfil({
            perfilPhoto: caminhoCorrigido,
            email: email,
            password: hashedPassword,
            phoneNumber: phoneNumber,
            priority: "Restaurant",
            ownersIds: [],
        });

        const address = new Address({
            street: street,
            postal_code: postal_code,
            city: city
        });

        let restaurant = new Restaurant({
            name: name,
            perfil: perfil,
            sigla: sigla,
            nif: nif, 
            address: address,
            description: description,
            aprove: aproved,
            maxOrdersPerClient: maxOrdersPerClient,
            maximumRadiusDelivery: maximumRadiusDelivery,
            timeConfection: timeConfection,
            timeDelivery: timeDelivery,
            openingTime: openingSeconds,
            closingTime: closingSeconds,
        });

        if (cookie === "Cliente" || cookie === "Dono") {
            restaurant.tempUserId = req.user.userId;
        } 

        // Guarda o restaurante a bd
        await restaurant.save();

        switch (res.locals.currentPage) {
            case "/restaurants/saveRestaurant": {
                res.redirect("/restaurants");
                break;
            } case "/perfil/admin/listRestaurants/saveRestaurant": {
                res.redirect("/perfil/admin/listRestaurants")
                break;
            } case "/registRestaurant/saveRestaurant": {
                res.redirect("/");
                break;
            } default: {
                console.log("Parou no break, logo não sei que pagina redirecionar");
                break;
            }
        }
    } catch (error) {
        console.log("Error", error);
        res.status(500).redirect(res.locals.previousPage);
    }
};

//Carrega a pagina para editar um restaurante
restaurantsController.editRestaurant = (req, res) => {
    const restaurantId = req.params.restaurantId;
    Restaurant.findById(restaurantId).exec()
        .then(restaurant => {
            if (!restaurant) {
                console.log("Restaurante não encontrado")
                return res.status(404).render(res.locals.previousPage);
            }
            
            let action = "";
            let voltar = "";
        
            //Tirar os %20 por espaços na url
            const current = decodeURIComponent(res.locals.currentPage);
            switch (current) {
                case `/restaurants/editRestaurant/${restaurantId}`: {
                    action = `/restaurants/updatRestaurant/${restaurantId}`;
                    voltar = "/restaurants/"
                    break;
                } case `/perfil/admin/listRestaurants/editRestaurant/${restaurantId}`: {
                    action = `/perfil/admin/listRestaurants/updatRestaurant/${restaurantId}`;
                    voltar = "/perfil/admin/listRestaurants";
                    break;
                } case `/restaurants/${req.params.restaurant}/editDados/${restaurantId}`: {
                    action = `/restaurants/${req.params.restaurant}/updateDados/${restaurantId}`;
                    voltar = `/restaurants/${req.params.restaurant}`;
                    break;
                } default: {
                    action = "";
                    voltar = "";
                    break;
                }
            }
            
            res.render('restaurants/crudRestaurantes/editRestaurant', { restaurant: restaurant, priority: req.cookies.priority, action: action, voltar: voltar });
        })
        .catch(error => {
            console.log("Error", error);
            res.redirect(res.locals.previousPage);
        });
};

/**
 * * Metodo para atualizar os dados de um restaurante
 */
restaurantsController.updatRestaurant = async (req, res) => {
    try {
        //Upload da nova imagem se necessário
        const restId = req.params.restaurantId;
        if(!restId) {
            console.log("O id do restaurante é obrigatório");
            return res.status(404).render('errors/error', { numError: 404});
        }

        let restaurant = await Restaurant.findById(restId).exec();

        if (!restaurant) {
            console.log("O restaurante não foi encontrado")
            return res.status(404).render('errors/error', { numError: 404});
        }

        await updateImage(req, res, restaurant);

        const {name, sigla, nif, phoneNumber, email, street, postal_code,
                city, description, maxOrdersPerClient, maximumRadiusDelivery, timeConfection,
                timeDelivery, openingTime, closingTime} = req.body;

        console.log("Req.body: ", req.body);
        const openingSeconds = covertTimeToSeconds(openingTime);
        const closingSeconds = covertTimeToSeconds(closingTime); 
        //Validações
        let validation = await validationEditRestaurant(name, nif, phoneNumber, email, street, 
            postal_code, city, maxOrdersPerClient, maximumRadiusDelivery, timeConfection,
            timeDelivery, openingSeconds, closingSeconds, restaurant);

        if (validation.length > 0) {
            console.error(validation);
            return res.status(500).render("errors/error", {numError: 500, error: validation});
        } 

        //Altera a pasta e tem de alterar também o caminho para a logo
        //Dasdos da nova imagem
        let caminhoCorrigido = restaurant.perfil.perfilPhoto;
        let pathNewImg = req.file?.path || '';

        if (restaurant.name !== name || pathNewImg !== '') {
            let newImage = '';

            if (pathNewImg !== '') {
                newImage =  pathR.basename(pathNewImg);
            }
    
            //Dados da imagem guardada no mongoDb
            let newFile = "";
  
            const perfilPhoto = pathR.basename(caminhoCorrigido); //Saca a imagem do caminho
    
            /*
            O 1º if acontece quando não se altera a imagem 
            O 2º if, quando se altera a imagem 
            */
            if (pathNewImg === '' && restaurant.name !== name) {
                newFile = "public/images/Restaurants/" + name;
                let pathPerfilPhoto = "public/images/Restaurants/" + restaurant.name;
                await updatePackage(pathPerfilPhoto, newFile);
                newFile = newFile + "/" + perfilPhoto;
                caminhoCorrigido = "/" + newFile.replace(/^public[\\/]/, "");
            } else if (perfilPhoto !== newImage) {
                if (restaurant.name !== name) {
                    newFile = "public/images/Restaurants/" + name + "/" + newImage;
                } else {
                    newFile = "public/images/Restaurants/" + restaurant.name + "/" + newImage;
                }
    
                deleteImage(`public/images/Restaurants/${name}/${perfilPhoto}`);
                caminhoCorrigido = "/" + newFile.replace(/^public[\\/]/, "");
            }
        }
        
        restaurant.name = name;
        restaurant.perfil.email = email;
        restaurant.perfil.phoneNumber = phoneNumber;
        restaurant.perfil.perfilPhoto = caminhoCorrigido;
        restaurant.sigla = sigla;
        restaurant.nif = nif, 
        restaurant.address.street = street,
        restaurant.address.postal_code = postal_code,
        restaurant.address.city = city;
        restaurant.description = description; 
        restaurant.maxOrdersPerClient = maxOrdersPerClient;
        restaurant.maximumRadiusDelivery = maximumRadiusDelivery;
        restaurant.timeConfection = timeConfection;
        restaurant.timeDelivery = timeDelivery;
        restaurant.openingTime = openingSeconds;
        restaurant.closingTime = closingSeconds;

        await restaurant.save();
        console.log("Restaurante atualizado com sucesso");

        switch(res.locals.currentPage) {
            case `/restaurants/updatRestaurant/${req.params.restaurantId}`: {
                res.redirect("/restaurants");
                break;
            } case `/perfil/admin/listRestaurants/updatRestaurant/${req.params.restaurantId}`: {
                res.redirect("/perfil/admin/listRestaurants");
                break;
            } case `/restaurants/${req.params.restaurant}/updateDados/${req.params.restaurantId}`: {
                res.redirect(`/restaurants/${req.params.restaurant}`);
                break;
            } default: {
                res.redirect(res.locals.previousPage);
                console.log("URL Inválida");
                break;
            }
        }
    } catch (error) {
        console.log("Error", error);

        switch(res.locals.currentPage) {
            case `/restaurants/updatRestaurant/${req.params.restaurantId}`: {
                res.stauts(500).redirect(`/restaurants/updatRestaurant/${req.params.restaurantId}`);
                break;
            } case `/perfil/admin/listRestaurants/updatRestaurant/${req.params.restaurantId}`: {
                res.stauts(500).redirect(`/perfil/admin/listRestaurants/updatRestaurant/${req.params.restaurantId}`);
                break;
            } default: {
                res.stauts(500).redirect(res.locals.previousPage);
                console.log("URL Inválida");
                break;
            }
        }
    }
};

/**
 * * Metodo para remover um restaurant
 */
restaurantsController.removeRestaurant = async (req, res) => {
    try {
        let restaurant = await Restaurant.findOne({ name: req.params.restaurant });

        if(!restaurant) {
            console.log("O restaurante a eliminar não existe!");
            return res.status(404).redirect(res.locals.previousPage);
        }

        //Remoção dos Ids do restaurante
        await User.updateMany(
            { _id: { $in: restaurant.perfil.ownersIds } },
            { 
                $pull: { 'perfil.restaurantIds': restaurant._id }
            }
        );
        
        //Para os que ficaram com o array vazio, transformamolos em clientes
        await User.updateMany(
            { 
                _id: { $in: restaurant.perfil.ownersIds },
                'perfil.restaurantIds': { $size: 0 } 
            },
            { 
                $set: { 'perfil.priority': 'Cliente' },
                $unset: { 'perfil.restaurantIds': "" } 
            }
        );

        deletePackage(`public/images/Restaurants/${req.params.restaurant}/`);
        await restaurant.deleteOne();
        res.redirect(res.locals.previousPage);
    } catch (error) {
        res.status(500).render("errors/error", {numError: 500, error: error});
    }
};

module.exports = restaurantsController;