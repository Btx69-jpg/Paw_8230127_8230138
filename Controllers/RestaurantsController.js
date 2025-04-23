var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const pathR = require('path');

//Models
var Restaurant = require("../Models/Perfils/Restaurant");
var User = require("../Models/Perfils/User"); 
var Address = require("../Models/Address/Address");
var Perfil = require("../Models/Perfils/Perfil");
var restaurantsController = {};

//Metodos
const { updatePackage, deletePackage } = require('./Functions/crudPackage');
const { deleteImage, saveImage, updateImage } = require("./Functions/crudImagesRest");
const { existsRestaurantsDesaprove } = require("./ControllersAdmin/ListRestaurantController");

//Constantes
const totRestaurant = 15; 

async function validationRestaurant(name, nif, phoneNumber, email, password, confirmPassword, 
    street, postal_code, city) {
    
    const restaurants = await Restaurant.find({}).exec();
    // Verifica se o limite de restaurantes foi atingido
    if (restaurants.length >= totRestaurant) {
        return "Não é possivel criar mais restaurantes";
    }

    if (name === undefined || nif === undefined || phoneNumber === undefined ||
        email === undefined || password === undefined || 
        confirmPassword === undefined || street === undefined ||
        postal_code === undefined || city === undefined) {
        return "Alguns dos campos obrigatórios não está preenchido";
    }

    if (password !== confirmPassword) { 
        return "As passwords não coincidem";
    }

    let find = false;
    let i = 0;
    let problem = "";

    // Verifica se já existe um restaurante com o mesmo nome, NIF, email ou número de telefone
    while (i < restaurants.length && !find) {
        if (restaurants[i].name === name) {
            problem = "Já existe um restaurante com esse nome";
            find = true;
        } else if (restaurants[i].nif === nif) {
            problem = "Já existe um restaurante com esse NIF";
            find = true;
        } else if (restaurants[i].perfil.email === email) {
            problem = "Já existe um restaurante com esse email";
            find = true;
        } else if (restaurants[i].perfil.phoneNumber === phoneNumber) {
            problem = "Já existe um restaurante com esse numero telefonico";
            find = true;
        }
        i++;
    }

    return problem;
}

async function validationEditRestaurant(body, restaurant) {
    if (body.name === undefined || body.nif === undefined || body.phoneNumber === undefined ||
        body.email === undefined || body.street === undefined || body.postal_code === undefined || 
        body.city === undefined) {
        return "Alguns dos campos obrigatórios não está preenchido";
    }

    let find = false;
    let i = 0;
    let problem = "";
    const restaurants = await Restaurant.find({}).exec();

    // Verifica se já existe um restaurante com o mesmo nome, NIF, email ou número de telefone
    while (i < restaurants.length && !find) {
        if (restaurant.name !== body.name && restaurants[i].name === body.name) {
            problem = "Já existe um restaurante com esse nome";
            find = true;
        } else if (restaurant.nif !== body.nif && restaurants[i].nif === body.nif) {
            problem = "Já existe um restaurante com esse NIF";
            find = true;
        } else if (restaurant.perfil.email !== body.email && restaurants[i].perfil.email === body.email) {
            problem = "Já existe um restaurante com esse email";
            find = true;
        } else if (restaurant.perfil.phoneNumber !== body.phoneNumber && restaurants[i].perfil.phoneNumber === body.phoneNumber) {
            problem = "Já existe um restaurante com esse numero telefonico";
            find = true;
        }
        i++;
    }

    return problem;
}

//Meter aqui verificações para caso o user esteja logado não seja possivel reencaminha-lo
//Preciso de no render mandar também os employees
restaurantsController.restaurantsPage = function(req, res) {
    Restaurant.find({ aprove: true}).exec()
        .then(restaurants => {
            let autRemoveEdit = false;

            if(req.cookies && req.cookies.priority) {
                switch(req.cookies.priority) {
                    case "Admin": {
                        autRemoveEdit = true;
                        break;
                    } case "Dono": {
                        const user = res.locals.user;
                        let i = 0;
                        let found = false;

                        while (i < user.perfil.restaurantIds && !found) {
                            let y = 0;

                            while (y < restaurants.length && !found) {
                                if(user.perfil.restaurantIds[i] === restaurants[y]) {
                                    found = true;
                                } 
                                y++
                            }
                        }

                        if(found) {
                            autRemoveEdit = true;
                        }

                        break;
                    } default: {
                        autRemoveEdit = false;
                        break;
                    }
                }
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

    switch (res.locals.currentPage) {
        case "/restaurants/createRestaurant": {
            action = "/restaurants/saveRestaurant";
            voltar = "/restaurants/"
            break;
        } case "/perfil/admin/listRestaurants/createRestaurant": {
            action = "/perfil/admin/listRestaurants/saveRestaurant";
            voltar = "/perfil/admin/listRestaurants";
            break;
        } case "/registRestaurant": {
            action = "/registRestaurant/saveRestaurant";
            voltar = "/";
            break;
        } default: {
            action = "";
            voltar = "";
            break;
        }
    }

    console.log("Ação: ", action);
    console.log("Voltar: ", voltar);
    res.render('restaurants/crudRestaurantes/addRestaurant', {action: action, voltar: voltar});
};

//Filtra por restaurantes (Reutilizar codigo também no admin)
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
                res.render("restaurants/restaurants", {restaurants: restaurants, filters: {name, city, order} });
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
        
        //Realização das verificações
        const {name, sigla, nif, phoneNumber, email, password, confirmPassword, street, postal_code,
            city, description} = req.body;

        let validation = await validationRestaurant(name, nif, phoneNumber, email, password, confirmPassword, 
            street, postal_code, city);
        
        if (validation !== "") {
            return res.status(500).render("errors/error", {numError: 500, error: validation});
        }

        //Ir buscar e guardar o caminho da imagem
        let pathImage = req.file?.path || '';
        const caminhoCorrigido = "/" + pathImage.replace(/^public[\\/]/, "");
        //Cryptografia da password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        
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
        });

        if(cookie === "Cliente" || cookie === "Dono") {
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
            }default: {
                console.log("Parou no break, logo não sei que pagina redirecionar");
                break;
            }
        }
    } catch (error) {
        console.log("Error", error);
        res.redirect(res.locals.previousPage);
    }
};

//Carrega a pagina para editar um restaurante (finalizado) 
restaurantsController.editRestaurant = (req, res) => {
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
    console.log();
    console.log("------------------------------");
    const restaurantId= req.params.restaurantId;
    Restaurant.findOne({ _id: restaurantId }).exec()
        .then(restaurant => {
            let action = "";
            let voltar = "";
        
            switch (res.locals.currentPage) {
                case `/restaurants/editRestaurant/${restaurantId}`: {
                    action = `/restaurants/updatRestaurant/${restaurantId}`;
                    voltar = "/restaurants/"
                    break;
                } case `/perfil/admin/listRestaurants/editRestaurant/${restaurantId}`: {
                    action = `/perfil/admin/listRestaurants/updatRestaurant/${restaurantId}`;
                    voltar = "/perfil/admin/listRestaurants";
                    break;
                } default: {
                    action = "";
                    voltar = "";
                    break;
                }
            }

            console.log("Ação: ", action);
            console.log("Voltar: ", voltar);
            res.render('restaurants/crudRestaurantes/editRestaurant', { restaurant: restaurant, priority: req.cookies.priority, action: action, voltar: voltar });
        })
        .catch(error => {
            console.log("Error", error);
            res.redirect(res.locals.previousPage);
        });
};

/**
 * Metodo para atualizar os dados de um restaurante
 */
restaurantsController.updatRestaurant = async (req, res) => {
    const restaurant = await Restaurant.findOne({ _id: req.params.restaurantId }).exec();
    try {
        //Upload da nova imagem se necessário
        await updateImage(req, res, restaurant);
        
        //Validações
        let validation = await validationEditRestaurant(req.body, restaurant);
        if (validation !== "") {
            return res.status(500).render("errors/error", {numError: 500, error: validation});
        } 

        //Altera a pasta e tem de alterar também o caminho para a logo
        //Dasdos da nova imagem
        let caminhoCorrigido = restaurant.perfil.perfilPhoto;
        let pathNewImg = req.file?.path || '';

        if (restaurant.name !== req.body.name || pathNewImg !== '') {
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
            if (pathNewImg === '' && restaurant.name !== req.body.name) {
                newFile = "public/images/Restaurants/" + req.body.named;
                let pathPerfilPhoto = "public/images/Restaurants/" + restaurant.name;
                await updatePackage(pathPerfilPhoto, newFile);
                newFile = newFile + "/" + perfilPhoto;
                caminhoCorrigido = "/" + newFile.replace(/^public[\\/]/, "");
            } else if (perfilPhoto !== newImage) {
                if (restaurant.name !== req.body.name) {
                    newFile = "public/images/Restaurants/" + req.body.name + "/" + newImage;
                } else {
                    newFile = "public/images/Restaurants/" + restaurant.name + "/" + newImage;
                }
    
                deleteImage(`public/images/Restaurants/${req.body.name}/${perfilPhoto}`);
                caminhoCorrigido = "/" + newFile.replace(/^public[\\/]/, "");
            }
        }

        await Restaurant.findByIdAndUpdate(req.params.restaurantId, { 
            $set: {
                name: req.body.name,
                'perfil.email': req.body.email,
                'perfil.phoneNumber': req.body.phoneNumber,
                'perfil.perfilPhoto': caminhoCorrigido,
                sigla: req.body.sigla,
                nif: req.body.nif, 
                'address.street': req.body.street,
                'address.postal_code': req.body.postal_code,
                'address.city': req.body.city,
                description: req.body.description 
            },
        }, { new: true });
        
        console.log("Restaurante atualizado com sucesso");

        switch(res.locals.currentPage) {
            case `/restaurants/updatRestaurant/${req.params.restaurantId}`: {
                res.redirect("/restaurants");
                break;
            } case `/perfil/admin/listRestaurants/updatRestaurant/${req.params.restaurantId}`: {
                res.redirect("/perfil/admin/listRestaurants");
                break;
            } default: {
                console.log("URL Inválida");
                break;
            }
        }
    } catch (error) {
        console.log("Error", error);

        switch(res.locals.currentPage) {
            case `/restaurants/updatRestaurant/${req.params.restaurantId}`: {
                res.redirect(`/restaurants/updatRestaurant/${req.params.restaurantId}`);
                break;
            } case `/perfil/admin/listRestaurants/updatRestaurant/${req.params.restaurantId}`: {
                res.redirect(`/perfil/admin/listRestaurants/updatRestaurant/${req.params.restaurantId}`);
                break;
            } default: {
                console.log("URL Inválida");
                break;
            }
        }
    }
};

/* Metodo para remover um restaurant */
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
        console.log("Restaurante eliminado!");
        res.redirect(res.locals.previousPage);
    } catch (error) {
        res.status(500).render("errors/error", {numError: 500, error: error});
    }
};

module.exports = restaurantsController;